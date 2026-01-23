"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceSynthesisOptions {
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
}

export function useVoiceSynthesis(options: UseVoiceSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // This hook will expose an AnalyserNode so we can visualize the voice
  // We'll return it so the main app can connect it to the AudioAnalysis hook
  const analyserRef = useRef<AnalyserNode | null>(null);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    try {
      setIsSpeaking(true);
      options.onAudioStart?.();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const arrayBuffer = await response.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Decode audio
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      // Stop previous
      if (sourceRef.current) {
        sourceRef.current.stop();
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create analyser if not exists or if context changed
      if (!analyserRef.current || analyserRef.current.context !== ctx) {
         analyserRef.current = ctx.createAnalyser();
         analyserRef.current.fftSize = 2048; // High res for good vis
      }
      
      const analyser = analyserRef.current;
      
      // Connect: Source -> Analyser -> Destination (Speakers)
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      sourceRef.current = source;
      source.start(0);
      
      source.onended = () => {
        setIsSpeaking(false);
        options.onAudioEnd?.();
      };
      
      return analyser; // Return analyser so we can hook into it
      
    } catch (error) {
      console.error("Speech Synthesis Error:", error);
      setIsSpeaking(false);
      options.onAudioEnd?.();
      return null;
    }
  }, [options]);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { 
    speak, 
    stop, 
    isSpeaking,
    analyserRef // Expose this to plug into useAudioAnalysis
  };
}
