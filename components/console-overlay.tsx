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
                        height: isMinimized ? "auto" : "400px"
                    }}
                    exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-6 right-6 z-50 w-[320px] glass-card rounded-[1.5rem] overflow-hidden flex flex-col shadow-premium border border-border/40"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 px-4 border-b border-border/40 select-none bg-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal className="size-3 text-muted-foreground" />
                            <span className="text-micro">System Log</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1 rounded-md hover:bg-foreground/10 transition-colors text-muted-foreground"
                            >
                                {isMinimized ? <Maximize2 className="size-3" /> : <Minimize2 className="size-3" />}
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-1 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors text-muted-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <ScrollArea className="flex-1 w-full bg-black/5">
                            <div className="p-4 space-y-3 font-mono text-[10px] leading-relaxed">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40 gap-2">
                                        <Activity className="size-4 opacity-40" />
                                        <span>No signals detected</span>
                                    </div>
                                ) : (
                                    history.map((msg, idx) => (
                                        <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-left-1 duration-200">
                                            <span className="text-muted-foreground/30 select-none">
                                                {String(idx).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1">
                                                <span className={cn(
                                                    "font-bold mr-2",
                                                    msg.role === 'user' ? "text-emerald-500" : "text-indigo-500"
                                                )}>
                                                    {msg.role === 'user' ? 'USR' : 'SYS'}
                                                </span>
                                                <span className="text-muted-foreground/80">
                                                    {msg.content}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
