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
			<div className="relative p-5 transition-all duration-300 hover:bg-secondary/40 rounded-[1.25rem] border border-transparent hover:border-black/5 dark:hover:border-white/5">
				<div className="flex items-center gap-5">
					<div className="w-11 h-11 rounded-[1rem] bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0 text-foreground/70 transition-transform duration-300 group-hover:scale-105">
						<Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-[14px] font-medium text-foreground tracking-wide mb-0.5">
							{label}
						</h3>
						<p className="text-[12px] text-muted-foreground/80 font-mono leading-normal">
							{description}
						</p>
					</div>
					<div className="w-1.5 h-1.5 rounded-full bg-foreground/10 group-hover:bg-primary transition-colors" />
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
							{/* Texture Overlay */}
							<div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

							{/* Header */}
							<div className="relative z-10 p-8 pb-4 flex items-center justify-between">
								<div>
									<div className="flex items-center gap-3 mb-1">
										<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
										<h2 className="text-xs font-mono font-medium text-muted-foreground tracking-[0.2em] uppercase">
											System Config
										</h2>
									</div>
									<h1 className="text-2xl font-medium text-foreground tracking-tight">
										Preferences
									</h1>
								</div>
								<button
									onClick={onClose}
									className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
								>
									<X className="w-4 h-4 text-foreground/70" />
								</button>
							</div>

							{/* Scrollable Content */}
							<ScrollArea className="relative z-10 h-[60vh] max-h-[500px] px-6 pb-8">
								<div className="space-y-3 py-2">
									<SettingCard
										icon={Zap}
										label="Animation Rate"
										description="Adjust interpolation speed and easing"
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
