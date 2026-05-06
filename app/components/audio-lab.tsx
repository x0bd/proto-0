"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import { X, Play, Pause, Square, Upload, AudioLines, Download, Database } from "lucide-react";
import { addMemory, isMemoryEnabled } from "./memory-drawer";
import type { EmotionState } from "../components/face/types";
import type { AudioLevels } from "@/hooks/useAudioAnalysis";

interface AudioLabProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmotionChange?: (emotion: EmotionState) => void;
    onAudioLevelsChange?: (levels: AudioLevels) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

function deriveEmotion(bands: {
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    overall: number;
}): { emotion: EmotionState; label: string } {
    const { bass, lowMid, mid, highMid, presence, overall } = bands;

    if (overall < 0.02) {
        return {
            emotion: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
            label: "NEUTRAL",
        };
    }

    const arousal = Math.min(1, overall * 1.5 + highMid * 0.5 + presence * 0.5);
    const warmth = (lowMid + mid) / 2;
    const dissonance = presence;
    const valence = Math.max(0, Math.min(1, 0.5 + warmth * 0.8 - dissonance * 1.2));

    const joy = Math.max(0, arousal * 0.8 * (valence > 0.5 ? valence : 0));
    const sadness = Math.max(0, (1 - arousal) * 0.8 * (1 - valence));
    const surprise = Math.max(0, arousal * 0.6 * (highMid > 0.4 ? highMid : 0));
    const anger = Math.max(0, arousal * 0.9 * (valence < 0.4 ? 1 - valence : 0) * (bass > 0.3 ? bass * 1.5 : 1));
    const curiosity = Math.max(0, (1 - Math.abs(arousal - 0.5) * 2) * warmth);

    if (joy < 0.1 && sadness < 0.1 && surprise < 0.1 && anger < 0.1 && curiosity < 0.1) {
        return {
            emotion: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
            label: "NEUTRAL",
        };
    }

    const emotion: EmotionState = { joy, sadness, surprise, anger, curiosity };

    const entries: [string, number][] = [
        ["JOY", joy], ["SORROW", sadness], ["SHOCK", surprise], ["RAGE", anger], ["QUERY", curiosity],
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

interface AudioLabSession {
    id: string;
    fileName: string;
    duration: number;
    emotionLabel: string;
    bands: {
        bass: number;
        lowMid: number;
        mid: number;
        highMid: number;
        presence: number;
        overall: number;
    };
    insight: string;
    createdAt: string;
}

type WebAudioWindow = Window &
    typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
    };

const AUDIO_LAB_SESSIONS_KEY = "dot_audio_lab_sessions";
const MAX_AUDIO_LAB_SESSIONS = 12;

function normalizeAudioLabSession(value: unknown): AudioLabSession | null {
    if (!value || typeof value !== "object") return null;
    const input = value as Partial<AudioLabSession>;
    if (typeof input.fileName !== "string" || typeof input.insight !== "string") return null;
    const bands = input.bands && typeof input.bands === "object" ? input.bands : null;
    if (!bands) return null;
    return {
        id: typeof input.id === "string" ? input.id : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: input.fileName,
        duration: Number.isFinite(input.duration) ? Number(input.duration) : 0,
        emotionLabel: typeof input.emotionLabel === "string" ? input.emotionLabel : "NEUTRAL",
        bands: {
            bass: Number((bands as AudioLabSession["bands"]).bass) || 0,
            lowMid: Number((bands as AudioLabSession["bands"]).lowMid) || 0,
            mid: Number((bands as AudioLabSession["bands"]).mid) || 0,
            highMid: Number((bands as AudioLabSession["bands"]).highMid) || 0,
            presence: Number((bands as AudioLabSession["bands"]).presence) || 0,
            overall: Number((bands as AudioLabSession["bands"]).overall) || 0,
        },
        insight: input.insight,
        createdAt:
            typeof input.createdAt === "string" && Number.isFinite(new Date(input.createdAt).getTime())
                ? input.createdAt
                : new Date().toISOString(),
    };
}

function loadAudioLabSessions(): AudioLabSession[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(AUDIO_LAB_SESSIONS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map(normalizeAudioLabSession)
            .filter((session): session is AudioLabSession => session !== null);
    } catch {
        return [];
    }
}

function saveAudioLabSession(session: AudioLabSession): AudioLabSession[] {
    const updated = [session, ...loadAudioLabSessions()].slice(0, MAX_AUDIO_LAB_SESSIONS);
    try {
        localStorage.setItem(AUDIO_LAB_SESSIONS_KEY, JSON.stringify(updated));
    } catch {
        /* storage may be unavailable or full; still keep the current UI session */
    }
    return updated;
}

function buildAudioInsight(
    fileName: string | null,
    duration: number,
    emotionLabel: string,
    bands: AudioLabSession["bands"],
): string {
    const ranked = [
        ["bass", bands.bass],
        ["low-mid warmth", bands.lowMid],
        ["mid body", bands.mid],
        ["high-mid motion", bands.highMid],
        ["presence edge", bands.presence],
    ].sort((a, b) => Number(b[1]) - Number(a[1]));
    const leader = ranked[0]?.[0] ?? "overall energy";
    const energy =
        bands.overall > 0.45 ? "high-energy" : bands.overall > 0.18 ? "steady" : "low-intensity";
    return `${fileName ?? "Audio"} analyzed as ${emotionLabel.toLowerCase()} with ${energy} movement. Dominant band: ${leader}. Duration ${formatTime(duration)}.`;
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
    const [bands, setBands] = React.useState({
        bass: 0, lowMid: 0, mid: 0, highMid: 0, presence: 0, overall: 0,
    });
    const [savedSessionCount, setSavedSessionCount] = React.useState(0);
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "saved" | "exported">("idle");

    // Audio engine refs — stable across the component lifetime
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const gainRef = React.useRef<GainNode | null>(null);
    const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = React.useRef<AudioBuffer | null>(null);
    const startTimeRef = React.useRef(0);
    const pauseOffsetRef = React.useRef(0);
    const playbackStopReasonRef = React.useRef<"pause" | "stop" | "replace" | null>(null);

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const frequencyDataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const visualizerDataRef = React.useRef<Float32Array | null>(null);

    const FFT_SIZE = 512;

    React.useEffect(() => {
        if (open) setSavedSessionCount(loadAudioLabSessions().length);
    }, [open]);

    const currentInsight = React.useMemo(
        () => buildAudioInsight(fileName, duration, emotionLabel, bands),
        [bands, duration, emotionLabel, fileName],
    );

    // Lazily initialise the AudioContext + analyser (never close it)
    const getAudioContext = React.useCallback(() => {
        if (audioContextRef.current) return audioContextRef.current;
        const AudioContextCtor =
            window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
        if (!AudioContextCtor) throw new Error("AudioContext unsupported");
        const ctx = new AudioContextCtor();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const gain = ctx.createGain();
        gain.gain.value = 1;
        gainRef.current = gain;

        gain.connect(analyser);
        analyser.connect(ctx.destination);

        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        visualizerDataRef.current = new Float32Array(analyser.frequencyBinCount);

        return ctx;
    }, []);

    const extractBands = React.useCallback(() => {
        const analyser = analyserRef.current;
        const freqData = frequencyDataRef.current;
        if (!analyser || !freqData) return null;

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

    const drawSpectrum = React.useCallback(
        (freqData: Uint8Array) => {
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

            ctx.fillStyle = "#020202";
            ctx.fillRect(0, 0, w, h);

            const r = parseInt(accentColor.slice(1, 3), 16);
            const g = parseInt(accentColor.slice(3, 5), 16);
            const b = parseInt(accentColor.slice(5, 7), 16);

            const barWidth = 4;
            const gap = 2;
            const barCount = Math.floor(w / (barWidth + gap));
            const startX = Math.floor((w - (barCount * (barWidth + gap) - gap)) / 2);
            const dotHeight = 2;
            const dotGap = 1;

            const visData = visualizerDataRef.current;
            if (!visData) return;

            for (let i = 0; i < barCount; i++) {
                const maxBin = Math.floor(freqData.length * 0.6);
                const ratio = i / (barCount - 1);
                const mapIdx = Math.min(Math.floor(Math.pow(ratio, 1.5) * maxBin), freqData.length - 1);

                const rawVal = freqData[mapIdx] / 255;
                const val = Math.pow(rawVal, 1.2);

                visData[i] = visData[i] * 0.6 + val * 0.4;

                const amplitude = visData[i];
                const maxDots = Math.floor(h / (dotHeight + dotGap));
                const activeDots = Math.floor(amplitude * maxDots);
                const x = startX + i * (barWidth + gap);

                // Dim matrix background dots
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
                for (let d = 0; d < maxDots; d++) {
                    const y = h - (d + 1) * (dotHeight + dotGap);
                    ctx.fillRect(x, y, barWidth, dotHeight);
                }

                if (activeDots > 0) {
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
                    ctx.shadowBlur = 4;
                    for (let d = 0; d < activeDots; d++) {
                        const y = h - (d + 1) * (dotHeight + dotGap);
                        ctx.globalAlpha = 0.4 + (d / activeDots) * 0.6;
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        ctx.fillRect(x, y, barWidth, dotHeight);
                    }
                    ctx.globalAlpha = 1.0;
                    ctx.shadowBlur = 0;
                }
            }
        },
        [accentColor],
    );

    // ---- Analysis RAF loop ----
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

        // Track playback time
        if (audioContextRef.current && sourceRef.current) {
            const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current;
            setCurrentTime(Math.min(elapsed, audioBufferRef.current?.duration ?? elapsed));
        }

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

    // ---- File Upload: decode to AudioBuffer ----
    const handleFileUpload = React.useCallback(
        (file: File) => {
            // Immediately show filename so user gets visual feedback
            setFileName(file.name);
            setCurrentTime(0);
            setIsPlaying(false);
            setEmotionLabel("DECODING");
            setSaveStatus("idle");
            pauseOffsetRef.current = 0;

            // Stop any current playback
            playbackStopReasonRef.current = "replace";
            try { sourceRef.current?.stop(); } catch { /* noop */ }
            sourceRef.current = null;

            // Read and decode async
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const ctx = getAudioContext();
                    await ctx.resume();
                    const arrayBuf = reader.result;
                    if (!(arrayBuf instanceof ArrayBuffer)) throw new Error("FileReader returned no audio data");
                    const audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
                    audioBufferRef.current = audioBuffer;
                    setDuration(audioBuffer.duration);
                    setEmotionLabel("LOADED");
                    console.log("[FREQ_LAB] Decoded:", file.name, "duration:", audioBuffer.duration.toFixed(1) + "s");
                } catch (err) {
                    console.error("[FREQ_LAB] decodeAudioData failed:", err);
                    setEmotionLabel("ERR_DECODE");
                }
            };
            reader.onerror = () => {
                console.error("[FREQ_LAB] FileReader error:", reader.error);
                setEmotionLabel("ERR_READ");
            };
            reader.readAsArrayBuffer(file);
        },
        [getAudioContext],
    );

    // ---- Transport ----
    const handlePlay = React.useCallback(() => {
        const buffer = audioBufferRef.current;
        if (!buffer) return;

        const ctx = getAudioContext();
        ctx.resume();
        playbackStopReasonRef.current = null;

        // Create a fresh BufferSource each time (they're one-shot by spec)
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(gainRef.current!);
        src.onended = () => {
            const reason = playbackStopReasonRef.current;
            playbackStopReasonRef.current = null;
            sourceRef.current = null;
            setIsPlaying(false);
            if (reason === "pause" || reason === "stop" || reason === "replace") return;
            pauseOffsetRef.current = 0;
            setCurrentTime(buffer.duration);
            setEmotionLabel("COMPLETE");
        };

        const offset = pauseOffsetRef.current;
        src.start(0, offset);
        startTimeRef.current = ctx.currentTime;
        sourceRef.current = src;

        setIsPlaying(true);
        setEmotionLabel("ANALYZING");
    }, [getAudioContext]);

    const handlePause = React.useCallback(() => {
        if (!sourceRef.current || !audioContextRef.current) return;
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current;
        pauseOffsetRef.current = elapsed;
        playbackStopReasonRef.current = "pause";
        try { sourceRef.current.stop(); } catch { /* noop */ }
        sourceRef.current = null;
        setIsPlaying(false);
        setEmotionLabel("PAUSED");
    }, []);

    const handleStop = React.useCallback(() => {
        playbackStopReasonRef.current = "stop";
        try { sourceRef.current?.stop(); } catch { /* noop */ }
        sourceRef.current = null;
        pauseOffsetRef.current = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        setEmotionLabel(audioBufferRef.current ? "LOADED" : "STANDBY");
        setBands({ bass: 0, lowMid: 0, mid: 0, highMid: 0, presence: 0, overall: 0 });
        drawSpectrum(new Uint8Array(FFT_SIZE / 2));
    }, [drawSpectrum]);

    React.useEffect(() => {
        if (!open && sourceRef.current) handleStop();
    }, [handleStop, open]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const createSession = React.useCallback((): AudioLabSession | null => {
        if (!fileName || duration <= 0) return null;
        return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fileName,
            duration,
            emotionLabel,
            bands,
            insight: currentInsight,
            createdAt: new Date().toISOString(),
        };
    }, [bands, currentInsight, duration, emotionLabel, fileName]);

    const handleSaveInsight = React.useCallback(() => {
        const session = createSession();
        if (!session) return;
        const updated = saveAudioLabSession(session);
        setSavedSessionCount(updated.length);
        setSaveStatus("saved");
        if (isMemoryEnabled()) {
            addMemory({
                content: `Audio insight: ${session.insight}`,
                tags: ["audio", "insight", session.emotionLabel.toLowerCase()],
                source: "system",
            });
        }
    }, [createSession]);

    const handleExportInsight = React.useCallback(() => {
        const session = createSession();
        if (!session) return;
        const blob = new Blob([JSON.stringify(session, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `dot-audio-${session.createdAt.slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setSaveStatus("exported");
    }, [createSession]);

    // Cleanup
    React.useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            playbackStopReasonRef.current = "stop";
            try { sourceRef.current?.stop(); } catch { /* noop */ }
            audioContextRef.current?.close();
        };
    }, []);

    const { x, y, onDragEnd } = usePanelPosition("audio-lab");

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    style={{ x, y }}
                    onDragEnd={onDragEnd}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 right-6 w-[380px] h-auto te-module te-safe-panel z-[100] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                >
                    {/* Header */}
                    <div className="te-module-header px-4 h-10 border-b border-black/10 dark:border-white/5 relative bg-[var(--panel-bg)] rounded-t-[16px]">
                        <div className="flex items-center gap-2">
                            <div
                                className="size-2 rounded-full"
                                style={{
                                    backgroundColor: isPlaying ? "var(--te-green)" : "var(--te-orange)",
                                    boxShadow: isPlaying ? "0 0 8px var(--te-green)" : "none",
                                }}
                            />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">FREQ_LAB</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest te-whisper ml-2">TAPE-1</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-40 shrink-0" />
                        <button
                            onClick={() => onOpenChange(false)}
                            className="size-5 te-button !rounded-full flex items-center justify-center text-foreground hover:text-[var(--te-orange)]"
                            aria-label="Close"
                        >
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex flex-col p-4 gap-4 bg-[var(--panel-bg)] rounded-b-[16px]">
                        {/* Screws */}
                        <div className="absolute top-4 left-4 size-1.5 rounded-full bg-black/20 dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />
                        <div className="absolute top-4 right-4 size-1.5 rounded-full bg-black/20 dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />

                        {/* Screen cluster — forced dark */}
                        <div
                            className="te-recessed p-2 pt-3 flex flex-col gap-2 mt-2 relative border border-[var(--panel-border)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.15)]"
                            style={{ backgroundColor: "#111111" }}
                        >
                            {/* LCD info */}
                            <div className="flex items-start justify-between px-2 mb-1">
                                <div className="flex flex-col">
                                    <span className="text-[7px] text-white/40 tracking-[0.3em] font-bold uppercase">TAPE TRACK</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <AudioLines className="size-3 text-white/80" />
                                        <span className="text-[12px] text-white font-mono font-bold tracking-widest uppercase truncate max-w-[140px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                            {fileName
                                                ? fileName.replace(/\.[^/.]+$/, "").slice(0, 15) + (fileName.length > 15 ? ".." : "")
                                                : "NO_SRC"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] text-white/40 tracking-[0.3em] font-bold uppercase mb-0.5">SYS_EMOTION</span>
                                    <div className="bg-[#050505] px-2 py-[2px] rounded-[3px] border border-white/10">
                                        <span className="text-[10px] font-bold tracking-widest" style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}` }}>
                                            {emotionLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Spectrum */}
                            <div className="h-[80px] relative rounded-[4px] border border-black/50 overflow-hidden bg-[#020202] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }} />
                                {!fileName && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-mono leading-tight tracking-[0.2em] text-[var(--te-orange)] opacity-50 text-center uppercase">
                                            INSERT_TAPE
                                            <br />
                                            TO_BEGIN_ANALYSIS
                                        </span>
                                    </div>
                                )}
                                <div className="absolute top-1 left-1.5 opacity-30 flex items-center gap-1">
                                    <div className={`size-1.5 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-white/30"}`} />
                                    <span className="text-[6px] text-white font-mono tracking-widest font-bold">REC</span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[9px] text-[#00ff88] font-mono font-bold tracking-wider tabular-nums drop-shadow-[0_0_4px_#00ff88]">
                                    {formatTime(currentTime)}
                                </span>
                                <div className="flex-1 h-1.5 bg-[#050505] rounded-full overflow-hidden border border-white/10 relative">
                                    <div
                                        className="h-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] transition-none absolute left-0 top-0 z-10"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-[9px] text-white/50 font-mono font-bold tracking-wider tabular-nums">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* EQ Bands */}
                        <section className="flex flex-col gap-1.5 shrink-0 mt-1">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">EQ_BANDS</span>
                                <span className="te-label opacity-40">METER</span>
                            </div>
                            <div className="te-recessed p-2 py-3 flex gap-2">
                                {[
                                    { full: "BSS", value: bands.bass },
                                    { full: "L-M", value: bands.lowMid },
                                    { full: "MID", value: bands.mid },
                                    { full: "H-M", value: bands.highMid },
                                    { full: "PRE", value: bands.presence },
                                ].map((band) => (
                                    <div key={band.full} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div
                                            className="w-5 h-[50px] relative overflow-hidden"
                                            style={{
                                                backgroundColor: "#111",
                                                border: "1px solid #000",
                                                borderRadius: "3px",
                                                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)",
                                            }}
                                        >
                                            <div
                                                className="absolute inset-x-0 bottom-0 top-0 opacity-20 pointer-events-none z-0"
                                                style={{
                                                    backgroundImage:
                                                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 4px)",
                                                }}
                                            />
                                            <div
                                                className="absolute inset-x-0 bottom-0 z-10 transition-all duration-75"
                                                style={{
                                                    height: `${Math.min(100, band.value * 100)}%`,
                                                    backgroundColor: accentColor,
                                                    boxShadow: band.value > 0.2 ? `0 0 10px ${accentColor}` : "none",
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 z-20 pointer-events-none bg-repeat-y"
                                                style={{
                                                    backgroundImage:
                                                        "repeating-linear-gradient(0deg, transparent, transparent 3px, #000 3px, #000 4px)",
                                                    mixBlendMode: "multiply",
                                                }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-mono font-bold tracking-widest text-foreground/70 uppercase">{band.full}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Local product output */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">LOCAL_INSIGHT</span>
                                <span className="te-label">SAVED {savedSessionCount}</span>
                            </div>
                            <div className="te-recessed p-2 flex flex-col gap-2">
                                <div className="te-lcd px-2.5 py-2 min-h-12 flex items-center">
                                    <span className="text-[9px] leading-relaxed opacity-80">
                                        {fileName ? currentInsight.toUpperCase() : "LOAD_AUDIO_TO_GENERATE_SESSION_CARD"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        onClick={handleSaveInsight}
                                        disabled={!fileName || duration <= 0}
                                        className="h-9 te-button rounded-[6px] flex items-center justify-center gap-1.5 text-[9px] disabled:opacity-30"
                                    >
                                        <Database className="size-3" />
                                        {saveStatus === "saved" ? "SAVED" : "SAVE_MEM"}
                                    </button>
                                    <button
                                        onClick={handleExportInsight}
                                        disabled={!fileName || duration <= 0}
                                        className="h-9 te-button rounded-[6px] flex items-center justify-center gap-1.5 text-[9px] disabled:opacity-30"
                                    >
                                        <Download className="size-3" />
                                        {saveStatus === "exported" ? "EXPORTED" : "EXPORT"}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Transport */}
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
                                    style={
                                        isPlaying
                                            ? ({
                                                  "--key-bg": "var(--te-orange)",
                                                  "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                                                  "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                                                  color: "#ffffff",
                                              } as React.CSSProperties)
                                            : undefined
                                    }
                                >
                                    <Square className="size-3.5" fill="currentColor" />
                                </button>

                                <button
                                    onClick={isPlaying ? handlePause : handlePlay}
                                    disabled={!fileName}
                                    className="h-10 flex-1 te-button rounded-[6px] flex items-center justify-center gap-1.5 disabled:opacity-30 transition-all text-white"
                                    style={
                                        fileName
                                            ? ({
                                                  "--key-bg": isPlaying ? "var(--te-orange)" : "var(--te-green)",
                                                  "--key-border": `color-mix(in srgb, ${isPlaying ? "var(--te-orange)" : "var(--te-green)"} 80%, black)`,
                                                  "--key-shadow": `color-mix(in srgb, ${isPlaying ? "var(--te-orange)" : "var(--te-green)"} 60%, black)`,
                                                  color: "#ffffff",
                                              } as React.CSSProperties)
                                            : undefined
                                    }
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
