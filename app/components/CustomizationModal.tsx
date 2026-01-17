"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cancel01Icon, ComputerIcon, PencilEdit02Icon, CircleIcon } from "@hugeicons/react";
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
	{ id: "minimal", label: "PURE", description: "Essential form", icon: CircleIcon },
	{ id: "tron", label: "DIGITAL", description: "System aesthetics", icon: ComputerIcon },
	{ id: "analogue", label: "SKETCH", description: "Hand-drawn lines", icon: PencilEdit02Icon },
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
							className="pointer-events-auto w-full max-w-[380px] bg-background/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/10 dark:border-white/5 flex flex-col gap-8"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl font-medium tracking-tight text-foreground">Identity</h2>
									<p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase opacity-60">
										AVATAR_CONFIG
									</p>
								</div>
                                <button
                                    onClick={onClose}
                                    className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <Cancel01Icon className="size-4" />
                                </button>
							</div>

							<div className="space-y-8">
								{/* Style Section */}
								<div className="space-y-4">
									<label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase pl-1 opacity-70">
										STYLE
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
														<Icon className="size-4" strokeWidth={2} />
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

								{/* Color Section Removed - Theme Aware Only */}
								<div className="pt-2">
									<p className="text-[10px] text-muted-foreground/40 text-center font-mono uppercase tracking-widest">
										Color Adapts to System Theme
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
