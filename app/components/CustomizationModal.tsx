"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    IoCloseOutline, 
    IoDesktopOutline, 
    IoPencilOutline, 
    IoEllipseOutline, 
    IoHardwareChipOutline, 
    IoColorPaletteOutline, 
    IoKeyOutline, 
    IoGlobeOutline, 
    IoCubeOutline, 
    IoFlashOutline, 
    IoSparklesOutline, 
    IoVolumeHighOutline, 
    IoPulseOutline,
    IoCheckmarkOutline
} from "react-icons/io5";
import { FaceVariant } from "./face/types";
import { cn } from "@/lib/utils";

export interface AIConfig {
    baseUrl: string;
    apiKey: string;
    model: string;
}

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVariant: FaceVariant;
    onVariantChange: (variant: FaceVariant) => void;
    accentColor: string;
    onAccentChange: (color: string) => void;
    aiConfig: AIConfig;
    onAiConfigChange: (config: AIConfig) => void;
}

const VARIANTS: { id: FaceVariant; label: string; description: string; icon: React.ElementType }[] = [
    { id: "minimal", label: "Pure", description: "Essential form", icon: IoEllipseOutline },
    { id: "tron", label: "Digital", description: "System aesthetics", icon: IoDesktopOutline },
    { id: "analogue", label: "Sketch", description: "Hand-drawn lines", icon: IoPencilOutline },
];

interface LabFeature {
    id: string;
    icon: React.ElementType;
    title: string;
    desc: string;
    chip?: string;
}

const LAB_FEATURES: LabFeature[] = [
    { id: "emotionAi", icon: IoFlashOutline, title: "Emotion AI", desc: "LLM-driven emotion choreography.", chip: "Soon" },
    { id: "sentimentHeuristics", icon: IoPulseOutline, title: "Sentiment Heuristics", desc: "Client-side valence mapping.", chip: "Active" },
    { id: "softBodyGaze", icon: IoSparklesOutline, title: "Soft-Body Gaze", desc: "Saccades, inertia for eyes.", chip: "Physics" },
    { id: "soundDesign", icon: IoVolumeHighOutline, title: "Sound Design", desc: "Ambient tones tied to emotion.", chip: "Audio" },
    { id: "reducedMotion", icon: IoPulseOutline, title: "Reduced Motion", desc: "Accessibility-first animation.", chip: "A11y" },
];

