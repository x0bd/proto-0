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
		<AnimatePresence mode="wait">
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-[100] bg-background/20 backdrop-blur-md"
						onClick={onClose}
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ type: "spring", damping: 30, stiffness: 350 }}
							drag
							dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
							dragMomentum={false}
							className="pointer-events-auto w-full max-w-[400px] bg-background/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/10 dark:border-white/5 flex flex-col gap-8"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="flex items-center justify-between cursor-grab active:cursor-grabbing">
								<div>
									<h2 className="text-xl font-medium tracking-tight text-foreground">Memory Bank</h2>
									<p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase opacity-60">
										EMOTION_PERSISTENCE
									</p>
								</div>
								<button
									onClick={onClose}
									className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
								>
									<X className="size-4" />
								</button>
							</div>

							<div className="space-y-6">
								{/* Capture Action */}
								<button
									onClick={handleCapture}
									className="w-full bg-foreground/5 rounded-2xl p-4 flex items-center justify-between hover:bg-foreground/10 transition-all active:scale-[0.98] group relative overflow-hidden"
								>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="flex items-center gap-4 relative z-10">
										<div className="size-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-emerald-500">
											<Camera className="size-5" />
										</div>
										<div className="text-left">
											<span className="block text-sm font-bold tracking-wide">SNAPSHOT</span>
											<span className="text-[10px] text-muted-foreground font-mono">
												SAVE_CURRENT_STATE
											</span>
										</div>
									</div>
									<Plus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors relative z-10" />
								</button>

                                {/* Export Options */}
                                <div className="grid grid-cols-3 gap-2">
                                    {['PNG', 'GIF', 'MP4'].map((format) => (
                                        <button 
                                            key={format}
                                            className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors flex flex-col items-center justify-center gap-1 group"
                                            onClick={() => alert(`Export to ${format} coming soon!`)}
                                        >
                                            <span className="text-[9px] font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors">{format}</span>
                                        </button>
                                    ))}
                                </div>

								{/* Memory Grid */}
								<div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 -mr-2 scrollbar-hide">
									{memories.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-8 text-muted-foreground/30 gap-2 border-2 border-dashed border-foreground/5 rounded-2xl">
											<Save className="size-5 opacity-40" />
											<span className="text-[10px] uppercase tracking-widest">Empty Bank</span>
										</div>
									) : (
										memories.map((memory) => (
											<motion.div
												layout
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												key={memory.id}
												onClick={() => {
													onRestore(memory.emotion);
												}}
												className="group flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 transition-colors cursor-pointer"
											>
												<div className="size-8 rounded-lg bg-foreground/5 flex items-center justify-center relative overflow-hidden shrink-0">
                                                    <div 
                                                        className="absolute inset-0 opacity-20"
                                                        style={{
                                                            background: `conic-gradient(from 0deg, 
                                                                ${memory.emotion.joy > 0.5 ? 'var(--emerald-500)' : 'transparent'}, 
                                                                ${memory.emotion.anger > 0.5 ? 'var(--rose-500)' : 'transparent'},
                                                                transparent
                                                            )`
                                                        }}
                                                    />
													<span className="font-mono text-[9px] opacity-50">
														#{(memories.indexOf(memory) + 1).toString().padStart(2, '0')}
													</span>
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex items-center justify-between">
														<span className="font-medium text-xs truncate">{memory.label}</span>
														<span className="text-[9px] font-mono text-muted-foreground/50">
															{new Date(memory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
														</span>
													</div>
												</div>

												<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														onClick={(e) => handleShare(memory, e)}
														className="size-6 flex items-center justify-center rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
													>
														<Share2 className="size-3" />
													</button>
													<button
														onClick={(e) => handleDelete(memory.id, e)}
														className="size-6 flex items-center justify-center rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
													>
														<Trash2 className="size-3" />
													</button>
												</div>
											</motion.div>
										))
									)}
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
