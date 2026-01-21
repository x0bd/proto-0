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
    IoCheckmarkOutline,
    IoToggle
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
    { id: "emotionAi", icon: IoFlashOutline, title: "Emotion AI", desc: "LLM-driven emotion choreography.", chip: "Beta" },
    { id: "sentimentHeuristics", icon: IoPulseOutline, title: "Sentiment Heuristics", desc: "Client-side valence mapping.", chip: "Active" },
    { id: "softBodyGaze", icon: IoSparklesOutline, title: "Soft-Body Gaze", desc: "Saccades, inertia for eyes.", chip: "Physics" },
    { id: "soundDesign", icon: IoVolumeHighOutline, title: "Sound Design", desc: "Ambient tones tied to emotion.", chip: "Audio" },
    { id: "reducedMotion", icon: IoPulseOutline, title: "Reduced Motion", desc: "Accessibility-first animation.", chip: "A11y" },
];

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-foreground" : "bg-muted-foreground/20"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none block h-3.5 w-3.5 rounded-full bg-background ring-0 shadow-lg transition-transform",
                    checked ? "translate-x-4.5" : "translate-x-1"
                )}
            />
        </button>
    );
}

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
                            className="pointer-events-auto w-full max-w-[500px] bg-background/80 backdrop-blur-3xl rounded-[32px] shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Grain Texture (Matching Console) */}
                            <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none z-[-1]" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 relative z-10">
                                <div className="flex items-center gap-1 p-1 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/5">
                                    <button 
                                        onClick={() => setActiveTab("identity")}
                                        className={cn(
                                            "px-5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all",
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
                                            "px-5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all",
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
                            <div className="p-6 overflow-y-auto max-h-[60vh] min-h-[300px] scrollbar-none">
                                <AnimatePresence mode="wait">
                                    {activeTab === "identity" ? (
                                        <motion.div
                                            key="identity"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                            className="space-y-6"
                                        >
                                            {/* Section Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-micro opacity-80">
                                                    <IoColorPaletteOutline className="size-3.5" />
                                                    <span>Style Preset</span>
                                                </div>
                                            </div>

                                            {/* Variant Cards */}
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

                                            {/* Footer Note */}
                                            <div className="pt-2 text-center">
                                                <span className="text-[9px] text-muted-foreground/30 font-mono uppercase tracking-[0.2em]">
                                                    System Sync Active
                                                </span>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="intelligence"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                            className="space-y-8"
                                        >
                                            {/* Brain Connection (API) */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-micro opacity-80">
                                                    <IoHardwareChipOutline className="size-3.5" />
                                                    <span>Cortex Uplink</span>
                                                </div>

                                                <div className="space-y-3 bg-white/40 dark:bg-white/5 p-4 rounded-[24px] border border-white/20 dark:border-white/5 backdrop-blur-md">
                                                    {/* Base URL */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] text-muted-foreground/60 uppercase ml-2 font-medium tracking-wider">
                                                            Endpoint
                                                        </label>
                                                        <div className="relative group">
                                                            <IoGlobeOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5 group-focus-within:text-foreground transition-colors" />
                                                            <input 
                                                                type="text" 
                                                                value={aiConfig.baseUrl}
                                                                onChange={(e) => onAiConfigChange({ ...aiConfig, baseUrl: e.target.value })}
                                                                placeholder="https://api.openai.com/v1"
                                                                className="w-full bg-background/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-foreground/20 transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* API Key */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] text-muted-foreground/60 uppercase ml-2 font-medium tracking-wider">
                                                            Secret Key
                                                        </label>
                                                        <div className="relative group">
                                                            <IoKeyOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5 group-focus-within:text-foreground transition-colors" />
                                                            <input 
                                                                type="password" 
                                                                value={aiConfig.apiKey}
                                                                onChange={(e) => onAiConfigChange({ ...aiConfig, apiKey: e.target.value })}
                                                                placeholder="sk-..."
                                                                className="w-full bg-background/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-foreground/20 transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Model */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] text-muted-foreground/60 uppercase ml-2 font-medium tracking-wider">
                                                            Model ID
                                                        </label>
                                                        <div className="relative group">
                                                            <IoCubeOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5 group-focus-within:text-foreground transition-colors" />
                                                            <input 
                                                                type="text" 
                                                                value={aiConfig.model}
                                                                onChange={(e) => onAiConfigChange({ ...aiConfig, model: e.target.value })}
                                                                placeholder="gpt-4o-mini"
                                                                className="w-full bg-background/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-foreground/20 transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Labs Section (Modules) */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-micro opacity-80">
                                                    <IoSparklesOutline className="size-3.5" />
                                                    <span>Experimental Modules</span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    {LAB_FEATURES.map((feature) => {
                                                        const isActive = labs[feature.id];
                                                        const Icon = feature.icon;
                                                        return (
                                                            <div
                                                                key={feature.id}
                                                                className={cn(
                                                                    "flex items-center justify-between p-3.5 rounded-[20px] transition-all border backdrop-blur-sm",
                                                                    isActive
                                                                        ? "bg-foreground/5 border-foreground/10"
                                                                        : "bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                                    <div className={cn(
                                                                        "size-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                                                        isActive ? "bg-foreground text-background" : "bg-foreground/5 text-muted-foreground"
                                                                    )}>
                                                                        <Icon className="size-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 pr-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[13px] font-medium tracking-tight truncate">
                                                                                {feature.title}
                                                                            </span>
                                                                            {feature.chip && (
                                                                                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 bg-foreground/5 px-1.5 py-0.5 rounded-[6px] shrink-0">
                                                                                    {feature.chip}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] text-muted-foreground/70 truncate leading-relaxed">
                                                                            {feature.desc}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Switch 
                                                                    checked={isActive} 
                                                                    onChange={() => toggleLab(feature.id)} 
                                                                />
                                                            </div>
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
