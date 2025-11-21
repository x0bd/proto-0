"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Zap, Volume2, Vibrate, Smile, Eye, Accessibility } from "lucide-react";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function SettingCard({ icon: Icon, label, description }: { icon: any; label: string; description: string }) {
	return (
		<button className="w-full text-left group">
			<div className="relative p-5 transition-all duration-150 hover:translate-y-[-1px]">
				<div className="flex items-start gap-4">
					<div className="mt-1 w-10 h-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-foreground/[0.08] transition-colors">
						<Icon className="w-[18px] h-[18px] text-foreground/60" strokeWidth={1.5} />
					</div>
					<div className="flex-1 min-w-0 pt-1">
						<h3 className="text-[15px] font-medium text-foreground leading-tight mb-1.5">
							{label}
						</h3>
						<p className="text-[13px] text-muted-foreground leading-relaxed">
							{description}
						</p>
					</div>
				</div>
				<div className="absolute bottom-0 left-0 right-0 h-[1px] bg-border opacity-0 group-hover:opacity-100 transition-opacity" />
			</div>
		</button>
	);
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
						className="fixed inset-0 z-[100] bg-black/40"
						onClick={onClose}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							transition={{
								duration: 0.3,
								ease: [0.16, 1, 0.3, 1]
							}}
							className="pointer-events-auto w-full max-w-[680px]"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Pure solid design */}
							<div className="bg-background border border-border shadow-lg rounded-none overflow-hidden">
								{/* Header */}
								<div className="px-8 pt-8 pb-6 border-b border-border">
									<div className="flex items-start justify-between">
										<div>
											<h2 className="text-[17px] font-medium text-foreground tracking-[-0.01em] leading-tight">
												Customization
											</h2>
											<p className="text-[12px] text-muted-foreground mt-1.5 tracking-wide">
												Configure your Kokoro experience
											</p>
										</div>

										<button
											onClick={onClose}
											className="w-8 h-8 rounded-none flex items-center justify-center hover:bg-foreground/[0.04] transition-colors"
										>
											<X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
										</button>
									</div>
								</div>

								{/* Content */}
								<div className="px-8 py-2">
									<div className="divide-y divide-border">
										{/* Animation Settings */}
										<SettingCard
											icon={Zap}
											label="Animation Speed"
											description="Control animation timing and easing curves"
										/>

										{/* Audio Settings */}
										<SettingCard
											icon={Volume2}
											label="Sound Design"
											description="Hover sounds and emotion-based ambient tones"
										/>

										{/* Haptic Feedback */}
										<SettingCard
											icon={Vibrate}
											label="Haptic Feedback"
											description="Vibration patterns for interactions on mobile"
										/>

										{/* Emotion Presets */}
										<SettingCard
											icon={Smile}
											label="Emotion Presets"
											description="Save, share and manage emotion scenes"
										/>

										{/* Face Customization */}
										<SettingCard
											icon={Eye}
											label="Face Geometry"
											description="Customize eye shapes and mouth styles"
										/>

										{/* Accessibility */}
										<SettingCard
											icon={Accessibility}
											label="Accessibility"
											description="Reduced motion and high contrast modes"
										/>
									</div>
								</div>

								{/* Footer */}
								<div className="px-8 py-5 border-t border-border bg-muted/30">
									<div className="flex items-center justify-between">
										<p className="text-[11px] text-muted-foreground/40 tracking-widest uppercase">
											v1.0
										</p>
										<button
											onClick={onClose}
											className="h-9 px-6 bg-foreground text-background text-[13px] font-medium rounded-none hover:opacity-90 transition-opacity"
										>
											Done
										</button>
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
