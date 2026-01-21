"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { 
    IoCloseOutline, 
    IoTrashOutline, 
    IoQrCodeOutline,
    IoScanOutline,
    IoVideocamOutline,
    IoStopCircleOutline,
    IoDownloadOutline,
    IoTimeOutline,
    IoInfiniteOutline,
    IoAlertCircleOutline
} from "react-icons/io5";
import { EmotionState } from "./face/types";
import { cn } from "@/lib/utils";
import * as htmlToImage from "html-to-image";

interface MemoryBankProps {
    isOpen: boolean;
    onClose: () => void;
    currentEmotion: EmotionState;
    avatarStageRef: React.RefObject<HTMLDivElement | null>;
    onRestore: (emotion: EmotionState) => void;
}

interface Memory {
    id: string;
    timestamp: number;
    emotion: EmotionState;
    label?: string;
    signature?: string;
}

type RecordingState =
    | { status: "idle" }
    | { status: "recording"; startedAt: number; elapsedMs: number }
    | { status: "processing" }
    | { status: "error"; message: string };

interface SessionRecording {
    id: string;
    url: string;
    createdAt: number;
    durationMs: number;
}

function formatMs(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MemoryBank({ isOpen, onClose, currentEmotion, avatarStageRef, onRestore }: MemoryBankProps) {
    const [memories, setMemories] = React.useState<Memory[]>([]);
    const [sessionRecordings, setSessionRecordings] = React.useState<SessionRecording[]>([]);
    const [recording, setRecording] = React.useState<RecordingState>({ status: "idle" });
    
    // Drag controls
    const dragControls = useDragControls();
    
    // Recording refs
    const recorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<BlobPart[]>([]);
    const drawTimerRef = React.useRef<number | null>(null);
    const tickTimerRef = React.useRef<number | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const isRecordingRef = React.useRef(false);

    // Load from local storage
    React.useEffect(() => {
        const saved = localStorage.getItem("dot_memories");
        if (saved) {
            try {
                setMemories(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load memories", e);
            }
        }
    }, []);

    // Save to local storage
    React.useEffect(() => {
        localStorage.setItem("dot_memories", JSON.stringify(memories));
    }, [memories]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (drawTimerRef.current) window.clearInterval(drawTimerRef.current);
            if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
            try {
                recorderRef.current?.stop();
            } catch {
                // ignore
            }
            recorderRef.current = null;
            isRecordingRef.current = false;
        };
    }, []);

    const handleCapture = () => {
        const id = crypto.randomUUID();
        const newMemory: Memory = {
            id,
            timestamp: Date.now(),
            emotion: { ...currentEmotion },
            label: `STATE_0${memories.length + 1}`,
            signature: id.slice(0, 8).toUpperCase()
        };
        setMemories([newMemory, ...memories]);
    };

    const stopRecording = React.useCallback(() => {
        console.log("[Recording] Stopping...");
        isRecordingRef.current = false;
        
        if (drawTimerRef.current) {
            window.clearInterval(drawTimerRef.current);
            drawTimerRef.current = null;
        }
        if (tickTimerRef.current) {
            window.clearInterval(tickTimerRef.current);
            tickTimerRef.current = null;
        }
        
        try {
            if (recorderRef.current && recorderRef.current.state === "recording") {
                recorderRef.current.stop();
            }
        } catch (e) {
            console.error("[Recording] Error stopping recorder:", e);
        }
    }, []);

    const startRecording = React.useCallback(async () => {
        if (recording.status === "recording") return;
        
        console.log("[Recording] Starting...");
        
        // Check browser support
        if (!("MediaRecorder" in window)) {
            setRecording({ status: "error", message: "MediaRecorder not supported in this browser." });
            return;
        }

        // Get the avatar container
        const stage = avatarStageRef.current;
        if (!stage) {
            setRecording({ status: "error", message: "Avatar element not found." });
            console.error("[Recording] avatarStageRef.current is null");
            return;
        }

        console.log("[Recording] Found stage element:", stage);

        try {
            // Get dimensions
            const rect = stage.getBoundingClientRect();
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.floor(rect.width * dpr));
            const h = Math.max(1, Math.floor(rect.height * dpr));
            
            console.log("[Recording] Canvas size:", w, "x", h);

            // Create or reuse canvas
            const canvas = canvasRef.current ?? document.createElement("canvas");
            canvasRef.current = canvas;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                setRecording({ status: "error", message: "Failed to get canvas context." });
                return;
            }

            // Setup MediaRecorder
            const fps = 24; // Higher FPS for smoother video
            const stream = canvas.captureStream(fps);
            
            const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
                ? "video/webm;codecs=vp9"
                : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
                    ? "video/webm;codecs=vp8"
                    : "video/webm";
            
            console.log("[Recording] Using MIME type:", mimeType);

            const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
            recorderRef.current = recorder;
            chunksRef.current = [];
            isRecordingRef.current = true;
            
            const startedAt = Date.now();
            setRecording({ status: "recording", startedAt, elapsedMs: 0 });

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                    console.log("[Recording] Chunk received:", e.data.size, "bytes");
                }
            };
            
            recorder.onstop = () => {
                console.log("[Recording] Recorder stopped. Total chunks:", chunksRef.current.length);
                setRecording({ status: "processing" });
                
                const durationMs = Date.now() - startedAt;
                const blob = new Blob(chunksRef.current, { type: mimeType });
                
                if (blob.size < 1000) {
                    setRecording({ status: "error", message: "Recording failed - video too small." });
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                console.log("[Recording] Created blob URL, size:", blob.size, "bytes");
                
                // Add to session recordings
                setSessionRecordings(prev => [{
                    id: crypto.randomUUID(),
                    url,
                    createdAt: Date.now(),
                    durationMs
                }, ...prev]);
                
                setRecording({ status: "idle" });
                chunksRef.current = [];
            };
            
            recorder.onerror = (e) => {
                console.error("[Recording] Recorder error:", e);
                setRecording({ status: "error", message: "Recording failed." });
            };

            // Frame capture function using html-to-image
            const captureFrame = async () => {
                if (!isRecordingRef.current) return;
                
                try {
                    // Get computed background color from the document
                    const isDarkMode = document.documentElement.classList.contains("dark");
                    const bgColor = isDarkMode ? "#09090b" : "#fafafa"; // Match your theme colors
                    
                    // Use html-to-image to capture the DOM element
                    const dataUrl = await htmlToImage.toPng(stage, {
                        width: rect.width,
                        height: rect.height,
                        pixelRatio: dpr,
                        cacheBust: true,
                        skipAutoScale: true,
                        backgroundColor: bgColor, // Use theme-aware background
                        skipFonts: true, // Skip font embedding to avoid cross-origin errors
                        includeQueryParams: true,
                    });
                    
                    // Draw to canvas
                    const img = new Image();
                    img.onload = () => {
                        // Fill with background color first
                        ctx.fillStyle = bgColor;
                        ctx.fillRect(0, 0, w, h);
                        ctx.drawImage(img, 0, 0, w, h);
                    };
                    img.src = dataUrl;
                } catch (err) {
                    console.warn("[Recording] Frame capture failed:", err);
                }
            };

            // Initial frame
            await captureFrame();
            
            // Start frame capture loop
            drawTimerRef.current = window.setInterval(() => {
                void captureFrame();
            }, 1000 / fps);
            
            // Start elapsed time ticker
            tickTimerRef.current = window.setInterval(() => {
                setRecording((prev) => {
                    if (prev.status !== "recording") return prev;
                    return { ...prev, elapsedMs: Date.now() - prev.startedAt };
                });
            }, 100);

            // Start recording
            recorder.start(500); // Capture data every 500ms
            console.log("[Recording] Recorder started");
            
        } catch (error) {
            console.error("[Recording] Failed to start:", error);
            setRecording({ status: "error", message: `Failed to start: ${error instanceof Error ? error.message : "Unknown error"}` });
        }
    }, [avatarStageRef, recording.status]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMemories(memories.filter(m => m.id !== id));
    };

    const handleShare = (memory: Memory, e: React.MouseEvent) => {
        e.stopPropagation();
        const data = JSON.stringify(memory.emotion);
        navigator.clipboard.writeText(data);
    };

    const dismissError = () => {
        setRecording({ status: "idle" });
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>


                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-6">
                        <motion.div
                            drag
                            dragListener={false}
                            dragControls={dragControls}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" }}
                            transition={{ type: "spring", damping: 32, stiffness: 300, mass: 0.8 }}
                            className="pointer-events-auto w-full max-w-[400px] h-[640px] bg-background/80 backdrop-blur-3xl rounded-[32px] shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden flex flex-col relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Grain Texture */}
                            <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none z-[-1]" />

                            {/* Header */}
                            <div 
                                onPointerDown={(e) => dragControls.start(e)}
                                className="px-6 py-5 flex items-center justify-between shrink-0 border-b border-foreground/5 relative z-10 cursor-grab active:cursor-grabbing touch-none select-none"
                            >
                                <div className="flex items-center gap-2.5 text-foreground/80">
                                    <div className="size-8 rounded-full bg-foreground/5 flex items-center justify-center border border-white/5">
                                        <IoInfiniteOutline className="size-4 opacity-70" />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-semibold tracking-tight block leading-tight">
                                            Moments
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/60 block leading-tight">
                                            Time Capsule
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-8 rounded-full flex items-center justify-center hover:bg-rose-500/10 transition-colors text-muted-foreground hover:text-rose-500 active:scale-95"
                                >
                                    <IoCloseOutline className="size-5" />
                                </button>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 overflow-hidden flex flex-col relative">
                                {/* Capture Area */}
                                <div className="p-4 shrink-0">
                                    <div className="w-full rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden p-1.5 flex gap-1.5 shadow-sm">
                                        <button
                                            onClick={handleCapture}
                                            className="flex-1 h-14 rounded-[20px] bg-background/50 hover:bg-background/80 border border-white/5 transition-all group flex items-center justify-center gap-3 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="size-8 rounded-full bg-foreground flex items-center justify-center text-background shadow-sm shrink-0">
                                                <IoScanOutline className="size-4" />
                                            </div>
                                            <div className="text-left py-1">
                                                <span className="text-[11px] font-semibold tracking-wide block leading-none">
                                                    Capture
                                                </span>
                                                <span className="text-[9px] text-muted-foreground/70 block mt-0.5 leading-none">
                                                    Save State
                                                </span>
                                            </div>
                                        </button>

                                        <div className="w-px bg-white/5 my-2" />

                                        <button
                                            onClick={() => {
                                                if (recording.status === "recording") stopRecording();
                                                else void startRecording();
                                            }}
                                            disabled={recording.status === "processing"}
                                            className={cn(
                                                "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all active:scale-95 border disabled:opacity-50",
                                                recording.status === "recording"
                                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                                    : "bg-background/30 hover:bg-background/50 border-white/5 text-muted-foreground hover:text-foreground"
                                            )}
                                            title={recording.status === "recording" ? "Stop recording" : "Record avatar"}
                                        >
                                            {recording.status === "recording" ? (
                                                <IoStopCircleOutline className="size-6 animate-pulse" />
                                            ) : recording.status === "processing" ? (
                                                <div className="size-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                                            ) : (
                                                <IoVideocamOutline className="size-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Recording Status / Result / Error */}
                                    <AnimatePresence>
                                        {(recording.status === "recording" || recording.status === "error" || recording.status === "processing") && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                className="overflow-hidden"
                                            >
                                                {recording.status === "recording" && (
                                                    <div className="flex items-center justify-between rounded-[20px] bg-background/40 border border-white/5 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-foreground/70">
                                                                Recording
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-mono tabular-nums tracking-wide text-foreground">
                                                            {formatMs(recording.elapsedMs)}
                                                        </span>
                                                    </div>
                                                )}

                                                {recording.status === "processing" && (
                                                    <div className="flex items-center justify-center gap-2 rounded-[20px] bg-background/40 border border-white/5 px-4 py-3">
                                                        <div className="size-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                                                        <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-foreground/70">
                                                            Processing...
                                                        </span>
                                                    </div>
                                                )}

                                                {recording.status === "error" && (
                                                    <div 
                                                        onClick={dismissError}
                                                        className="flex items-center gap-3 rounded-[20px] bg-rose-500/5 border border-rose-500/10 px-4 py-3 cursor-pointer hover:bg-rose-500/10 transition-colors"
                                                    >
                                                        <IoAlertCircleOutline className="size-5 text-rose-500 shrink-0" />
                                                        <span className="text-[11px] text-rose-500/90 flex-1">
                                                            {recording.message}
                                                        </span>
                                                        <span className="text-[9px] text-rose-500/50 uppercase">
                                                            Tap to dismiss
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Memory Stream */}
                                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-none">
                                    {/* Session Recordings List */}
                                    {sessionRecordings.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 mb-4">
                                            <div className="px-1 py-1 flex items-center justify-between">
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                                                    Session Recordings
                                                </span>
                                                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground/50">
                                                    {sessionRecordings.length}
                                                </span>
                                            </div>
                                            {sessionRecordings.map((rec, i) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={rec.id}
                                                    className="flex items-center justify-between rounded-[20px] bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 relative overflow-hidden group hover:bg-emerald-500/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm">
                                                            <IoVideocamOutline className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-medium text-foreground/90">
                                                                Recording {sessionRecordings.length - i}
                                                            </span>
                                                            <span className="text-[9px] text-muted-foreground">
                                                                {formatMs(rec.durationMs)} • {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={rec.url}
                                                        download={`dot_moment session_${new Date(rec.createdAt).toISOString().replaceAll(":", "-")}.webm`}
                                                        className="size-8 rounded-full bg-background/50 hover:bg-background border border-white/5 flex items-center justify-center text-foreground transition-all shadow-sm z-10 hover:scale-105 active:scale-95"
                                                        title="Download"
                                                    >
                                                        <IoDownloadOutline className="size-4" />
                                                    </a>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {memories.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-4 min-h-[200px]">
                                            <div className="size-16 rounded-[24px] border border-dashed border-foreground/10 flex items-center justify-center">
                                                <IoTimeOutline className="size-6 opacity-50" />
                                            </div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                                                No Moments Captured
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {memories.map((memory, i) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={memory.id}
                                                    onClick={() => onRestore(memory.emotion)}
                                                    className="group relative p-3 rounded-[24px] bg-white/5 dark:bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex gap-3 min-w-0">
                                                            {/* Emotion Visualization */}
                                                            <div 
                                                                className="size-10 rounded-2xl shrink-0 opacity-80 shadow-inner"
                                                                style={{
                                                                    background: `linear-gradient(135deg, 
                                                                        ${memory.emotion.joy > 0.5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}, 
                                                                        ${memory.emotion.anger > 0.5 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.05)'}
                                                                    )`
                                                                }}
                                                            >
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="text-[10px] font-mono opacity-50">
                                                                        TS
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="min-w-0 py-0.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[12px] font-semibold tracking-tight text-foreground/90 truncate">
                                                                        {memory.label}
                                                                    </span>
                                                                    <span className="text-[8px] font-mono bg-foreground/5 px-1.5 py-0.5 rounded text-muted-foreground/70 uppercase tracking-wider">
                                                                        {memory.signature}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground/60 block mt-0.5 font-mono">
                                                                    {new Date(memory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => handleShare(memory, e)}
                                                                className="size-8 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                                                title="Copy Data"
                                                            >
                                                                <IoQrCodeOutline className="size-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(memory.id, e)}
                                                                className="size-8 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                                                title="Delete"
                                                            >
                                                                <IoTrashOutline className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer Gradient Fade */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/80 to-transparent pointer-events-none rounded-b-[32px]" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
