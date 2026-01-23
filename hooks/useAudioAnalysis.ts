"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Audio frequency bands mapped to avatar features.
 */
export interface AudioLevels {
  /** 60-250 Hz - Container breathing/scale */
  bass: number;
  /** 250-500 Hz - Mouth opening (primary) */
  lowMid: number;
  /** 500-2000 Hz - Mouth width variation */
  mid: number;
  /** 2000-4000 Hz - Eye subtle pulse */
  highMid: number;
  /** 4000-8000 Hz - Micro glances / blinks */
  presence: number;
  /** Overall RMS level (0-1) */
  overall: number;
  /** Raw frequency data for spectrum visualizer */
  frequencyData: Uint8Array | null;
}

export type AudioSourceType = "microphone" | "element" | "file";

interface UseAudioAnalysisOptions {
  /** FFT size for frequency analysis (power of 2, 32-32768). Higher = more precision, more latency. */
  fftSize?: number;
  /** Smoothing time constant (0-1). Higher = smoother but less responsive. */
  smoothingTimeConstant?: number;
  /** Whether to start analysis immediately when source is available */
  autoStart?: boolean;
}

const DEFAULT_OPTIONS: Required<UseAudioAnalysisOptions> = {
  fftSize: 256,
  smoothingTimeConstant: 0.6,
  autoStart: true,
};

const ZERO_LEVELS: AudioLevels = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  presence: 0,
  overall: 0,
  frequencyData: null,
};

/**
 * Hook for analyzing audio and extracting frequency bands for avatar reactivity.
 * Supports microphone input, audio elements, and audio files.
 */
export function useAudioAnalysis(options: UseAudioAnalysisOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Core Web Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [levels, setLevels] = useState<AudioLevels>(ZERO_LEVELS);
  const [error, setError] = useState<string | null>(null);
  
  // Frequency data buffer (reused to avoid GC)
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  
  /**
   * Initialize AudioContext and AnalyserNode
   */
  const initializeContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = opts.fftSize;
      analyser.smoothingTimeConstant = opts.smoothingTimeConstant;
      analyserRef.current = analyser;
      
      // Pre-allocate frequency data buffer
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      
      return ctx;
    } catch (e) {
      setError("Web Audio API not supported");
      return null;
    }
  }, [opts.fftSize, opts.smoothingTimeConstant]);
  
  /**
   * Extract frequency bands from analyser data.
   * Maps FFT bins to our 5-band model.
   */
  const extractBands = useCallback(() => {
    const analyser = analyserRef.current;
    const frequencyData = frequencyDataRef.current;
    if (!analyser || !frequencyData) return ZERO_LEVELS;
    
    analyser.getByteFrequencyData(frequencyData);
    
    const binCount = analyser.frequencyBinCount;
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binWidth = sampleRate / (opts.fftSize);
    
    // Helper to get average level for a frequency range
    const getAverageLevel = (minHz: number, maxHz: number): number => {
      const minBin = Math.floor(minHz / binWidth);
      const maxBin = Math.min(Math.ceil(maxHz / binWidth), binCount - 1);
      
      if (minBin >= maxBin) return 0;
      
      let sum = 0;
      for (let i = minBin; i <= maxBin; i++) {
        sum += frequencyData[i];
      }
      return (sum / (maxBin - minBin + 1)) / 255; // Normalize to 0-1
    };
    
    // Calculate RMS for overall level
    let rmsSum = 0;
    for (let i = 0; i < binCount; i++) {
      const normalized = frequencyData[i] / 255;
      rmsSum += normalized * normalized;
    }
    const overall = Math.sqrt(rmsSum / binCount);
    
    return {
      bass: getAverageLevel(60, 250),
      lowMid: getAverageLevel(250, 500),
      mid: getAverageLevel(500, 2000),
      highMid: getAverageLevel(2000, 4000),
      presence: getAverageLevel(4000, 8000),
      overall,
      frequencyData: new Uint8Array(frequencyData), // Clone for external use
    };
  }, [opts.fftSize]);
  
  /**
   * Animation loop - runs at 60fps
   */
  const analysisLoop = useCallback(() => {
    if (!isAnalyzing) return;
    
    const newLevels = extractBands();
    setLevels(newLevels);
    
    animationFrameRef.current = requestAnimationFrame(analysisLoop);
  }, [isAnalyzing, extractBands]);
  
  /**
   * Start analysis loop
   */
  const startAnalysis = useCallback(() => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
  }, [isAnalyzing]);
  
  /**
   * Stop analysis loop
   */
  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setLevels(ZERO_LEVELS);
  }, []);
  
  /**
   * Connect to microphone input
   */
  const connectMicrophone = useCallback(async () => {
    const ctx = initializeContext();
    if (!ctx) return false;
    
    try {
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserRef.current!);
      sourceNodeRef.current = source;
      
      if (opts.autoStart) startAnalysis();
      return true;
    } catch (e) {
      setError("Microphone access denied or unavailable");
      return false;
    }
  }, [initializeContext, opts.autoStart, startAnalysis]);
  
  /**
   * Connect to an <audio> or <video> element
   */
  const connectElement = useCallback((element: HTMLAudioElement | HTMLVideoElement) => {
    const ctx = initializeContext();
    if (!ctx) return false;
    
    try {
      // Resume context if suspended
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const source = ctx.createMediaElementSource(element);
      source.connect(analyserRef.current!);
      analyserRef.current!.connect(ctx.destination); // Also connect to output so we hear it
      sourceNodeRef.current = source;
      
      if (opts.autoStart) startAnalysis();
      return true;
    } catch (e) {
      setError("Failed to connect audio element");
      return false;
    }
  }, [initializeContext, opts.autoStart, startAnalysis]);
  
  /**
   * Load and connect an audio file
   */
  const connectFile = useCallback(async (file: File | Blob) => {
    const ctx = initializeContext();
    if (!ctx) return null;
    
    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(analyserRef.current!);
      analyserRef.current!.connect(ctx.destination);
      
      // Return the buffer source so caller can control playback
      if (opts.autoStart) startAnalysis();
      return bufferSource;
    } catch (e) {
      setError("Failed to decode audio file");
      return null;
    }
  }, [initializeContext, opts.autoStart, startAnalysis]);
  
  /**
   * Disconnect current source
   */
  const disconnect = useCallback(() => {
    stopAnalysis();
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, [stopAnalysis]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [disconnect]);
  
  /**
   * Run analysis loop when isAnalyzing changes
   */
  useEffect(() => {
    if (isAnalyzing) {
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, analysisLoop]);
  
  return {
    // State
    levels,
    isAnalyzing,
    error,
    
    // Actions
    connectMicrophone,
    connectElement,
    connectFile,
    disconnect,
    startAnalysis,
    stopAnalysis,
  };
}
