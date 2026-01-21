"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoCloseOutline, IoDesktopOutline, IoPencilOutline, IoEllipseOutline, IoHardwareChipOutline, IoColorPaletteOutline, IoKeyOutline, IoGlobeOutline, IoCubeOutline } from "react-icons/io5";
import { FaceVariant } from "./face/types";

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

const VARIANTS: { id: FaceVariant; label: string; description: string; icon: any }[] = [
	{ id: "minimal", label: "PURE", description: "Essential form", icon: IoEllipseOutline },
	{ id: "tron", label: "DIGITAL", description: "System aesthetics", icon: IoDesktopOutline },
	{ id: "analogue", label: "SKETCH", description: "Hand-drawn lines", icon: IoPencilOutline },
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
							className="pointer-events-auto w-full max-w-[420px] bg-background/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 dark:border-white/5 flex flex-col gap-6 overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setActiveTab("identity")}
                                        className={`text-lg font-medium tracking-tight transition-colors ${activeTab === "identity" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Identity
                                    </button>
                                    <div className="h-4 w-px bg-border/50" />
                                    <button 
                                        onClick={() => setActiveTab("intelligence")}
                                        className={`text-lg font-medium tracking-tight transition-colors ${activeTab === "intelligence" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Intelligence
                                    </button>
								</div>
                                <button
                                    onClick={onClose}
                                    className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <IoCloseOutline className="size-5" />
                                </button>
							</div>

							<div className="relative">
                                <AnimatePresence mode="wait">
                                    {activeTab === "identity" ? (
                                        <motion.div
                                            key="identity"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase pl-1 opacity-70 flex items-center gap-2">
                                                    <IoColorPaletteOutline /> STYLE PRESET
                                                </label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {VARIANTS.map((v) => {
                                                        const isActive = currentVariant === v.id;
                                                        const Icon = v.icon;
                                                        return (
                                                            <button
                                                                key={v.id}
                                                                onClick={() => onVariantChange(v.id)}
                                                                className={`relative p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 text-left group
                                                                    ${isActive 
                                                                        ? "bg-foreground/10 text-foreground" 
                                                                        : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                                                                    }`}
                                                            >
                                                                <div className={`p-2 rounded-xl ${isActive ? "bg-foreground text-background" : "bg-foreground/5"}`}>
                                                                    <Icon className="size-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="text-xs font-bold tracking-wide uppercase block">
                                                                        {v.label}
                                                                    </span>
                                                                    <span className="text-[10px] opacity-60 block">
                                                                        {v.description}
                                                                    </span>
                                                                </div>
                                                                {isActive && (
                                                                    <motion.div layoutId="active-indicator" className="size-1.5 rounded-full bg-foreground mr-2" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <p className="text-[10px] text-muted-foreground/40 text-center font-mono uppercase tracking-widest">
                                                    Color Adapts to System Theme
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="intelligence"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                 <label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase pl-1 opacity-70 flex items-center gap-2">
                                                    <IoHardwareChipOutline /> API CONFIGURATION
                                                </label>

                                                <div className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] text-muted-foreground uppercase ml-1 flex items-center gap-1.5">
                                                            <IoGlobeOutline className="size-3" /> Base URL
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            value={aiConfig.baseUrl}
                                                            onChange={(e) => onAiConfigChange({ ...aiConfig, baseUrl: e.target.value })}
                                                            placeholder="https://api.openai.com/v1"
                                                            className="w-full bg-foreground/5 border border-transparent focus:border-foreground/20 rounded-xl px-4 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none transition-all"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] text-muted-foreground uppercase ml-1 flex items-center gap-1.5">
                                                            <IoKeyOutline className="size-3" /> API Key
                                                        </label>
                                                        <input 
                                                            type="password" 
                                                            value={aiConfig.apiKey}
                                                            onChange={(e) => onAiConfigChange({ ...aiConfig, apiKey: e.target.value })}
                                                            placeholder="sk-..."
                                                            className="w-full bg-foreground/5 border border-transparent focus:border-foreground/20 rounded-xl px-4 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none transition-all"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] text-muted-foreground uppercase ml-1 flex items-center gap-1.5">
                                                            <IoCubeOutline className="size-3" /> Model ID
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            value={aiConfig.model}
                                                            onChange={(e) => onAiConfigChange({ ...aiConfig, model: e.target.value })}
                                                            placeholder="gpt-4o-mini"
                                                            className="w-full bg-foreground/5 border border-transparent focus:border-foreground/20 rounded-xl px-4 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <p className="text-[10px] text-muted-foreground/40 text-center font-mono uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                                        Keys are stored locally on your device.
                                                    </p>
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
