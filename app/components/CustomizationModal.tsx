"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	X,
	Zap,
	Volume2,
	Vibrate,
	Smile,
	Eye,
	Accessibility,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function SettingCard({
	icon: Icon,
	label,
	description,
}: {
	icon: any;
	label: string;
	description: string;
}) {
	return (
		<button className="w-full text-left group">
			<div className="relative p-4 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl">
				<div className="flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary transition-colors">
						<Icon className="w-5 h-5" strokeWidth={2} />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-[15px] font-medium text-foreground leading-tight mb-0.5">
							{label}
						</h3>
						<p className="text-[13px] text-muted-foreground leading-normal opacity-80">
							{description}
						</p>
					</div>
				</div>
			</div>
		</button>
	);
}

export function CustomizationModal({
	isOpen,
	onClose,
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
						className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{
								opacity: 0,
								scale: 0.95,
								y: 20,
								filter: "blur(10px)",
							}}
							animate={{
								opacity: 1,
								scale: 1,
								y: 0,
								filter: "blur(0px)",
							}}
							exit={{
								opacity: 0,
								scale: 0.95,
								y: 20,
								filter: "blur(10px)",
							}}
							transition={{
								type: "spring",
								damping: 25,
								stiffness: 300,
								mass: 0.8,
							}}
							className="pointer-events-auto w-full max-w-[420px] bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col relative ring-1 ring-black/5 dark:ring-white/5"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="p-6 pb-2 flex items-center justify-between">
								<div>
									<h2 className="text-lg font-semibold text-foreground tracking-tight">
										Customization
									</h2>
									<p className="text-xs text-muted-foreground font-medium tracking-wide uppercase opacity-70 mt-1">
										Personalize Experience
									</p>
								</div>
								<button
									onClick={onClose}
									className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
								>
									<X className="w-4 h-4 text-muted-foreground" />
								</button>
							</div>

							{/* Scrollable Content */}
							<ScrollArea className="h-[60vh] max-h-[500px] px-4 pb-6">
								<div className="space-y-1 py-2">
									<SettingCard
										icon={Zap}
										label="Animation Speed"
										description="Control timing and easing curves"
									/>
									<SettingCard
										icon={Volume2}
										label="Sound Design"
										description="Hover sounds and ambient tones"
									/>
									<SettingCard
										icon={Vibrate}
										label="Haptic Feedback"
										description="Vibration patterns for mobile"
									/>
									<SettingCard
										icon={Smile}
										label="Emotion Presets"
										description="Manage saved emotion scenes"
									/>
									<SettingCard
										icon={Eye}
										label="Face Geometry"
										description="Customize eye shapes and style"
									/>
									<SettingCard
										icon={Accessibility}
										label="Accessibility"
										description="Reduced motion and high contrast"
									/>
								</div>
							</ScrollArea>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
