"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { VoiceState } from "@/components/ui/voice-companion-bar";
import type { AudioLevels } from "./useAudioAnalysis";
import { getKey } from "@/lib/key-store";
import { useVoiceSettings } from "@/hooks/useVoiceSettings";
import { addMemory, isMemoryEnabled, loadMemories } from "@/app/components/memory-drawer";

interface UseVoiceConversationOptions {
  activePersonaId?: string;
  onAudioLevelsChange?: (levels: AudioLevels) => void;
}

const getSpeechRecognition = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

function autoVoiceTags(content: string): string[] {
  const lower = content.toLowerCase();
  const tags: string[] = ["voice"];
  if (/\b(goal|want to|trying to|plan|aim|working on|building)\b/.test(lower)) tags.push("goals");
  if (/\b(feel|feeling|emotion|mood|anxious|happy|sad|stress|nervous|excited)\b/.test(lower)) tags.push("feelings");
  if (/\b(work|job|project|career|boss|colleague|client)\b/.test(lower)) tags.push("work");
  if (/\b(friend|family|partner|relationship|mom|dad|brother|sister)\b/.test(lower)) tags.push("people");
  if (/\b(like|love|enjoy|prefer|favorite|hate|dislike)\b/.test(lower)) tags.push("preferences");
  return tags;
}

function buildMemoryContext(): string {
  const memories = loadMemories();
  if (memories.length === 0) return "";
  return memories
    .slice(0, 8)
    .map((memory) => `- ${memory.content.slice(0, 120)}`)
    .join("\n");
}

function saveVoiceMemory(text: string): void {
  if (!isMemoryEnabled() || text.length <= 10) return;
  addMemory({
    content: text,
    tags: autoVoiceTags(text),
    source: "voice",
  });
}

