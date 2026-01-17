"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    IoCloseOutline, 
    IoSaveOutline, 
    IoShareSocialOutline, 
    IoTrashOutline, 
    IoFingerPrintOutline,
    IoQrCodeOutline,
    IoScanOutline
} from "react-icons/io5";
import { EmotionState } from "./face/types";
import { cn } from "@/lib/utils";

interface MemoryBankProps {
    isOpen: boolean;
    onClose: () => void;
    currentEmotion: EmotionState;
    onRestore: (emotion: EmotionState) => void;
}

interface Memory {
    id: string;
    timestamp: number;
    emotion: EmotionState;
    label?: string;
    signature?: string; // Hex signature for flavor
}

export function MemoryBank({ isOpen, onClose, currentEmotion, onRestore }: MemoryBankProps) {
    const [memories, setMemories] = React.useState<Memory[]>([]);

    // Load from local storage
    React.useEffect(() => {
        const saved = localStorage.getItem("kokoro_memories");
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
        localStorage.setItem("kokoro_memories", JSON.stringify(memories));
    }, [memories]);

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
                        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                        className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                            className="pointer-events-auto w-full max-w-[360px] h-[600px] glass-card rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-2 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3 text-foreground/80">
                                    <IoFingerPrintOutline className="size-5" />
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-medium font-mono pt-0.5">
                                        Identity_Log
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
                                    <button
                                        onClick={handleCapture}
                                        className="w-full h-32 rounded-3xl border border-dashed border-foreground/10 hover:border-foreground/20 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all group flex flex-col items-center justify-center gap-3 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="size-12 rounded-full bg-background shadow-zen flex items-center justify-center text-foreground group-active:scale-90 transition-transform">
                                            <IoScanOutline className="size-5 opacity-70" />
                                        </div>
                                        <div className="text-center space-y-0.5">
                                            <span className="text-xs font-medium tracking-wide block opacity-70 group-hover:opacity-100 transition-opacity">
                                                Capture State
                                            </span>
                                            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block opacity-50">
                                                Write to Memory
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {/* Memory Stream */}
                                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 scrollbar-hide">
                                    {memories.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-4">
                                            <IoFingerPrintOutline className="size-12 opacity-20" />
                                            <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                                                No Identities Stored
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
