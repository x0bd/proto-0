"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { BrainCircuit, Loader2, X } from "lucide-react";

interface TranscriptPanelProps {
    text: string;
    isFinal?: boolean;
    isThinking?: boolean;
    accentColor?: string;
    className?: string;
    onClose?: () => void;
}

export function TranscriptPanel({
    text,
    isFinal = false,
    isThinking = false,
    accentColor = "#7c3aed",
    className,
    onClose,
}: TranscriptPanelProps) {
    if (!text && !isThinking) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className={cn(
                    "relative w-full max-w-lg p-5 rounded-[28px] bg-background/85 backdrop-blur-2xl border shadow-premium flex flex-col gap-3",
                    className,
                )}
                style={{ borderColor: `${accentColor}25` }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="size-[22px] rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                            }}
                        >
                            <BrainCircuit className="size-[11px]" />
                        </div>
                        <span
                            className="text-[10px] font-mono font-bold uppercase tracking-widest"
                            style={{ color: accentColor }}
                        >
                            DOT
                        </span>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="size-7 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors pointer-events-auto"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="min-h-[48px] px-1 pointer-events-auto">
                    {isThinking && !text ? (
                        <div className="flex items-center gap-2.5 text-muted-foreground h-full py-1">
                            <Loader2
                                className="size-4 animate-spin"
                                style={{ color: accentColor }}
                            />
                            <span className="text-[14px] font-medium tracking-tight">
                                Thinking...
                            </span>
                        </div>
                    ) : (
                        <p
                            className={cn(
                                "text-[16px] leading-relaxed transition-opacity duration-300 tracking-tight",
                                isFinal
                                    ? "text-foreground font-medium"
                                    : "text-foreground/80",
                            )}
                        >
                            {text}
                            {!isFinal && (
                                <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 0.8,
                                    }}
                                    className="inline-block w-[5px] h-[18px] ml-1.5 align-middle rounded-[2px]"
                                    style={{ backgroundColor: accentColor }}
                                />
                            )}
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
