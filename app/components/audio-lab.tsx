"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, Square, Upload, AudioLines } from "lucide-react";
import type { EmotionState } from "../components/face/types";

interface AudioLabProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmotionChange?: (emotion: EmotionState) => void;
    onAudioLevelsChange?: (levels: any) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

// Advanced heuristic: maps spectral bands to pseudo Valence/Arousal space, then to discrete emotions.
function deriveEmotion(bands: {
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    overall: number;
}): { emotion: EmotionState; label: string } {
    const { bass, lowMid, mid, highMid, presence, overall } = bands;
    
    // Smooth silence
    if (overall < 0.02) {
        return {
            emotion: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 }, // Neutral
            label: "NEUTRAL"
        };
    }

    // Arousal: Directly correlated to overall energy and sharp transients (presence/highMid)
    const arousal = Math.min(1, overall * 1.5 + highMid * 0.5 + presence * 0.5);
    
    // Valence (Positivity): High warmth (lowMid+mid) vs screechy highs (presence)
    const warmth = (lowMid + mid) / 2;
    const dissonance = presence;
    const valence = Math.max(0, Math.min(1, 0.5 + warmth * 0.8 - dissonance * 1.2)); 

    let joy = 0, sadness = 0, surprise = 0, anger = 0, curiosity = 0;

    // High arousal + High valence = JOY
    joy = Math.max(0, arousal * 0.8 * (valence > 0.5 ? valence : 0));
    
    // Low arousal + Low/mid valence = SORROW
    sadness = Math.max(0, (1 - arousal) * 0.8 * (1 - valence));
    
    // High arousal + Sudden high frequencies = SHOCK/SURPRISE
    surprise = Math.max(0, arousal * 0.6 * (highMid > 0.4 ? highMid : 0));
    
    // High arousal + Low valence + heavy low-end = RAGE
    anger = Math.max(0, arousal * 0.9 * (valence < 0.4 ? (1 - valence) : 0) * (bass > 0.3 ? bass * 1.5 : 1));
    
    // Moderate arousal + High warm mids = CURIOSITY/QUERY
    curiosity = Math.max(0, (1 - Math.abs(arousal - 0.5) * 2) * warmth);

    // Default to neutral base if everything is low
    if (joy < 0.1 && sadness < 0.1 && surprise < 0.1 && anger < 0.1 && curiosity < 0.1) {
        return {
            emotion: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
            label: "NEUTRAL"
        };
    }

    const emotion: EmotionState = { joy, sadness, surprise, anger, curiosity };
    
    // Identify dominant
    const entries: [string, number][] = [
        ["JOY", joy], ["SORROW", sadness], ["SHOCK", surprise], ["RAGE", anger], ["QUERY", curiosity]
    ];
    entries.sort((a, b) => b[1] - a[1]);
    const label = entries[0][1] > 0.15 ? entries[0][0] : "NEUTRAL";

    return { emotion, label };
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

    // Smoothing array for the visualizer to feel less jerky
    const visualizerDataRef = React.useRef<Float32Array | null>(null);

    const FFT_SIZE = 512; // Higher resolution for smoother dot matrix

    const connectAudio = React.useCallback((audioEl: HTMLAudioElement) => {
        if (audioContextRef.current) {
            audioContextRef.current.resume();
            return;
        }

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.8; // High smoothing for the visualizer
        analyserRef.current = analyser;

        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        visualizerDataRef.current = new Float32Array(analyser.frequencyBinCount);

        const source = ctx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
    }, []);

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

    const drawSpectrum = React.useCallback((freqData: Uint8Array) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        }

        // Draw pure black background
        ctx.fillStyle = "#020202";
        ctx.fillRect(0, 0, w, h);

        const r = parseInt(accentColor.slice(1, 3), 16);
        const g = parseInt(accentColor.slice(3, 5), 16);
        const b = parseInt(accentColor.slice(5, 7), 16);

        // Parameters for dot matrix
        const barWidth = 4;
        const gap = 2;
        const barCount = Math.floor(w / (barWidth + gap));
        const startX = Math.floor((w - (barCount * (barWidth + gap) - gap)) / 2);
        
        const dotHeight = 2;
        const dotGap = 1;

        // Smooth visualizer data heavily
        const visData = visualizerDataRef.current;
        if (!visData) return;

        for (let i = 0; i < barCount; i++) {
            // Use logarithmic frequency mapping so highs don't get squashed into 2 bins
            // freqData.length is max bins (e.g. 256). We only care about the first ~60% of bins
            const maxBin = Math.floor(freqData.length * 0.6);
            const ratio = i / (barCount - 1);
            // Logarithmic index mapping: x = Math.pow(ratio, 2)
            const mapIdx = Math.floor(Math.pow(ratio, 1.5) * maxBin);
            
            const rawVal = freqData[mapIdx] / 255;
            
            // Apply exponential curve to make peaks pop
            const val = Math.pow(rawVal, 1.4);
            
            // Smooth over time
            visData[i] = visData[i] * 0.75 + val * 0.25;
            
            const amplitude = visData[i];
            const maxDots = Math.floor(h / (dotHeight + dotGap));
            const activeDots = Math.floor(amplitude * maxDots);

            const x = startX + i * (barWidth + gap);

            // Draw base faint matrix columns
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
            for (let d = 0; d < maxDots; d++) {
                const y = h - (d + 1) * (dotHeight + dotGap);
                ctx.fillRect(x, y, barWidth, dotHeight);
            }

            if (activeDots > 0) {
                // Draw glowing active dots
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
                ctx.shadowBlur = 4;
                
                for (let d = 0; d < activeDots; d++) {
                    const y = h - (d + 1) * (dotHeight + dotGap);
                    // Make top dots brighter, bottom dots slightly transparent
                    ctx.globalAlpha = 0.4 + (d / activeDots) * 0.6;
                    ctx.fillRect(x, y, barWidth, dotHeight);
                }
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 0;
            }
        }
    }, [accentColor]);

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

            onAudioLevelsChange?.(result);

            const { emotion, label } = deriveEmotion(result);
            setEmotionLabel(label);
            onEmotionChange?.(emotion);

            if (result.frequencyData) drawSpectrum(result.frequencyData);
        }

        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        rafRef.current = requestAnimationFrame(analysisLoop);
    }, [extractBands, drawSpectrum, onEmotionChange, onAudioLevelsChange]);

    React.useEffect(() => {
        if (isPlaying) {
            rafRef.current = requestAnimationFrame(analysisLoop);
        } else {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying, analysisLoop]);

    const handleFileUpload = React.useCallback((file: File) => {
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

        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        drawSpectrum(new Uint8Array(FFT_SIZE / 2));
    }, [drawSpectrum]);

    const handlePlay = React.useCallback(() => {
        if (!audioRef.current || !fileName) return;

        if (!sourceRef.current) connectAudio(audioRef.current);
        else audioContextRef.current?.resume();

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
        drawSpectrum(new Uint8Array(FFT_SIZE / 2));
    }, [fileName, drawSpectrum]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
                    className="absolute top-24 right-6 w-[380px] h-auto te-module z-[100] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header px-4 h-10 border-b border-black/10 dark:border-white/5 relative bg-[var(--panel-bg)] rounded-t-[16px]">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ backgroundColor: isPlaying ? "var(--te-green)" : "var(--te-orange)", boxShadow: isPlaying ? "0 0 8px var(--te-green)" : "none" }} />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">FREQ_LAB</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/30 ml-2">TAPE-1</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-40 shrink-0" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full flex items-center justify-center text-foreground hover:text-[var(--te-orange)]" aria-label="Close">
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex flex-col p-4 gap-4 bg-[var(--panel-bg)] rounded-b-[16px]">
                        {/* Fake Screws */}
                        <div className="absolute top-4 left-4 size-1.5 rounded-full bg-black/20 dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />
                        <div className="absolute top-4 right-4 size-1.5 rounded-full bg-black/20 dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />
                        
                        {/* Main Display cluster */}
                        <div className="te-recessed p-2 pt-3 flex flex-col gap-2 mt-2 relative border border-[var(--panel-border)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.15)] bg-[#1a1a1a]">
                            
                            {/* LCD Status Block */}
                            <div className="flex items-start justify-between px-2 mb-1">
                                <div className="flex flex-col">
                                    <span className="text-[7px] text-white/40 tracking-[0.3em] font-bold uppercase">TAPE TRACK</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <AudioLines className="size-3 text-white/80" />
                                        <span className="text-[12px] text-white font-mono font-bold tracking-widest uppercase truncate max-w-[140px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                            {fileName ? fileName.replace(/\.[^/.]+$/, "").slice(0, 15) + (fileName.length > 15 ? ".." : "") : "NO_SRC"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] text-white/40 tracking-[0.3em] font-bold uppercase mb-0.5">SYS_EMOTION</span>
                                    <div className="bg-black/60 px-2 py-[2px] rounded-[3px] border border-white/10">
                                        <span className="text-[10px] font-bold tracking-widest" style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}` }}>
                                            {emotionLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* True Matrix Spectrum */}
                            <div className="h-[80px] relative rounded-[4px] border border-black/50 overflow-hidden bg-[#050505] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 w-full h-full"
                                    style={{ imageRendering: "pixelated" }}
                                />
                                {!fileName && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-mono leading-tight tracking-[0.2em] text-[var(--te-orange)] opacity-50 text-center uppercase">
                                            INSERT_TAPE<br/>TO_BEGIN_ANALYSIS
                                        </span>
                                    </div>
                                )}
                                <div className="absolute top-1 left-1.5 opacity-30 flex items-center gap-1">
                                    <div className={`size-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/30'}`} />
                                    <span className="text-[6px] text-white font-mono tracking-widest font-bold">REC</span>
                                </div>
                            </div>

                            {/* Time / Progress */}
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[9px] text-[#00ff88] font-mono font-bold tracking-wider tabular-nums drop-shadow-[0_0_4px_#00ff88]">
                                    {formatTime(currentTime)}
                                </span>
                                <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden border border-white/10 relative">
                                    {/* Scanline overlay for bar */}
                                    <div className="absolute inset-x-0 bottom-0 top-0 opacity-30 pointer-events-none z-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)" }} />
                                    <div 
                                        className="h-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] transition-none absolute left-0 top-0 z-10" 
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-[9px] text-white/50 font-mono font-bold tracking-wider tabular-nums">
                                    {formatTime(duration)}
                                </span>
                            </div>
                        </div>

                        {/* Band Levels (Hardware sliders style) */}
                        <section className="flex flex-col gap-1.5 shrink-0 mt-1">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">EQ_BANDS</span>
                                <span className="te-label opacity-40">METER</span>
                            </div>
                            <div className="te-recessed p-2 py-3 flex gap-2">
                                {[
                                    { label: "B", full: "BSS", value: bands.bass },
                                    { label: "L", full: "L-M", value: bands.lowMid },
                                    { label: "M", full: "MID", value: bands.mid },
                                    { label: "H", full: "H-M", value: bands.highMid },
                                    { label: "P", full: "PRE", value: bands.presence },
                                ].map((band) => (
                                    <div key={band.label} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div className="w-5 h-[50px] relative" style={{ backgroundColor: "#111", border: "1px solid #000", borderRadius: "3px", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)" }}>
                                            <div className="absolute inset-x-0 bottom-0 top-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 4px)" }} />
                                            <div 
                                                className="absolute inset-x-0 bottom-0 z-10 transition-all duration-75" 
                                                style={{ 
                                                    height: `${Math.min(100, band.value * 100)}%`, 
                                                    backgroundColor: accentColor,
                                                    boxShadow: band.value > 0.2 ? `0 0 10px ${accentColor}` : "none",
                                                }}
                                            />
                                            <div className="absolute inset-0 z-20 mix-blend-multiply pointer-events-none bg-repeat-y" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, #000 3px, #000 4px)" }} />
                                        </div>
                                        <span className="text-[9px] font-mono font-bold tracking-widest text-foreground/70 uppercase">
                                            {band.full}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Transport Block */}
                        <section className="flex gap-2 shrink-0 mt-1">
                            <div className="flex-1 p-1.5 te-recessed flex gap-1.5 items-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-10 px-3 te-button rounded-[6px] flex items-center justify-center gap-1.5 text-foreground flex-1"
                                >
                                    <Upload className="size-3 opacity-70" />
                                    <span className="text-[10px] font-bold tracking-widest">TAPE_IN</span>
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
                            </div>

                            <div className="flex-1 p-1.5 te-recessed flex gap-1.5 items-center">
                                <button
                                    onClick={handleStop}
                                    disabled={!fileName}
                                    className="size-10 shrink-0 te-button rounded-[6px] flex items-center justify-center disabled:opacity-30 transition-all"
                                    style={isPlaying ? {
                                        "--key-bg": "var(--te-orange)",
                                        "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                                        "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                                        color: "#ffffff",
                                    } as React.CSSProperties : undefined}
                                >
                                    <Square className="size-3.5" fill="currentColor" />
                                </button>

                                <button
                                    onClick={isPlaying ? handlePause : handlePlay}
                                    disabled={!fileName}
                                    className="h-10 flex-1 te-button rounded-[6px] flex items-center justify-center gap-1.5 disabled:opacity-30 transition-all text-white"
                                    style={fileName ? {
                                        "--key-bg": isPlaying ? "var(--te-orange)" : "var(--te-green)",
                                        "--key-border": `color-mix(in srgb, ${isPlaying ? 'var(--te-orange)' : 'var(--te-green)'} 80%, black)`,
                                        "--key-shadow": `color-mix(in srgb, ${isPlaying ? 'var(--te-orange)' : 'var(--te-green)'} 60%, black)`,
                                        color: "#ffffff",
                                    } as React.CSSProperties : undefined}
                                >
                                    {isPlaying ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
                                    <span className="text-[10px] font-bold tracking-widest">{isPlaying ? "PAUSE" : "PLAY"}</span>
                                </button>
                            </div>
                        </section>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