export function useVoiceConversation({
  activePersonaId = "coach",
  onAudioLevelsChange,
}: UseVoiceConversationOptions = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const { settings: voiceSettings, elevenLabsSettings, voiceId } = useVoiceSettings();

  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  // Ref mirror so callbacks always see current state without stale closures
  const voiceStateRef = useRef<VoiceState>("idle");

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // ── TTS analysis loop — drives avatar while DOT speaks ──────────────────
  const startTtsAnalysis = useCallback(
    (analyser: AnalyserNode) => {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const sampleRate = analyser.context.sampleRate;
      const binWidth = sampleRate / analyser.fftSize;

      const getAvg = (minHz: number, maxHz: number) => {
        const minBin = Math.floor(minHz / binWidth);
        const maxBin = Math.min(Math.ceil(maxHz / binWidth), freqData.length - 1);
        if (minBin >= maxBin) return 0;
        let sum = 0;
        for (let i = minBin; i <= maxBin; i++) sum += freqData[i];
        return sum / ((maxBin - minBin + 1) * 255);
      };

      const loop = () => {
        analyser.getByteFrequencyData(freqData);
        let rmsSum = 0;
        for (let i = 0; i < freqData.length; i++) {
          const n = freqData[i] / 255;
          rmsSum += n * n;
        }
        onAudioLevelsChange?.({
          bass: getAvg(60, 250),
          lowMid: getAvg(250, 500),
          mid: getAvg(500, 2000),
          highMid: getAvg(2000, 4000),
          presence: getAvg(4000, 8000),
          overall: Math.sqrt(rmsSum / freqData.length),
          frequencyData: new Uint8Array(freqData),
        });
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    },
    [onAudioLevelsChange],
  );

  const stopTtsAnalysis = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── TTS playback ─────────────────────────────────────────────────────────
  const speak = useCallback(
    async (text: string) => {
      if (!voiceSettings.autoSpeak) {
        setVoiceState("idle");
        setTranscript("");
        return;
      }

      setVoiceState("speaking");
      try {
        const elevenlabsStored = getKey("elevenlabs");
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(elevenlabsStored?.key
              ? { "x-dot-api-key": elevenlabsStored.key }
              : {}),
          },
          body: JSON.stringify({
            text,
            voiceId,
            voiceSettings: elevenLabsSettings,
          }),
        });

        if (!res.ok) throw new Error("TTS request failed");

        const arrayBuffer = await res.arrayBuffer();

        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
          audioCtxRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") await ctx.resume();

        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        try {
          ttsSourceRef.current?.stop();
        } catch {
          /* noop */
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        ttsSourceRef.current = source;

        startTtsAnalysis(analyser);
        source.start(0);
        source.onended = () => {
          stopTtsAnalysis();
          setVoiceState("idle");
          setTranscript("");
        };
      } catch {
        // Browser SpeechSynthesis fallback when ElevenLabs key is missing
        stopTtsAnalysis();
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = elevenLabsSettings.speed;
          utt.pitch =
            voiceSettings.profile === "late-night"
              ? 0.85
              : voiceSettings.profile === "guide"
                ? 1.05
                : 0.95 + (voiceSettings.warmth / 100) * 0.12;
          utt.onend = () => {
            setVoiceState("idle");
            setTranscript("");
          };
          window.speechSynthesis.speak(utt);
        } else {
          setVoiceState("idle");
          setTranscript("");
        }
      }
    },
    [elevenLabsSettings, startTtsAnalysis, stopTtsAnalysis, voiceId, voiceSettings],
  );

  // ── Send transcript to AI ─────────────────────────────────────────────────
  const sendToAI = useCallback(
    async (text: string) => {
      setVoiceState("thinking");
      try {
        const providerInfo = (() => {
          for (const p of ["openai", "google"] as const) {
            const stored = getKey(p);
            if (stored)
              return {
                provider: p,
                key: stored.key,
                model:
                  stored.model ||
                  (p === "openai" ? "gpt-4o-mini" : "gemini-2.0-flash"),
              };
          }
          return null;
        })();

        if (!providerInfo) {
          setVoiceState("error");
          setTimeout(() => setVoiceState("idle"), 2000);
          return;
        }

        abortRef.current = new AbortController();
        const memoryContext = buildMemoryContext();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-dot-api-key": providerInfo.key,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: text }],
            provider: providerInfo.provider,
            model: providerInfo.model,
            persona: activePersonaId,
            memoryContext: memoryContext || undefined,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value, { stream: true });
          }
        }

        if (fullText) {
          saveVoiceMemory(text);
          await speak(fullText);
        } else {
          setVoiceState("idle");
          setTranscript("");
        }
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setVoiceState("error");
          setTimeout(() => setVoiceState("idle"), 2000);
        }
      }
    },
    [activePersonaId, speak],
  );

  // ── Stop everything ───────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    try {
      ttsSourceRef.current?.stop();
    } catch {
      /* noop */
    }
    stopTtsAnalysis();
    abortRef.current?.abort();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setVoiceState("idle");
    setTranscript("");
  }, [stopTtsAnalysis]);

  // ── Mic toggle: start listening or interrupt if active ────────────────────
  const toggleMic = useCallback(() => {
    if (voiceStateRef.current !== "idle") {
      if (voiceSettings.interruptible) stopAll();
      return;
    }

    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) {
      setVoiceState("error");
      setTimeout(() => setVoiceState("idle"), 2000);
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setVoiceState("listening");

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);
      if (result.isFinal) {
        recognition.stop();
        recognitionRef.current = null;
        sendToAI(text);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        setVoiceState("idle");
      } else if (event.error !== "aborted") {
        setVoiceState("error");
        setTimeout(() => setVoiceState("idle"), 2000);
      }
    };

    recognition.onend = () => {
      if (voiceStateRef.current === "listening") setVoiceState("idle");
    };

    recognition.start();
  }, [sendToAI, stopAll, voiceSettings.interruptible]);

  const interrupt = useCallback(() => {
    if (voiceSettings.interruptible) stopAll();
  }, [stopAll, voiceSettings.interruptible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      try {
        ttsSourceRef.current?.stop();
      } catch {
        /* noop */
      }
      stopTtsAnalysis();
      abortRef.current?.abort();
      audioCtxRef.current?.close();
    };
  }, [stopTtsAnalysis]);

  return { voiceState, transcript, toggleMic, interrupt };
}
