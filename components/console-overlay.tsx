"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, X, Activity, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConsoleOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    history: { role: string; content: string }[];
}

export function ConsoleOverlay({ isOpen, onClose, history }: ConsoleOverlayProps) {
    const [isMinimized, setIsMinimized] = React.useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                    animate={{ 
                        opacity: 1, 
                        x: 0, 
                        filter: "blur(0px)",
                        height: isMinimized ? "auto" : "440px"
                    }}
                    exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 30, stiffness: 350 }}
                    // Matte Glass style
                    className="absolute top-6 right-6 z-50 w-[340px] glass-card rounded-[2rem] overflow-hidden flex flex-col shadow-premium border border-white/10 dark:border-white/10"
                >
                    {/* Header: Minimal, Traf-style */}
                    <div className="flex items-center justify-between p-4 pl-6 border-b border-foreground/5 select-none bg-foreground/[0.02]">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase opacity-70">SYSTEM_LOG</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all active:scale-95 text-muted-foreground"
                            >
                                {isMinimized ? <Maximize2 className="size-3" /> : <Minimize2 className="size-3" />}
                            </button>
                            <button 
                                onClick={onClose}
                                className="size-8 rounded-full flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95 text-muted-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>

                    {/* Content: Strict Mono */}
                    {!isMinimized && (
                        <div className="flex-1 w-full bg-background/20 relative">
                             {/* Scanline effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10" />
                            
                            <ScrollArea className="h-full">
                                <div className="p-6 space-y-4 font-mono text-[11px] leading-relaxed">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 gap-3">
                                            <Activity className="size-5 opacity-40" />
                                            <span className="tracking-widest uppercase">No Signal</span>
                                        </div>
                                    ) : (
                                        history.map((msg, idx) => (
                                            <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                                <span className="text-muted-foreground/20 select-none w-6 text-right">
                                                    {String(idx).padStart(2, '0')}
                                                </span>
                                                <div className="flex-1 border-l border-foreground/5 pl-3">
                                                    <span className={cn(
                                                        "text-[9px] font-bold tracking-wider mb-0.5 block uppercase opacity-50",
                                                        msg.role === 'user' ? "text-emerald-500" : "text-indigo-500"
                                                    )}>
                                                        {msg.role === 'user' ? 'USER_INPUT' : 'SYSTEM_KOKORO'}
                                                    </span>
                                                    <span className="text-foreground/80 font-normal">
                                                        {msg.content}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
