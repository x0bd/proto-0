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

const VARIANTS: { id: FaceVariant; label: string }[] = [
	{ id: "minimal", label: "Pure" },
	{ id: "tron", label: "Digital" },
	{ id: "analogue", label: "Sketch" },
];

const COLORS = [
	{ id: "neutral", label: "Sumi", class: "bg-neutral-900 dark:bg-neutral-100" },
	{ id: "rose", label: "Sakura", class: "bg-rose-400" },
	{ id: "cyan", label: "Ice", class: "bg-cyan-400" },
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
						className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-md"
						onClick={onClose}
					/>

					{/* Card */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ type: "spring", damping: 25, stiffness: 320 }}
							className="pointer-events-auto w-full max-w-[340px] bg-background/90 backdrop-blur-2xl shadow-zen rounded-[32px] p-6 relative border border-foreground/5"
							onClick={(e) => e.stopPropagation()}
						>
                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            
                            <h2 className="text-lg font-medium tracking-tight mb-8 ml-1">Settings</h2>

							<div className="space-y-8">
                                {/* Type */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground ml-1 mb-3 block">Appearance</label>
                                    <div className="flex bg-foreground/5 p-1 rounded-2xl">
                                        {VARIANTS.map((v) => {
                                            const isActive = currentVariant === v.id;
                                            return (
                                                <button
                                                    key={v.id}
                                                    onClick={() => onVariantChange(v.id)}
                                                    className="flex-1 relative py-2.5 text-xs font-medium transition-all"
                                                >
                                                    {isActive && (
                                                        <motion.div 
                                                            layoutId="variant-tab"
                                                            className="absolute inset-0 bg-background shadow-sm rounded-xl"
                                                        />
                                                    )}
                                                    <span className={`relative z-10 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {v.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

								{/* Color */}
								<div>
                                    <label className="text-xs font-medium text-muted-foreground ml-1 mb-3 block">Accent</label>
									<div className="flex gap-3 pl-1">
										{COLORS.map((c) => {
											const isActive = accentColor === c.id;
											return (
												<button
													key={c.id}
													onClick={() => onAccentChange(c.id)}
													className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isActive ? "scale-110" : "hover:scale-105"}`}
												>
                                                    <div className={`w-full h-full rounded-full ${c.class} shadow-sm border border-black/5 opacity-80`} />
												</button>
											);
										})}
									</div>
								</div>
							</div>
                            
                            <div className="mt-8 pt-6 border-t border-foreground/5 flex justify-center">
                                <span className="text-[10px] text-muted-foreground/50 font-medium">
                                    Designed in Void
                                </span>
                            </div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
