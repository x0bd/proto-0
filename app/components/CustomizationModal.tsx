"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoCloseOutline, IoDesktopOutline, IoPencilOutline, IoEllipseOutline, IoHardwareChipOutline, IoColorPaletteOutline, IoKeyOutline, IoGlobeOutline, IoCubeOutline, IoFlashOutline, IoSparklesOutline, IoVolumeHighOutline, IoPulseOutline } from "react-icons/io5";
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

function LabToggle({
	active,
	onClick,
	icon,
	title,
	desc,
	chip,
}: {
	active: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	title: string;
	desc: string;
	chip?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full text-left flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all ${
				active
					? "border-foreground/20 bg-foreground/5 text-foreground"
					: "border-foreground/5 hover:border-foreground/10 bg-transparent text-muted-foreground hover:text-foreground"
			}`}
		>
			<div className={`mt-0.5 size-9 rounded-xl flex items-center justify-center ${active ? "bg-foreground text-background" : "bg-foreground/5 text-foreground"}`}>
				{icon}
			</div>
			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold tracking-tight">{title}</span>
					{chip && (
						<span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
							{chip}
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
			</div>
			<div
				className={`mt-1 size-5 rounded-full border flex items-center justify-center ${
					active ? "border-foreground bg-foreground text-background" : "border-foreground/30"
				}`}
			>
				<div className={`size-2 rounded-full ${active ? "bg-background" : "bg-transparent"}`} />
			</div>
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
	const [labs, setLabs] = React.useState({
		emotionAi: false,
		sentimentHeuristics: true,
		softBodyGaze: false,
		soundDesign: false,
		reducedMotion: false,
	});

	// hydrate labs from localStorage
	React.useEffect(() => {
		try {
			const saved = localStorage.getItem("dot_labs_settings");
			if (saved) {
				setLabs((prev) => ({ ...prev, ...JSON.parse(saved) }));
			}
		} catch {
			// ignore
		}
	}, []);

	// persist labs
	React.useEffect(() => {
		try {
			localStorage.setItem("dot_labs_settings", JSON.stringify(labs));
		} catch {
			// ignore
		}
	}, [labs]);

	const toggleLab = (key: keyof typeof labs) => {
		setLabs((prev) => ({ ...prev, [key]: !prev[key] }));
	};

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
							className="pointer-events-auto w-full max-w-[560px] bg-background/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 dark:border-white/5 flex flex-col gap-6 overflow-hidden"
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

											{/* Labs backbone (from cool.md vision) */}
											<div className="space-y-3 rounded-2xl border border-white/10 bg-foreground/3 p-4">
												<div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
													<IoSparklesOutline className="size-4" />
													Labs Backbone
												</div>
												<p className="text-[12px] text-muted-foreground leading-relaxed">
													Feature flags to align with the roadmap in <span className="font-mono">cool.md</span>. Stored locally so we can wire them later.
												</p>

												<div className="space-y-2">
													<LabToggle
														active={labs.emotionAi}
														onClick={() => toggleLab("emotionAi")}
														icon={<IoFlashOutline className="size-4" />}
														title="Emotion AI (LLM-driven)"
														desc="Use LLM intent/sentiment to drive emotion choreography."
														chip="Next: plug Vercel AI SDK"
													/>
													<LabToggle
														active={labs.sentimentHeuristics}
														onClick={() => toggleLab("sentimentHeuristics")}
														icon={<IoPulseOutline className="size-4" />}
														title="Sentiment Heuristics"
														desc="Client-side valence/keyword mapping to emotions."
														chip="Fast layer"
													/>
													<LabToggle
														active={labs.softBodyGaze}
														onClick={() => toggleLab("softBodyGaze")}
														icon={<IoSparklesOutline className="size-4" />}
														title="Soft-Body Gaze"
														desc="Saccades, inertia, and mood momentum for eyes/head."
														chip="Physics 2.0"
													/>
													<LabToggle
														active={labs.soundDesign}
														onClick={() => toggleLab("soundDesign")}
														icon={<IoVolumeHighOutline className="size-4" />}
														title="Sound Design"
														desc="Hover/boop/ambient tones tied to emotion."
														chip="Audio"
													/>
													<LabToggle
														active={labs.reducedMotion}
														onClick={() => toggleLab("reducedMotion")}
														icon={<IoPulseOutline className="size-4 rotate-90" />}
														title="Respect Reduced Motion"
														desc="Tone down animation amplitude/duration for accessibility."
														chip="A11y"
													/>
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
