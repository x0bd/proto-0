"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Monitor, Edit3, Sparkles, Circle } from "lucide-react";
import { FaceVariant } from "./face/types";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: FaceVariant;
	onVariantChange: (variant: FaceVariant) => void;
	accentColor: string;
	onAccentChange: (color: string) => void;
}

const VARIANTS: { id: FaceVariant; label: string; description: string; icon: any }[] = [
	{ id: "minimal", label: "PURE", description: "Essential form", icon: Circle },
	{ id: "tron", label: "DIGITAL", description: "System aesthetics", icon: Monitor },
	{ id: "analogue", label: "SKETCH", description: "Hand-drawn lines", icon: Edit3 },
	{ id: "neko", label: "NEKO", description: "Playful spirit", icon: Sparkles },
];

const COLORS = [
	{ id: "neutral", label: "SUMI", class: "bg-foreground" },
	{ id: "rose", label: "SAKURA", class: "bg-rose-500" },
	{ id: "cyan", label: "ICE", class: "bg-cyan-500" },
];

export const CustomizationModal = React.memo(function CustomizationModal({
	isOpen,
	onClose,
	currentVariant,
	onVariantChange,
	accentColor,
	onAccentChange,
}: CustomizationModalProps) {
	return (
		<AnimatePresence mode="wait">
			{isOpen && (
				<>
					{/* Backdrop: Soft matte blur */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-3xl"
						onClick={onClose}
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ type: "spring", damping: 30, stiffness: 350 }}
							// Matte Glass Style: No border, just mass and shadow
							className="pointer-events-auto w-full max-w-[420px] glass-card rounded-[2.5rem] p-10 relative shadow-premium flex flex-col gap-10"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								onClick={onClose}
								className="absolute top-8 right-8 size-10 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all duration-300 click-tactic text-muted-foreground hover:text-foreground"
							>
								<X className="size-5" />
							</button>
							
							{/* Header: Fukasawa Minimal */}
							<div>
								<h2 className="text-2xl font-light tracking-tight text-foreground">Settings</h2>
								<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase opacity-60 mt-1">
									SYSTEM_CONFIGURATION_V1.0
								</p>
							</div>

							<div className="space-y-10">
								{/* Appearance Selection */}
								<div className="space-y-4">
									<label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block pl-1 opacity-70">
										APPEARANCE_MODULE
									</label>
									<div className="grid grid-cols-2 gap-3">
										{VARIANTS.map((v) => {
											const isActive = currentVariant === v.id;
											const Icon = v.icon;
											return (
												<button
													key={v.id}
													onClick={() => onVariantChange(v.id)}
													className={`relative p-5 rounded-[1.5rem] transition-all duration-300 click-tactic text-left group overflow-hidden ${
														isActive 
															? "bg-foreground text-background shadow-lg" 
															: "bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
													}`}
												>
													<div className="relative z-10 flex flex-col gap-3">
														<Icon className="size-5" strokeWidth={1.5} />
														<div>
															<span className="text-[11px] font-bold tracking-widest uppercase block mb-0.5 font-mono">
																{v.label}
															</span>
															<span className={`text-[10px] block opacity-70 ${isActive ? "text-background/80" : "text-muted-foreground"}`}>
																{v.description}
															</span>
														</div>
													</div>
												</button>
											);
										})}
									</div>
								</div>

								{/* Accent Color Selection */}
								<div className="space-y-4">
									<label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block pl-1 opacity-70">
										ACCENT_FREQUENCY
									</label>
									<div className="flex gap-4">
										{COLORS.map((c) => {
											const isActive = accentColor === c.id;
											return (
												<button
													key={c.id}
													onClick={() => onAccentChange(c.id)}
													className="group flex flex-col items-center gap-3"
												>
													<div className={`
														size-14 rounded-full flex items-center justify-center transition-all duration-300 click-tactic
														${isActive ? "ring-1 ring-foreground ring-offset-4 ring-offset-card shadow-lg" : "hover:scale-105 opacity-80 hover:opacity-100"}
													`}>
														<div className={`size-14 rounded-full ${c.class} shadow-inner bg-gradient-to-br from-white/20 to-transparent`} />
													</div>
													<span className={`text-[9px] font-mono tracking-widest uppercase transition-colors ${isActive ? "text-foreground font-bold" : "text-muted-foreground"}`}>
														{c.label}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							</div>
							
							{/* Footer */}
							<div className="pt-8 border-t border-foreground/5 flex justify-center">
								<span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground/40 uppercase">
									DESIGNED_BY_NAOTO_X_TRAF
								</span>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
