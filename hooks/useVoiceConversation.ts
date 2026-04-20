"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { VoiceState } from "@/components/ui/voice-companion-bar";
import type { AudioLevels } from "./useAudioAnalysis";
import { getKey } from "@/lib/key-store";
import { addMemory, isMemoryEnabled } from "@/app/components/memory-drawer";

interface UseVoiceConversationOptions {
  activePersonaId?: string;
  onAudioLevelsChange?: (levels: AudioLevels) => void;
}

const getSpeechRecognition = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useVoiceConversation({
  activePersonaId = "coach",
  onAudioLevelsChange,
}: UseVoiceConversationOptions = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");

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
      setVoiceState("speaking");
      try {
        const elevenlabsStored = getKey("elevenlabs");
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, apiKey: elevenlabsStored?.key ?? null }),
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
    [startTtsAnalysis, stopTtsAnalysis],
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
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: text }],
            provider: providerInfo.provider,
            model: providerInfo.model,
            apiKey: providerInfo.key,
            persona: activePersonaId,
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
          if (isMemoryEnabled() && text.length > 10) {
            addMemory({ content: text, tags: ["voice"], source: "voice" });
          }
          await speak(fullText);
        } else {
          setVoiceState("idle");
          setTranscript("");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
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
      stopAll();
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
  }, [sendToAI, stopAll]);

  const interrupt = useCallback(() => stopAll(), [stopAll]);

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
