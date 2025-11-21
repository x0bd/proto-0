"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CustomizationModal({ isOpen, onClose }: CustomizationModalProps) {
	return (
		<AnimatePresence mode="wait">
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/40 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
							animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
							transition={{
								type: "spring",
								damping: 25,
								stiffness: 300,
								mass: 0.8,
							}}
							className="pointer-events-auto w-full max-w-2xl"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
								{/* Header */}
								<div className="relative px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
									{/* Subtle noise texture */}
									<div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
									
									<div className="relative flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-[0.875rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
												<Sparkles className="w-5 h-5 text-primary" />
											</div>
											<div>
												<h2 className="text-lg font-medium tracking-tight text-foreground">
													Customization
												</h2>
												<p className="text-[11px] text-muted-foreground tracking-wide font-mono uppercase mt-0.5">
													Personalize Kokoro
												</p>
											</div>
										</div>

										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors -mr-2 -mt-1"
											onClick={onClose}
										>
											<X className="h-4 w-4 text-muted-foreground" />
										</Button>
									</div>
								</div>

								{/* Content */}
								<div className="relative px-8 py-8">
									{/* Subtle noise texture */}
									<div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
									
									<div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Placeholder sections - to be filled with customization options */}
										<div className="space-y-3">
											<label className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
												Appearance
											</label>
											<div className="h-32 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group">
												<span className="text-sm text-muted-foreground/50 group-hover:text-primary transition-colors">
													Theme & Colors
												</span>
											</div>
										</div>

										<div className="space-y-3">
											<label className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
												Voice Settings
											</label>
											<div className="h-32 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group">
												<span className="text-sm text-muted-foreground/50 group-hover:text-primary transition-colors">
													Voice Model
												</span>
											</div>
										</div>

										<div className="space-y-3 md:col-span-2">
											<label className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
												Emotion Presets
											</label>
											<div className="h-24 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group">
												<span className="text-sm text-muted-foreground/50 group-hover:text-primary transition-colors">
													Manage Presets
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Footer */}
								<div className="relative px-8 py-6 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
									{/* Subtle noise texture */}
									<div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
									
									<div className="relative flex items-center justify-between">
										<p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase font-mono">
											ココロ v1.0
										</p>
										<Button
											onClick={onClose}
											className="h-9 px-6 rounded-full text-sm font-medium shadow-sm hover:shadow transition-all"
										>
											Done
										</Button>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