export const CustomizationModal = React.memo(function CustomizationModal({
    isOpen,
    onClose,
    currentVariant,
    onVariantChange,
    aiConfig,
    onAiConfigChange,
}: CustomizationModalProps) {
    const [activeTab, setActiveTab] = React.useState<"identity" | "intelligence">("identity");
    const [labs, setLabs] = React.useState<Record<string, boolean>>({
        emotionAi: false,
        sentimentHeuristics: true,
        softBodyGaze: false,
        soundDesign: false,
        reducedMotion: false,
    });

    React.useEffect(() => {
        try {
            const saved = localStorage.getItem("dot_labs_settings");
            if (saved) setLabs((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch { /* ignore */ }
    }, []);

    React.useEffect(() => {
        try {
            localStorage.setItem("dot_labs_settings", JSON.stringify(labs));
        } catch { /* ignore */ }
    }, [labs]);

    const toggleLab = (id: string) => setLabs((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" }}
                            transition={{ type: "spring", damping: 32, stiffness: 300, mass: 0.8 }}
                            className="pointer-events-auto w-full max-w-[520px] bg-background/90 backdrop-blur-3xl rounded-[32px] shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Grain */}
                            <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none z-[-1]" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
                                <div className="flex items-center gap-1 p-1 bg-foreground/5 rounded-full">
                                    <button 
                                        onClick={() => setActiveTab("identity")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[12px] font-medium tracking-wide transition-all",
                                            activeTab === "identity" 
                                                ? "bg-foreground text-background shadow-sm" 
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Identity
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab("intelligence")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[12px] font-medium tracking-wide transition-all",
                                            activeTab === "intelligence" 
                                                ? "bg-foreground text-background shadow-sm" 
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Intelligence
                                    </button>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-9 rounded-full flex items-center justify-center hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-95"
                                >
                                    <IoCloseOutline className="size-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[65vh]">
                                <AnimatePresence mode="wait">
                                    {activeTab === "identity" ? (
                                        <motion.div
                                            key="identity"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                            className="space-y-5"
                                        >
                                            {/* Section Header */}
                                            <div className="flex items-center gap-2 text-micro opacity-60">
                                                <IoColorPaletteOutline className="size-3.5" />
                                                <span>Style Preset</span>
                                            </div>

                                            {/* Variant Cards */}
                                            <div className="grid grid-cols-3 gap-3">
                                                {VARIANTS.map((v) => {
                                                    const isActive = currentVariant === v.id;
                                                    const Icon = v.icon;
                                                    return (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => onVariantChange(v.id)}
                                                            className={cn(
                                                                "relative p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-3 text-center group border",
                                                                isActive 
                                                                    ? "bg-foreground text-background border-transparent shadow-lg" 
                                                                    : "bg-white/30 dark:bg-white/5 border-white/10 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10 text-foreground"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "size-10 rounded-xl flex items-center justify-center transition-all",
                                                                isActive ? "bg-background/20" : "bg-foreground/5"
                                                            )}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[11px] font-bold tracking-widest uppercase block">
                                                                    {v.label}
                                                                </span>
                                                                <span className="text-[9px] opacity-50 block mt-0.5">
                                                                    {v.description}
                                                                </span>
                                                            </div>
                                                            {isActive && (
                                                                <motion.div 
                                                                    layoutId="variant-check"
                                                                    className="absolute top-2 right-2 size-4 bg-background/30 rounded-full flex items-center justify-center"
                                                                >
                                                                    <IoCheckmarkOutline className="size-3" />
                                                                </motion.div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Footer Note */}
                                            <p className="text-[10px] text-muted-foreground/40 text-center font-mono uppercase tracking-widest pt-2">
                                                Color Adapts to System Theme
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="intelligence"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                            className="space-y-6"
                                        >
                                            {/* API Configuration */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-micro opacity-60">
                                                    <IoHardwareChipOutline className="size-3.5" />
                                                    <span>API Configuration</span>
                                                </div>

                                                <div className="space-y-3">
                                                    {/* Base URL */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] text-muted-foreground/60 uppercase ml-1 flex items-center gap-1.5">
                                                            <IoGlobeOutline className="size-3" /> Base URL
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            value={aiConfig.baseUrl}
                                                            onChange={(e) => onAiConfigChange({ ...aiConfig, baseUrl: e.target.value })}
                                                            placeholder="https://api.openai.com/v1"
                                                            className="w-full bg-white/40 dark:bg-white/5 border border-white/10 focus:border-foreground/20 rounded-xl px-4 py-2.5 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none transition-all focus:ring-1 focus:ring-foreground/10"
                                                        />
                                                    </div>

                                                    {/* API Key */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] text-muted-foreground/60 uppercase ml-1 flex items-center gap-1.5">
                                                            <IoKeyOutline className="size-3" /> API Key
                                                        </label>
                                                        <input 
                                                            type="password" 
                                                            value={aiConfig.apiKey}
                                                            onChange={(e) => onAiConfigChange({ ...aiConfig, apiKey: e.target.value })}
                                                            placeholder="sk-..."
                                                            className="w-full bg-white/40 dark:bg-white/5 border border-white/10 focus:border-foreground/20 rounded-xl px-4 py-2.5 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none transition-all focus:ring-1 focus:ring-foreground/10"
                                                        />
                                                    </div>

                                                    {/* Model */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] text-muted-foreground/60 uppercase ml-1 flex items-center gap-1.5">
                                                            <IoCubeOutline className="size-3" /> Model ID
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            value={aiConfig.model}
                                                            onChange={(e) => onAiConfigChange({ ...aiConfig, model: e.target.value })}
                                                            placeholder="gpt-4o-mini"
                                                            className="w-full bg-white/40 dark:bg-white/5 border border-white/10 focus:border-foreground/20 rounded-xl px-4 py-2.5 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none transition-all focus:ring-1 focus:ring-foreground/10"
                                                        />
                                                    </div>
                                                </div>

                                                <p className="text-[9px] text-muted-foreground/40 text-center font-mono uppercase tracking-widest">
                                                    Keys stored locally on your device
                                                </p>
                                            </div>

                                            {/* Labs Section */}
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center gap-2 text-micro opacity-60">
                                                    <IoSparklesOutline className="size-3.5" />
                                                    <span>Labs</span>
                                                    <span className="text-[8px] bg-foreground/10 px-1.5 py-0.5 rounded-full ml-auto">Experimental</span>
                                                </div>

                                                <div className="space-y-2">
                                                    {LAB_FEATURES.map((feature) => {
                                                        const isActive = labs[feature.id];
                                                        const Icon = feature.icon;
                                                        return (
                                                            <button
                                                                key={feature.id}
                                                                type="button"
                                                                onClick={() => toggleLab(feature.id)}
                                                                className={cn(
                                                                    "w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all border",
                                                                    isActive
                                                                        ? "border-foreground/20 bg-foreground/5"
                                                                        : "border-transparent hover:bg-foreground/5"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "size-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                                    isActive ? "bg-foreground text-background" : "bg-foreground/5 text-muted-foreground"
                                                                )}>
                                                                    <Icon className="size-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[12px] font-medium tracking-tight truncate">{feature.title}</span>
                                                                        {feature.chip && (
                                                                            <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/50 bg-foreground/5 px-1.5 py-0.5 rounded shrink-0">
                                                                                {feature.chip}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] text-muted-foreground/60 truncate">{feature.desc}</p>
                                                                </div>
                                                                <div className={cn(
                                                                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                                    isActive ? "border-foreground bg-foreground" : "border-muted-foreground/30"
                                                                )}>
                                                                    {isActive && <IoCheckmarkOutline className="size-3 text-background" />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
});
