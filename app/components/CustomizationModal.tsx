"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    IoCloseOutline, 
    IoDesktopOutline, 
    IoPencilOutline, 
    IoEllipseOutline, 
    IoCheckmarkOutline,
    IoSparklesOutline,
    IoEyeOutline,
    IoShapesOutline,
    IoFlashOutline,
    IoCubeOutline,
    IoRadioOutline
} from "react-icons/io5";
import { FaceVariant } from "./face/types";
import { cn } from "@/lib/utils";

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVariant: FaceVariant;
    onVariantChange: (variant: FaceVariant) => void;
}

const VARIANTS: { id: FaceVariant; label: string; description: string; icon: React.ElementType }[] = [
    // Legacy
    { id: "minimal", label: "Pure (Legacy)", description: "Essential form", icon: IoEllipseOutline },
    { id: "tron", label: "Digital (Legacy)", description: "System aesthetics", icon: IoDesktopOutline },
    { id: "analogue", label: "Sketch (Legacy)", description: "Hand-drawn lines", icon: IoPencilOutline },
    // New Agents
    { id: "lumina", label: "Lumina", description: "Radiant & Classic", icon: IoSparklesOutline },
    { id: "volo", label: "Volo", description: "Cyclops Sentinel", icon: IoEyeOutline },
    { id: "myst", label: "Myst", description: "Arcane Triad", icon: IoShapesOutline },
    { id: "zane", label: "Zane", description: "Rebellious Glitch", icon: IoFlashOutline },
    { id: "flux", label: "Flux", description: "Geometric Construct", icon: IoCubeOutline },
    { id: "echo", label: "Echo", description: "Minimalist Pulse", icon: IoRadioOutline },
];

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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" }}
                            transition={{ type: "spring", damping: 32, stiffness: 300, mass: 0.8 }}
                            className="pointer-events-auto w-full max-w-[400px] bg-background/80 backdrop-blur-3xl rounded-[32px] shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Grain Texture */}
                            <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none z-[-1]" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 relative z-10">
                                <span className="text-[13px] font-semibold tracking-tight">Face Style</span>
                                <button
                                    onClick={onClose}
                                    className="size-9 rounded-full flex items-center justify-center hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-95"
                                >
                                    <IoCloseOutline className="size-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-2.5">
                                    {VARIANTS.map((v) => {
                                        const isActive = currentVariant === v.id;
                                        const Icon = v.icon;
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => onVariantChange(v.id)}
                                                className={cn(
                                                    "relative px-4 py-3.5 rounded-[20px] transition-all duration-300 flex items-center gap-4 text-left group border backdrop-blur-md",
                                                    isActive 
                                                        ? "bg-foreground text-background border-transparent shadow-lg" 
                                                        : "bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-foreground"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                                                    isActive ? "bg-background/20" : "bg-foreground/5 dark:bg-white/5"
                                                )}>
                                                    <Icon className="size-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[13px] font-semibold tracking-tight block">
                                                        {v.label}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[11px] block mt-0.5",
                                                        isActive ? "opacity-70" : "text-muted-foreground"
                                                    )}>
                                                        {v.description}
                                                    </span>
                                                </div>
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="variant-check"
                                                        className="size-5 rounded-full bg-background text-foreground flex items-center justify-center shadow-sm"
                                                    >
                                                        <IoCheckmarkOutline className="size-3.5" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
});
