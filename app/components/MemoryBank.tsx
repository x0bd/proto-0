"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    IoCloseOutline, 
    IoTrashOutline, 
    IoQrCodeOutline,
    IoScanOutline,
	IoVideocamOutline,
	IoStopCircleOutline,
 	IoDownloadOutline,
	IoTimeOutline
} from "react-icons/io5";
import { EmotionState } from "./face/types";
import { cn } from "@/lib/utils";

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
    signature?: string; // Hex signature for flavor
}

type RecordingState =
	| { status: "idle" }
	| { status: "recording"; startedAt: number; elapsedMs: number }
	| { status: "ready"; url: string; createdAt: number; durationMs: number };

function formatMs(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MemoryBank({ isOpen, onClose, currentEmotion, avatarStageRef, onRestore }: MemoryBankProps) {
    const [memories, setMemories] = React.useState<Memory[]>([]);
	const [recording, setRecording] = React.useState<RecordingState>({ status: "idle" });
	const recorderRef = React.useRef<MediaRecorder | null>(null);
	const chunksRef = React.useRef<BlobPart[]>([]);
	const drawTimerRef = React.useRef<number | null>(null);
	const tickTimerRef = React.useRef<number | null>(null);
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

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

	React.useEffect(() => {
		// cleanup on unmount
		return () => {
			if (drawTimerRef.current) window.clearInterval(drawTimerRef.current);
			if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
			try {
				recorderRef.current?.stop();
			} catch {
				// ignore
			}
			recorderRef.current = null;
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
		if (drawTimerRef.current) window.clearInterval(drawTimerRef.current);
		if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
		drawTimerRef.current = null;
		tickTimerRef.current = null;
		try {
			recorderRef.current?.stop();
		} catch {
			// ignore
		}
	}, []);

	const startRecording = React.useCallback(async () => {
		if (recording.status === "recording") return;
		if (!("MediaRecorder" in window)) {
			console.warn("MediaRecorder not supported in this browser.");
			return;
		}

		const stage = avatarStageRef.current;
		const svg = stage?.querySelector("svg") as SVGSVGElement | null;
		if (!stage || !svg) {
			console.warn("Avatar SVG not found for recording.");
			return;
		}

		// Setup canvas
		const rect = svg.getBoundingClientRect();
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const w = Math.max(1, Math.floor(rect.width * dpr));
		const h = Math.max(1, Math.floor(rect.height * dpr));
		const canvas = canvasRef.current ?? document.createElement("canvas");
		canvasRef.current = canvas;
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);

		// Start stream + recorder
		const fps = 15;
		const stream = canvas.captureStream(fps);
		const mimeType =
			MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
				? "video/webm;codecs=vp9"
				: MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
					? "video/webm;codecs=vp8"
					: "video/webm";

		const recorder = new MediaRecorder(stream, { mimeType });
		recorderRef.current = recorder;
		chunksRef.current = [];
		const startedAt = Date.now();
		setRecording({ status: "recording", startedAt, elapsedMs: 0 });

		recorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
		};
		recorder.onstop = () => {
			const durationMs =
				recording.status === "recording" ? Date.now() - recording.startedAt : Date.now() - startedAt;
			const blob = new Blob(chunksRef.current, { type: mimeType });
			const url = URL.createObjectURL(blob);
			setRecording({ status: "ready", url, createdAt: Date.now(), durationMs });
			chunksRef.current = [];
		};

		// Draw loop: serialize current SVG → <img> → canvas
		const serializer = new XMLSerializer();
		const drawFrame = async () => {
			try {
				const clone = svg.cloneNode(true) as SVGSVGElement;
				// ensure namespace
				if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				// ensure explicit size for rasterization
				clone.setAttribute("width", `${rect.width}`);
				clone.setAttribute("height", `${rect.height}`);
				const svgText = serializer.serializeToString(clone);
				const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
				const imgUrl = URL.createObjectURL(blob);
				const img = new Image();
				img.decoding = "async";
				img.src = imgUrl;
				await img.decode();
				URL.revokeObjectURL(imgUrl);
				ctx.clearRect(0, 0, rect.width, rect.height);
				ctx.drawImage(img, 0, 0, rect.width, rect.height);
			} catch {
				// ignore frame errors
			}
		};

		// initial draw to avoid a black first frame
		await drawFrame();
		drawTimerRef.current = window.setInterval(() => {
			void drawFrame();
		}, 1000 / fps);
		tickTimerRef.current = window.setInterval(() => {
			setRecording((prev) => {
				if (prev.status !== "recording") return prev;
				return { ...prev, elapsedMs: Date.now() - prev.startedAt };
			});
		}, 250);

		recorder.start(250);
	}, [avatarStageRef, recording.status, recording]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMemories(memories.filter(m => m.id !== id));
    };

    const handleShare = (memory: Memory, e: React.MouseEvent) => {
        e.stopPropagation();
        const data = JSON.stringify(memory.emotion);
        navigator.clipboard.writeText(data);
        // Could enable a toast here
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                     {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                        className="fixed inset-0 z-[100] bg-transparent"
                        onClick={onClose}
                    />

                    {/* Modal */}
                     <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                             drag
							 dragMomentum={false}
							 dragElastic={0.16}
                             className="pointer-events-auto w-full max-w-[360px] h-[600px] glass-card rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col relative cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-2 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3 text-foreground/80">
                                     <IoTimeOutline className="size-5" />
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-medium font-mono pt-0.5">
                                         Moments
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground active:scale-95"
                                >
                                    <IoCloseOutline className="size-5" />
                                </button>
                            </div>

                             {/* Main Content */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                {/* Capture Area */}
                                <div className="px-6 py-4 shrink-0">
									<div className="w-full rounded-3xl border border-dashed border-foreground/10 bg-foreground/[0.02] overflow-hidden">
										<div className="p-4 flex items-center gap-3">
											<button
												onClick={handleCapture}
												className="flex-1 h-14 rounded-2xl hover:bg-foreground/[0.03] transition-all group flex items-center gap-3 px-4"
											>
												<div className="size-10 rounded-full bg-background shadow-zen flex items-center justify-center text-foreground group-active:scale-90 transition-transform">
													<IoScanOutline className="size-5 opacity-70" />
												</div>
												<div className="flex-1 text-left leading-none">
													<span className="text-xs font-medium tracking-wide block opacity-80">
														Capture State
													</span>
													<span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block opacity-50 mt-2">
														Write to Memory
													</span>
												</div>
											</button>

											<button
												onClick={() => {
													if (recording.status === "recording") stopRecording();
													else void startRecording();
												}}
												className={cn(
													"size-14 rounded-2xl border border-white/5 flex items-center justify-center transition-all active:scale-[0.98]",
													recording.status === "recording"
														? "bg-rose-500/15 text-rose-500"
														: "hover:bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
												)}
												title={recording.status === "recording" ? "Stop recording" : "Record avatar"}
											>
												{recording.status === "recording" ? (
													<IoStopCircleOutline className="size-6" />
												) : (
													<IoVideocamOutline className="size-6" />
												)}
											</button>
										</div>

										<div className="px-4 pb-4">
											{recording.status === "recording" && (
												<div className="flex items-center justify-between rounded-2xl bg-card/40 border border-white/5 px-4 py-3">
													<div className="flex items-center gap-2">
														<span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
														<span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/70">
															REC
														</span>
													</div>
													<span className="text-[10px] font-mono tabular-nums tracking-wide text-foreground/70">
														{formatMs(recording.elapsedMs)}
													</span>
												</div>
											)}

											{recording.status === "ready" && (
												<div className="flex items-center justify-between rounded-2xl bg-card/40 border border-white/5 px-4 py-3">
													<div className="flex flex-col">
														<span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/70">
															Last capture
														</span>
														<span className="text-xs font-medium text-foreground/80 mt-1">
															{formatMs(recording.durationMs)}
														</span>
													</div>
													<a
														href={recording.url}
														download={`identity_${new Date(recording.createdAt).toISOString().replaceAll(":", "-")}.webm`}
														className="size-10 rounded-xl hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
														title="Download WebM"
													>
														<IoDownloadOutline className="size-5" />
													</a>
												</div>
											)}
										</div>
									</div>
                                </div>

                                {/* Memory Stream */}
                                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 scrollbar-hide">
                                    {memories.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-4">
                                             <IoTimeOutline className="size-12 opacity-20" />
                                            <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                                                 No Moments Captured
                                            </p>
                                        </div>
                                    ) : (
                                        memories.map((memory, i) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={memory.id}
                                                onClick={() => onRestore(memory.emotion)}
                                                className="group aspect-[4/1] bg-card/40 hover:bg-card/80 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden"
                                            >
                                                {/* Emotion Gradient Line */}
                                                <div 
                                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
                                                    style={{
                                                        background: `linear-gradient(to bottom, 
                                                            ${memory.emotion.joy > 0.5 ? 'var(--emerald-500)' : 'transparent'}, 
                                                            ${memory.emotion.anger > 0.5 ? 'var(--rose-500)' : 'transparent'}
                                                        )`
                                                    }}
                                                />

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold tracking-wide text-foreground/90">
                                                            {memory.label}
                                                        </span>
                                                        <span className="text-[8px] font-mono bg-foreground/5 px-1.5 py-0.5 rounded text-muted-foreground/70">
                                                            {memory.signature}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-muted-foreground mt-1">
                                                        {new Date(memory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleShare(memory, e)}
                                                        className="size-7 flex items-center justify-center rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <IoQrCodeOutline className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(memory.id, e)}
                                                        className="size-7 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                                                    >
                                                        <IoTrashOutline className="size-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer Gradient Fade */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
