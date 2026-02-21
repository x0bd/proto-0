"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaceVariant } from "./face/types";
import { VARIANT_COLORS } from "./face/themes";
import { cn } from "@/lib/utils";
import { IoCloseOutline } from "react-icons/io5";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: FaceVariant;
	onVariantChange: (variant: FaceVariant) => void;
}

const FACES: { id: FaceVariant; name: string; desc: string; kanji: string }[] =
	[
		{ id: "minimal", name: "Pure", desc: "Essential form", kanji: "純" },
		{ id: "tron", name: "Digital", desc: "System grid", kanji: "数" },
		{ id: "analogue", name: "Sketch", desc: "Hand drawn", kanji: "描" },
		{ id: "myst", name: "Myst", desc: "Visionary", kanji: "霧" },
		{ id: "flux", name: "Flux", desc: "Architect", kanji: "流" },
		{ id: "echo", name: "Echo", desc: "Essence", kanji: "響" },
	];

function EyePreview({
	variant,
	isActive,
}: {
	variant: FaceVariant;
	isActive: boolean;
}) {
	const color = isActive ? "#FFFFFF" : VARIANT_COLORS[variant];
	const style = { fill: color };
	const styleStroke = { fill: "none", stroke: color, strokeWidth: 1.5 };

	switch (variant) {
		case "myst":
			return (
				<svg viewBox="0 0 48 24" className="w-10 h-5">
					<circle cx="24" cy="6" r="4" style={style} />
					<circle cx="12" cy="18" r="4" style={style} />
					<circle cx="36" cy="18" r="4" style={style} />
				</svg>
			);
		case "flux":
			return (
				<svg viewBox="0 0 48 24" className="w-10 h-5">
					<polygon points="12,6 18,18 6,18" style={style} />
					<polygon points="36,6 42,18 30,18" style={style} />
				</svg>
			);
		case "echo":
			return (
				<svg viewBox="0 0 48 24" className="w-10 h-5">
					<circle cx="14" cy="12" r="3" style={style} />
					<circle cx="34" cy="12" r="3" style={style} />
				</svg>
			);
		case "minimal":
			return (
				<svg viewBox="0 0 48 24" className="w-10 h-5">
					<ellipse cx="12" cy="12" rx="6" ry="4" style={style} />
					<ellipse cx="36" cy="12" rx="6" ry="4" style={style} />
				</svg>
			);
		case "tron":
			return (
				<svg viewBox="0 0 48 24" className="w-10 h-5">
					<rect
						x="6"
						y="8"
						width="12"
						height="8"
						rx="1"
						style={style}
					/>
					<rect
						x="30"
						y="8"
						width="12"
						height="8"
						rx="1"
						style={style}
					/>
				</svg>
			);
		case "analogue":
			return (
				<svg viewBox="0 0 48 24" className="w-10 h-5">
					<ellipse
						cx="12"
						cy="12"
						rx="6"
						ry="4"
						style={styleStroke}
					/>
					<ellipse
						cx="36"
						cy="12"
						rx="6"
						ry="4"
						style={styleStroke}
					/>
				</svg>
			);
		default:
			return null;
	}
}

export const CustomizationModal = React.memo(function CustomizationModal({
	isOpen,
	onClose,
	currentVariant,
	onVariantChange,
}: CustomizationModalProps) {
	const [hasAnimated, setHasAnimated] = React.useState(false);

	React.useEffect(() => {
		if (isOpen) {
			// Reset animation state when modal opens
			setHasAnimated(false);
			// Mark as animated after initial animation completes
			const timer = setTimeout(() => setHasAnimated(true), 600);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop - Vercel Frosted Glass */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md"
						onClick={onClose}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.96, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96, y: 20 }}
							transition={{
								type: "spring",
								damping: 35,
								stiffness: 400,
								mass: 0.8,
							}}
							className="pointer-events-auto w-full max-w-[600px] bg-background border-2 border-primary/20 shadow-premium rounded-[32px] sm:rounded-[40px] overflow-hidden relative max-h-[90vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Washi Texture Overlay */}
							<div className="absolute inset-0 bg-grain opacity-[0.15] pointer-events-none z-0" />

							{/* Vertical Japanese Text - Left Side */}
							<div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-6 pointer-events-none z-0">
								<span className="writing-vertical-rl text-6xl font-bold text-foreground/[0.02] select-none tracking-wider">
									顔
								</span>
							</div>

							{/* Header */}
							<div className="relative z-10 px-4 sm:px-6 md:px-10 pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 flex items-start justify-between">
								<div className="space-y-1">
									<h2 className="logo-font text-xl sm:text-2xl font-bold tracking-[0.1em] text-foreground">
										Face Style
									</h2>
									<p className="text-[10px] sm:text-[11px] text-muted-foreground font-mono tracking-wide">
										Choose your visual identity
									</p>
								</div>
								<button
									onClick={onClose}
									className="size-9 sm:size-10 rounded-full flex items-center justify-center text-foreground font-bold hover:bg-foreground/10 transition-all duration-300 active:scale-95 touch-manipulation shrink-0"
								>
									<IoCloseOutline className="size-5 sm:size-6" />
								</button>
							</div>

							{/* Content - Flowing Layout */}
							<div className="relative z-10 px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-10">
								<div className="space-y-2">
									{FACES.map((item, i) => {
										const isActive = currentVariant === item.id;
										const color = VARIANT_COLORS[item.id];
										return (
											<motion.button
												key={item.id}
												onClick={() => onVariantChange(item.id)}
												initial={hasAnimated ? false : { opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={hasAnimated ? { duration: 0.2 } : {
													delay: i * 0.04,
													type: "spring",
													damping: 30,
													stiffness: 300,
												}}
												className="group relative w-full flex items-center gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] transition-all duration-300 text-left touch-manipulation border-2 hover:scale-[1.01] active:scale-[0.99]"
												style={isActive ? {
													backgroundColor: color,
													borderColor: color,
													boxShadow: `0 12px 32px -6px ${color}55, 0 4px 12px -2px ${color}33`,
												} : {
													backgroundColor: `${color}08`,
													borderColor: `${color}35`,
												}}
											>
												{/* Kanji Watermark */}
												<span
													className="absolute right-6 text-7xl font-bold select-none"
													style={{ color: isActive ? "rgba(255,255,255,0.12)" : `${color}14` }}
												>
													{item.kanji}
												</span>

												{/* Eye Preview */}
												<div className="shrink-0 relative z-10">
													<EyePreview variant={item.id} isActive={isActive} />
												</div>

												{/* Text */}
												<div className="flex-1 flex flex-col relative z-10">
													<div className="flex items-baseline gap-3">
														<span className={cn(
															"text-[14px] font-bold tracking-tight logo-font",
															isActive ? "text-white" : "text-foreground",
														)}>
															{item.name}
														</span>
														<span
															className="text-[9px] font-mono uppercase tracking-widest font-bold"
															style={{ color: isActive ? "rgba(255,255,255,0.65)" : `${color}99` }}
														>
															{item.id.toUpperCase()}
														</span>
													</div>
													<span className={cn(
														"text-[11px] font-medium tracking-wide mt-0.5",
														isActive ? "text-white/75" : "text-muted-foreground",
													)}>
														{item.desc}
													</span>
												</div>

												{/* Active Dot */}
												{isActive && (
													<motion.div
														layoutId="active-indicator"
														className="absolute right-5 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-white/90"
														initial={false}
													/>
												)}
											</motion.button>
										);
									})}
								</div>
							</div>

						{/* Bottom Accent */}
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B6B] via-[#A78BFA] to-[#60A5FA]" />
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
