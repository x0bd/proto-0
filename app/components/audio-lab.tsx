"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, Square, Upload, Music2 } from "lucide-react";
import type { EmotionState } from "../components/face/types";

interface AudioLabProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmotionChange?: (emotion: EmotionState) => void;
    onAudioLevelsChange?: (levels: any) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

// Simple emotion derivation from frequency bands
function deriveEmotion(bands: {
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    overall: number;
}): { emotion: EmotionState; label: string } {
    const { bass, lowMid, mid, highMid, presence, overall } = bands;

    // Energy metric
    const energy = overall;
    const brightness = (highMid + presence) / 2;
    const warmth = (bass + lowMid) / 2;
    const midPresence = mid;

    let joy = 0, sadness = 0, surprise = 0, anger = 0, curiosity = 0;

    // High energy + bright = joy
    joy = Math.min(1, (energy * 0.4 + brightness * 0.4 + midPresence * 0.2) * 2.5);
    // Low energy + warm = sadness
    sadness = Math.min(1, Math.max(0, (1 - energy) * 0.5 + warmth * 0.3 - brightness * 0.2) * 2);
    // Sudden spikes = surprise (high presence/highMid)
    surprise = Math.min(1, Math.max(0, (presence - 0.4) * 2 + (highMid - 0.35) * 1.5));
    // High bass + high energy = anger
    anger = Math.min(1, Math.max(0, (bass - 0.4) * 2 + (energy - 0.5) * 1.5 - brightness * 0.5));
    // Mid-range dominant = curiosity
    curiosity = Math.min(1, Math.max(0, midPresence * 1.8 - bass * 0.3));

    // Normalize so the dominant one is strong
    const max = Math.max(joy, sadness, surprise, anger, curiosity, 0.01);
    const scale = Math.min(1, 1.2 / max);

    const emotion: EmotionState = {
        joy: Math.min(1, joy * scale),
        sadness: Math.min(1, sadness * scale),
        surprise: Math.min(1, surprise * scale),
        anger: Math.min(1, anger * scale),
        curiosity: Math.min(1, curiosity * scale),
    };

    // Pick dominant label
    const entries: [string, number][] = [
        ["JOY", emotion.joy],
        ["SORROW", emotion.sadness],
        ["SHOCK", emotion.surprise],
        ["RAGE", emotion.anger],
        ["QUERY", emotion.curiosity],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    const label = entries[0][1] > 0.15 ? entries[0][0] : "NEUTRAL";

    return { emotion, label };
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioLab({
    open,
    onOpenChange,
    onEmotionChange,
    onAudioLevelsChange,
    accentColor = "#7c3aed",
    constraintsRef,
}: AudioLabProps) {
    const [fileName, setFileName] = React.useState<string | null>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [emotionLabel, setEmotionLabel] = React.useState("STANDBY");
    const [bands, setBands] = React.useState({ bass: 0, lowMid: 0, mid: 0, highMid: 0, presence: 0, overall: 0 });

    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const frequencyDataRef = React.useRef<Uint8Array | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const FFT_SIZE = 256;

    // Setup audio context and connect element
    const connectAudio = React.useCallback((audioEl: HTMLAudioElement) => {
        if (audioContextRef.current) {
            // Already connected, just resume
            audioContextRef.current.resume();
            return;
        }

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.65;
        analyserRef.current = analyser;

        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);

        const source = ctx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
    }, []);

    // Extract frequency bands from analyser
    const extractBands = React.useCallback(() => {
        const analyser = analyserRef.current;
        const freqData = frequencyDataRef.current;
        if (!analyser || !freqData) return null;

        // @ts-expect-error — TS lib types diverge between environments for Uint8Array
        analyser.getByteFrequencyData(freqData);

        const binCount = analyser.frequencyBinCount;
        const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
        const binWidth = sampleRate / FFT_SIZE;

        const getAvg = (minHz: number, maxHz: number): number => {
            const minBin = Math.floor(minHz / binWidth);
            const maxBin = Math.min(Math.ceil(maxHz / binWidth), binCount - 1);
            if (minBin >= maxBin) return 0;
            let sum = 0;
            for (let i = minBin; i <= maxBin; i++) sum += freqData[i];
            return sum / ((maxBin - minBin + 1) * 255);
        };

        let rmsSum = 0;
        for (let i = 0; i < binCount; i++) {
            const n = freqData[i] / 255;
            rmsSum += n * n;
        }

        return {
            bass: getAvg(60, 250),
            lowMid: getAvg(250, 500),
            mid: getAvg(500, 2000),
            highMid: getAvg(2000, 4000),
            presence: getAvg(4000, 8000),
            overall: Math.sqrt(rmsSum / binCount),
            frequencyData: new Uint8Array(freqData),
        };
    }, []);

    // Draw spectrum visualizer
    const drawSpectrum = React.useCallback((freqData: Uint8Array) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        }

        ctx.clearRect(0, 0, w, h);

        const barCount = Math.min(freqData.length, 48);
        const gap = 2;
        const barWidth = (w - gap * (barCount - 1)) / barCount;

        for (let i = 0; i < barCount; i++) {
            const val = freqData[i] / 255;
            const barHeight = Math.max(1, val * h * 0.9);
            const x = i * (barWidth + gap);
            const y = h - barHeight;

            // Gradient from accent to dim
            const intensity = val;
            const r = parseInt(accentColor.slice(1, 3), 16);
            const g = parseInt(accentColor.slice(3, 5), 16);
            const b = parseInt(accentColor.slice(5, 7), 16);

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})`;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Peak dot
            if (val > 0.1) {
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
                ctx.fillRect(x, y, barWidth, Math.min(2, barHeight));
            }
        }
    }, [accentColor]);

    // Analysis loop
    const analysisLoop = React.useCallback(() => {
        const result = extractBands();
        if (result) {
            setBands({
                bass: result.bass,
                lowMid: result.lowMid,
                mid: result.mid,
                highMid: result.highMid,
                presence: result.presence,
                overall: result.overall,
            });

            // Feed audio levels to avatar
            onAudioLevelsChange?.(result);

            // Derive emotion from bands
            const { emotion, label } = deriveEmotion(result);
            setEmotionLabel(label);
            onEmotionChange?.(emotion);

            // Draw spectrum
            if (result.frequencyData) {
                drawSpectrum(result.frequencyData);
            }
        }

        // Update time
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }

        rafRef.current = requestAnimationFrame(analysisLoop);
    }, [extractBands, drawSpectrum, onEmotionChange, onAudioLevelsChange]);

    // Start/Stop analysis
    React.useEffect(() => {
        if (isPlaying) {
            rafRef.current = requestAnimationFrame(analysisLoop);
        } else {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying, analysisLoop]);

    // File upload handler
    const handleFileUpload = React.useCallback((file: File) => {
        // Create or reuse audio element
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.crossOrigin = "anonymous";
        }

        const url = URL.createObjectURL(file);
        audioRef.current.src = url;
        audioRef.current.load();

        audioRef.current.onloadedmetadata = () => {
            setDuration(audioRef.current?.duration ?? 0);
        };
        audioRef.current.onended = () => {
            setIsPlaying(false);
            setEmotionLabel("COMPLETE");
        };

        setFileName(file.name);
        setIsPlaying(false);
        setCurrentTime(0);
        setEmotionLabel("LOADED");

        // Reset audio context for new source
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    const handlePlay = React.useCallback(() => {
        if (!audioRef.current || !fileName) return;

        if (!sourceRef.current) {
            connectAudio(audioRef.current);
        } else {
            audioContextRef.current?.resume();
        }

        audioRef.current.play();
        setIsPlaying(true);
        setEmotionLabel("ANALYZING");
    }, [fileName, connectAudio]);

    const handlePause = React.useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const handleStop = React.useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setEmotionLabel(fileName ? "LOADED" : "STANDBY");
        setBands({ bass: 0, lowMid: 0, mid: 0, highMid: 0, presence: 0, overall: 0 });
        // Clear canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [fileName]);

    // Progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            audioRef.current?.pause();
            sourceRef.current?.disconnect();
            audioContextRef.current?.close();
        };
    }, []);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 right-6 w-[360px] h-auto te-module z-[100] flex flex-col"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ backgroundColor: isPlaying ? "var(--te-green)" : "var(--te-orange)" }} />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">FREQ_MOD</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/30 ml-2">A-07</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-orange)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex flex-col p-4 gap-3 bg-[var(--panel-bg)] h-full">

                        {/* LCD Status Display */}
                        <div className="te-lcd p-3 flex flex-col justify-between relative overflow-hidden shrink-0 h-[70px] border border-black/10 dark:border-white/10">
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)' }} />

                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold">SOURCE</span>
                                <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold">EMOTION_STATE</span>
                            </div>

                            <div className="flex items-center justify-between mt-1 relative z-10">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Music2 className="size-3.5 opacity-50 shrink-0" />
                                    <span className="text-[11px] font-bold opacity-90 tracking-wider truncate">
                                        {fileName ? fileName.replace(/\.[^/.]+$/, "").toUpperCase().slice(0, 18) : "NO_FILE"}
                                    </span>
                                </div>
                                <span className="text-[12px] font-bold tracking-widest shrink-0 ml-2" style={{ color: isPlaying ? accentColor : "inherit", opacity: isPlaying ? 1 : 0.5 }}>
                                    {emotionLabel}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-current/10 relative z-10">
                                <span className="text-[10px] font-bold opacity-60 tracking-widest tabular-nums">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                                <span className="text-[10px] font-bold opacity-50 tracking-widest">
                                    {isPlaying ? "▶ PLAY" : "■ STOP"}
                                </span>
                            </div>
                        </div>

                        {/* Spectrum Visualizer */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">SPECTRUM_VIS</span>
                                <span className="te-label opacity-50">48_BIN</span>
                            </div>
                            <div className="te-recessed p-2 h-[72px] relative overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-full"
                                    style={{ imageRendering: "pixelated" }}
                                />
                                {!fileName && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[10px] font-mono font-bold tracking-widest opacity-20">AWAITING_INPUT</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Progress Bar */}
                        <div className="te-recessed p-1.5 h-3 relative overflow-hidden">
                            <div
                                className="h-full rounded-[2px] transition-all duration-75"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: accentColor,
                                    boxShadow: isPlaying ? `0 0 8px ${accentColor}` : "none",
                                }}
                            />
                        </div>

                        {/* Band Levels */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">BAND_LEVELS</span>
                            </div>
                            <div className="te-recessed p-2 flex gap-2">
                                {[
                                    { label: "BAS", value: bands.bass },
                                    { label: "LMD", value: bands.lowMid },
                                    { label: "MID", value: bands.mid },
                                    { label: "HMD", value: bands.highMid },
                                    { label: "PRS", value: bands.presence },
                                ].map((band) => (
                                    <div key={band.label} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full h-10 rounded-[3px] relative overflow-hidden" style={{ backgroundColor: "var(--key-bg)", border: "1px solid var(--panel-border)" }}>
                                            <div
                                                className="absolute bottom-0 left-0 right-0 transition-all duration-75 rounded-[2px]"
                                                style={{
                                                    height: `${Math.min(100, band.value * 100)}%`,
                                                    backgroundColor: accentColor,
                                                    opacity: 0.4 + band.value * 0.6,
                                                    boxShadow: band.value > 0.3 ? `0 0 6px ${accentColor}` : "none",
                                                }}
                                            />
                                        </div>
                                        <span className="text-[7px] font-mono font-bold tracking-widest opacity-50">{band.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Transport + Upload */}
                        <section className="flex gap-1.5 shrink-0">
                            {/* Upload */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="h-11 flex-1 te-button rounded-[8px] flex items-center justify-center gap-2 text-foreground"
                            >
                                <Upload className="size-3.5" />
                                <span className="text-[9px] font-bold tracking-[0.2em]">LOAD</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                    e.target.value = "";
                                }}
                            />

                            {/* Play / Pause */}
                            <button
                                onClick={isPlaying ? handlePause : handlePlay}
                                disabled={!fileName}
                                className="h-11 flex-1 te-button rounded-[8px] flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
                                style={isPlaying ? {
                                    "--key-bg": "var(--te-green)",
                                    "--key-border": "color-mix(in srgb, var(--te-green) 80%, black)",
                                    "--key-shadow": "color-mix(in srgb, var(--te-green) 60%, black)",
                                    color: "#ffffff",
                                } as React.CSSProperties : undefined}
                            >
                                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                                <span className="text-[9px] font-bold tracking-[0.2em]">{isPlaying ? "PAUSE" : "PLAY"}</span>
                            </button>

                            {/* Stop */}
                            <button
                                onClick={handleStop}
                                disabled={!fileName}
                                className="h-11 w-11 te-button rounded-[8px] flex items-center justify-center disabled:opacity-30"
                                style={isPlaying ? {
                                    "--key-bg": "var(--te-orange)",
                                    "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                                    "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                                    color: "#ffffff",
                                } as React.CSSProperties : undefined}
                            >
                                <Square className="size-3" />
                            </button>
                        </section>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
