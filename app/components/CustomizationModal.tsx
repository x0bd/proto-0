"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { FaceVariant } from "./face/types";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: FaceVariant;
	onVariantChange: (variant: FaceVariant) => void;
	accentColor: string;
	onAccentChange: (color: string) => void;
}

const VARIANTS: { id: FaceVariant; label: string; description: string }[] = [
	{ id: "minimal", label: "Pure", description: "Clean & simple" },
	{ id: "tron", label: "Digital", description: "Tech aesthetic" },
	{ id: "analogue", label: "Sketch", description: "Hand-drawn feel" },
	{ id: "neko", label: "Neko", description: "Playful & cute" },
];

const COLORS = [
	{ id: "neutral", label: "Sumi", class: "bg-foreground" },
	{ id: "rose", label: "Sakura", class: "bg-rose-500" },
	{ id: "cyan", label: "Ice", class: "bg-cyan-500" },
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
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-xl"
						onClick={onClose}
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="pointer-events-auto w-full max-w-[400px] bg-card/80 backdrop-blur-2xl shadow-premium rounded-[2rem] p-8 relative border border-border/40 glow-internal"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								onClick={onClose}
								className="absolute top-6 right-6 size-10 rounded-xl flex items-center justify-center hover:bg-foreground/5 transition-all duration-300 text-muted-foreground hover:text-foreground"
							>
								<X className="size-5" />
							</button>
							
							{/* Header */}
							<div className="mb-10">
								<h2 className="text-xl font-semibold tracking-tight">Settings</h2>
								<p className="text-muted-foreground text-sm mt-1">Customize your experience</p>
							</div>

							<div className="space-y-10">
								{/* Appearance Selection */}
								<div>
									<label className="text-micro block mb-4">Appearance</label>
									<div className="grid grid-cols-2 gap-2">
										{VARIANTS.map((v) => {
											const isActive = currentVariant === v.id;
											return (
												<button
													key={v.id}
													onClick={() => onVariantChange(v.id)}
													className={`relative p-4 rounded-2xl border transition-all duration-300 text-left ${
														isActive 
															? "bg-foreground/10 border-foreground/20 shadow-zen" 
															: "bg-foreground/5 border-transparent hover:bg-foreground/10"
													}`}
												>
													{isActive && (
														<div className="absolute top-3 right-3">
															<Check className="size-4 text-emerald-500" />
														</div>
													)}
													<span className={`text-sm font-medium block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
														{v.label}
													</span>
													<span className="text-xs text-muted-foreground/60 mt-0.5 block">
														{v.description}
													</span>
												</button>
											);
										})}
									</div>
								</div>

								{/* Accent Color Selection */}
								<div>
									<label className="text-micro block mb-4">Accent Color</label>
									<div className="flex gap-3">
										{COLORS.map((c) => {
											const isActive = accentColor === c.id;
											return (
												<button
													key={c.id}
													onClick={() => onAccentChange(c.id)}
													className="group flex flex-col items-center gap-2"
												>
													<div className={`
														size-12 rounded-full flex items-center justify-center transition-all duration-300
														${isActive ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"}
													`}>
														<div className={`size-10 rounded-full ${c.class} shadow-inner`} />
													</div>
													<span className={`text-xs transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
														{c.label}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							</div>
							
							{/* Footer */}
							<div className="mt-10 pt-6 border-t border-border/40 flex justify-center">
								<span className="text-micro opacity-50">
									Glass & Air • v0.9
								</span>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
