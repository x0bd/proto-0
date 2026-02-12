"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaceVariant } from "./face/types";
import { cn } from "@/lib/utils";
import { IoCloseOutline } from "react-icons/io5";

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVariant: FaceVariant;
    onVariantChange: (variant: FaceVariant) => void;
}

const FACES: { id: FaceVariant; name: string; desc: string }[] = [
    { id: "minimal", name: "Pure", desc: "Essential form" },
    { id: "tron", name: "Digital", desc: "System grid" },
    { id: "analogue", name: "Sketch", desc: "Hand drawn" },
    { id: "myst", name: "Myst", desc: "Visionary" },
    { id: "flux", name: "Flux", desc: "Architect" },
    { id: "echo", name: "Echo", desc: "Essence" },
];

function EyePreview({ variant, isActive }: { variant: FaceVariant; isActive: boolean }) {
    const baseClass = cn(
        "transition-all duration-500",
        isActive ? "fill-background" : "fill-foreground"
    );
    
    switch (variant) {
        case "myst":
            return (
                <svg viewBox="0 0 48 24" className="w-12 h-6">
                    <circle cx="24" cy="6" r="4" className={baseClass} />
                    <circle cx="12" cy="18" r="4" className={baseClass} />
                    <circle cx="36" cy="18" r="4" className={baseClass} />
                </svg>
            );
        case "flux":
            return (
                <svg viewBox="0 0 48 24" className="w-12 h-6">
                    <polygon points="12,6 18,18 6,18" className={baseClass} />
                    <polygon points="36,6 42,18 30,18" className={baseClass} />
                </svg>
            );
        case "echo":
            return (
                <svg viewBox="0 0 48 24" className="w-12 h-6">
                    <circle cx="14" cy="12" r="3" className={baseClass} />
                    <circle cx="34" cy="12" r="3" className={baseClass} />
                </svg>
            );
        case "minimal":
            return (
                <svg viewBox="0 0 48 24" className="w-12 h-6">
                    <ellipse cx="12" cy="12" rx="6" ry="4" className={baseClass} />
                    <ellipse cx="36" cy="12" rx="6" ry="4" className={baseClass} />
                </svg>
            );
        case "tron":
            return (
                <svg viewBox="0 0 48 24" className="w-12 h-6">
                    <rect x="6" y="8" width="12" height="8" rx="1" className={baseClass} />
                    <rect x="30" y="8" width="12" height="8" rx="1" className={baseClass} />
                </svg>
            );
        case "analogue":
            return (
                <svg viewBox="0 0 48 24" className="w-12 h-6">
                    <ellipse cx="12" cy="12" rx="6" ry="4" className={cn(baseClass, "opacity-70")} strokeWidth="1.5" stroke="currentColor" fill="none" />
                    <ellipse cx="36" cy="12" rx="6" ry="4" className={cn(baseClass, "opacity-70")} strokeWidth="1.5" stroke="currentColor" fill="none" />
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="pointer-events-auto w-full max-w-[480px] bg-background border border-foreground/5 shadow-2xl rounded-[32px] overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Washi Texture Overlay */}
                            <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none z-0" />

                            {/* Header */}
                            <div className="relative z-10 px-8 pt-8 pb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[14px] font-semibold tracking-[0.2em] uppercase text-foreground">
                                        Identity
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground mt-1 font-mono tracking-wide opacity-60">
                                        Select your interface persona
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                                >
                                    <IoCloseOutline className="size-5" />
                                </button>
                            </div>

                            {/* Grid */}
                            <div className="relative z-10 px-6 pb-8">
                                <div className="grid grid-cols-2 gap-3">
                                    {FACES.map((item, i) => {
                                        const isActive = currentVariant === item.id;
                                        return (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => onVariantChange(item.id)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className={cn(
                                                    "group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-left",
                                                    isActive 
                                                        ? "bg-foreground text-background border-transparent shadow-lg" 
                                                        : "bg-transparent border-foreground/5 hover:border-foreground/20 hover:bg-foreground/5 text-foreground"
                                                )}
                                            >
                                                {/* Icon */}
                                                <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <EyePreview variant={item.id} isActive={isActive} />
                                                </div>
                                                
                                                {/* Text */}
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-semibold tracking-wide">
                                                        {item.name}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-medium tracking-tight mt-0.5",
                                                        isActive ? "text-background/60" : "text-muted-foreground"
                                                    )}>
                                                        {item.desc}
                                                    </span>
                                                </div>

                                                {/* Active Indicator Dot */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-dot"
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-background"
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Footer / Decorative */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-50" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
});
