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
                    "relative w-full max-w-lg p-4 te-panel flex flex-col gap-3 pointer-events-auto",
                    className,
                )}
            >
                <div className="flex items-center justify-between border-b border-[var(--panel-border)] pb-2 mb-1">
                    <div className="flex items-center gap-2">
                        <div
                            className="size-[20px] rounded-[4px] flex items-center justify-center bg-[var(--key-bg)] border border-[var(--key-border)] shadow-sm"
                            style={{ color: accentColor }}
                        >
                            <BrainCircuit className="size-[11px]" />
                        </div>
                        <span
                            className="te-label"
                            style={{ color: accentColor }}
                        >
                            SYS_LOG
                        </span>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="size-6 te-button !rounded-[4px] !border-b-[2px] flex items-center justify-center text-muted-foreground/60 hover:text-foreground"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </div>

                <div className="min-h-[48px] px-1 te-lcd p-3 flex flex-col justify-center">
                    {isThinking && !text ? (
                        <div className="flex items-center gap-2.5 text-[var(--lcd-text)] opacity-70 h-full py-1">
                            <Loader2
                                className="size-4 animate-spin"
                                style={{ color: accentColor }}
                            />
                            <span className="text-[12px] font-bold tracking-widest uppercase">
                                PROC_DATA...
                            </span>
                        </div>
                    ) : (
                        <p
                            className={cn(
                                "text-[12px] leading-relaxed transition-opacity duration-300 font-bold uppercase tracking-widest",
                                isFinal
                                    ? "text-[var(--lcd-text)]"
                                    : "text-[var(--lcd-text)] opacity-80",
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
                                    className="inline-block w-[6px] h-[12px] ml-2 align-middle bg-[var(--lcd-text)]"
                                />
                            )}
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
