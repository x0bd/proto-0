"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Share2, Trash2, Camera, Plus } from "lucide-react";
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
}

export function MemoryBank({ isOpen, onClose, currentEmotion, onRestore }: MemoryBankProps) {
    const [memories, setMemories] = React.useState<Memory[]>([]);

    // Load from local storage on mount
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

    // Save to local storage whenever memories change
    React.useEffect(() => {
        localStorage.setItem("kokoro_memories", JSON.stringify(memories));
    }, [memories]);

    const handleCapture = () => {
        const newMemory: Memory = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            emotion: { ...currentEmotion },
            label: `Memory #${memories.length + 1}`
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
        alert("Memory JSON copied to clipboard!");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-3xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                            className="pointer-events-auto w-full max-w-[500px] glass-card rounded-[2.5rem] p-8 relative shadow-premium flex flex-col max-h-[80vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-light tracking-tight text-foreground">Memory Bank</h2>
                                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase opacity-60 mt-1">
                                        EMOTION_PERSISTENCE_LAYER
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-10 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {/* Capture Action */}
                            <div className="mb-8">
                                <button
                                    onClick={handleCapture}
                                    className="w-full glass-card rounded-[1.5rem] p-4 flex items-center justify-center gap-3 hover:bg-foreground/5 transition-all active:scale-[0.98] group border border-border/40"
                                >
                                    <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                                        <Camera className="size-5 text-emerald-500" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-medium">Capture Current State</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            SAVE_SNAPSHOT
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Memory Grid */}
                            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                                {memories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 gap-3 border-2 border-dashed border-foreground/5 rounded-[1.5rem]">
                                        <Save className="size-6 opacity-40" />
                                        <span className="text-xs uppercase tracking-widest">No Memories Found</span>
                                    </div>
                                ) : (
                                    memories.map((memory) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={memory.id}
                                            onClick={() => {
                                                onRestore(memory.emotion);
                                                onClose();
                                            }}
                                            className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-foreground/5 transition-colors cursor-pointer border border-transparent hover:border-foreground/5"
                                        >
                                            {/* Mini Viz */}
                                            <div className="size-12 rounded-xl bg-foreground/5 flex items-center justify-center relative overflow-hidden">
                                                <div 
                                                    className="absolute inset-0 opacity-20"
                                                    style={{
                                                        background: `conic-gradient(from 0deg, 
                                                            ${memory.emotion.joy > 0.5 ? 'emerald' : 'transparent'}, 
                                                            ${memory.emotion.anger > 0.5 ? 'rose' : 'transparent'},
                                                            ${memory.emotion.curiosity > 0.5 ? 'indigo' : 'transparent'}
                                                        )`
                                                    }}
                                                />
                                                <span className="font-mono text-[10px] opacity-50">
                                                    {(memory.emotion.joy * 100).toFixed(0)}%
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-medium text-sm truncate">{memory.label}</span>
                                                    <span className="text-[9px] font-mono text-muted-foreground/50">
                                                        {new Date(memory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {Object.entries(memory.emotion).map(([k, v]) => (
                                                        v > 0.3 && (
                                                            <span key={k} className="text-[9px] uppercase tracking-wider text-muted-foreground/70 bg-foreground/5 px-1.5 py-0.5 rounded-md">
                                                                {k}
                                                            </span>
                                                        )
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleShare(memory, e)}
                                                    className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Copy JSON"
                                                >
                                                    <Share2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(memory.id, e)}
                                                    className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
