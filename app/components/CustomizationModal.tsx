"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaceVariant } from "./face/types";
import { cn } from "@/lib/utils";

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVariant: FaceVariant;
    onVariantChange: (variant: FaceVariant) => void;
}

const FACES: { id: FaceVariant; name: string; style: string }[] = [
    { id: "minimal", name: "Pure", style: "essential" },
    { id: "tron", name: "Digital", style: "system" },
    { id: "analogue", name: "Sketch", style: "hand-drawn" },
    { id: "myst", name: "Myst", style: "vision" },
    { id: "flux", name: "Flux", style: "form" },
    { id: "echo", name: "Echo", style: "essence" },
];

// Abstract eye visualization for each variant
function EyePreview({ variant, isActive }: { variant: FaceVariant; isActive: boolean }) {
    const baseClass = cn(
        "transition-all duration-500",
        isActive ? "fill-background" : "fill-foreground"
    );
    
    switch (variant) {
        case "myst":
            return (
                <svg viewBox="0 0 48 28" className="w-10 h-5">
                    <circle cx="24" cy="6" r="5" className={baseClass} />
                    <circle cx="10" cy="22" r="5" className={baseClass} />
                    <circle cx="38" cy="22" r="5" className={baseClass} />
                </svg>
            );
        case "flux":
            return (
                <svg viewBox="0 0 48 24" className="w-10 h-5">
                    <polygon points="12,4 20,20 4,20" className={baseClass} />
                    <polygon points="36,4 44,20 28,20" className={baseClass} />
                </svg>
            );
        case "echo":
            return (
                <svg viewBox="0 0 48 24" className="w-10 h-5">
                    <circle cx="14" cy="12" r="4" className={baseClass} />
                    <circle cx="34" cy="12" r="4" className={baseClass} />
                </svg>
            );
        case "minimal":
            return (
                <svg viewBox="0 0 48 24" className="w-10 h-5">
                    <ellipse cx="12" cy="12" rx="7" ry="5" className={baseClass} />
                    <ellipse cx="36" cy="12" rx="7" ry="5" className={baseClass} />
                </svg>
            );
        case "tron":
            return (
                <svg viewBox="0 0 48 24" className="w-10 h-5">
                    <rect x="4" y="6" width="14" height="12" rx="2" className={baseClass} />
                    <rect x="30" y="6" width="14" height="12" rx="2" className={baseClass} />
                </svg>
            );
        case "analogue":
            return (
                <svg viewBox="0 0 48 24" className="w-10 h-5">
                    <ellipse cx="12" cy="12" rx="7" ry="5" className={cn(baseClass, "opacity-70")} strokeWidth="1.5" stroke="currentColor" fill="none" />
                    <ellipse cx="36" cy="12" rx="7" ry="5" className={cn(baseClass, "opacity-70")} strokeWidth="1.5" stroke="currentColor" fill="none" />
                </svg>
            );
        default:
            return null;
    }
}

export const CustomizationModal = React.memo(function CustomizationModal({
    isOpen,
    onClose,
    currentVariant,
    onVariantChange,
}: CustomizationModalProps) {
    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop - Warm paper overlay, no blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed inset-0 z-[100] bg-background/90"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 40, stiffness: 400, mass: 0.8 }}
                            className="pointer-events-auto w-full max-w-[520px] bg-background rounded-[28px] shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Washi grain texture */}
                            <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
                            
                            {/* Decorative vertical text - Japanese aesthetic */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 writing-vertical-rl text-[10px] tracking-[0.5em] text-muted-foreground/20 font-medium select-none pointer-events-none">
                                IDENTITY
                            </div>

                            {/* Header */}
                            <div className="relative px-8 pt-8 pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                                            Face
                                        </h2>
                                        <p className="text-[13px] text-muted-foreground mt-1">
                                            Choose your expression
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all active:scale-95 -mr-1 -mt-1"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Faces Grid */}
                            <div className="relative px-8 pt-4 pb-8">
                                <div className="grid grid-cols-3 gap-2">
                                    {FACES.map((item, i) => {
                                        const isActive = currentVariant === item.id;
                                        return (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => onVariantChange(item.id)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className={cn(
                                                    "py-3.5 px-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-2",
                                                    isActive 
                                                        ? "bg-foreground text-background" 
                                                        : "bg-transparent border border-border/60 hover:border-foreground/20 text-foreground"
                                                )}
                                            >
                                                <EyePreview variant={item.id} isActive={isActive} />
                                                <span className="text-[11px] font-medium tracking-tight">
                                                    {item.name}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Bottom decorative line */}
                            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
});
