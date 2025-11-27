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
	Check,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaceVariant } from "./face/types";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: FaceVariant;
	onVariantChange: (variant: FaceVariant) => void;
	accentColor: string;
	onAccentChange: (color: string) => void;
}

const VARIANTS: { id: FaceVariant; label: string; desc: string }[] = [
	{ id: "minimal", label: "Minimal", desc: "The original elliptical purity" },
	{ id: "tron", label: "Tron", desc: "Cybernetic neon rectangles" },
	{ id: "analogue", label: "Analogue", desc: "Hand-drawn sketchy lines" },
	// { id: "kawaii", label: "Kawaii", desc: "Soft round aesthetics" },
];

const COLORS = [
	{ id: "neutral", label: "Obsidian", color: "bg-neutral-900" },
	{ id: "rose", label: "Sakura", color: "bg-rose-500" },
	{ id: "cyan", label: "Cyber", color: "bg-cyan-500" },
	{ id: "amber", label: "Amber", color: "bg-amber-500" },
	{ id: "violet", label: "Void", color: "bg-violet-600" },
];

function ColorSelector({
	active,
	onChange,
}: {
	active: string;
	onChange: (color: string) => void;
}) {
	return (
		<div className="pb-2">
			<h3 className="text-[11px] font-mono font-medium text-muted-foreground tracking-[0.15em] uppercase mb-4 ml-1">
				Accent Color
			</h3>
			<div className="flex flex-wrap gap-2">
				{COLORS.map((c) => {
					const isActive = active === c.id;
					return (
						<button
							key={c.id}
							onClick={() => {
								onChange(c.id);
							}}
							className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
								isActive
									? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background"
									: "hover:scale-105"
							}`}
						>
							<div
								className={`w-full h-full rounded-full ${c.color} opacity-90`}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function VariantSelector({
	current,
	onChange,
}: {
	current: FaceVariant;
	onChange: (v: FaceVariant) => void;
}) {
	return (
		<div className="pb-6">
			<h3 className="text-[11px] font-mono font-medium text-muted-foreground tracking-[0.15em] uppercase mb-4 ml-1">
				Face Archetype
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				{VARIANTS.map((v) => {
					const isActive = current === v.id;
					return (
						<button
							key={v.id}
							onClick={() => onChange(v.id)}
							className={`relative group flex flex-col items-start p-4 rounded-[1.25rem] border transition-all duration-300 h-full ${
								isActive
									? "bg-primary/5 border-primary/20 shadow-sm"
									: "bg-secondary/30 border-transparent hover:bg-secondary/60"
							}`}
						>
							<div className="flex items-center justify-between w-full mb-2">
								<span
									className={`text-sm font-medium tracking-tight ${
										isActive
											? "text-primary"
											: "text-foreground"
									}`}
								>
									{v.label}
								</span>
								{isActive && (
									<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
										<Check className="w-3 h-3 text-primary-foreground" />
									</div>
								)}
							</div>
							<p className="text-[11px] text-muted-foreground/80 font-mono leading-tight text-left">
								{v.desc}
							</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}

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
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm will-change-opacity"
						onClick={onClose}
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 z-[101] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{
								type: "spring",
								damping: 20,
								stiffness: 300,
								mass: 0.5, // Lighter mass for snappier feel
							}}
							className="pointer-events-auto w-full md:max-w-[800px] bg-background border-t md:border border-border shadow-2xl rounded-t-[2rem] md:rounded-[2rem] overflow-hidden flex flex-col relative will-change-transform"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Texture Overlay - Optimized opacity */}
							<div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

							{/* Header */}
							<div className="relative z-10 p-6 md:p-8 pb-4 flex items-center justify-between">
								<div>
									<div className="flex items-center gap-3 mb-1">
										<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
										<h2 className="text-[10px] md:text-xs font-mono font-medium text-muted-foreground tracking-[0.2em] uppercase">
											System Config
										</h2>
									</div>
									<h1 className="text-xl md:text-2xl font-medium text-foreground tracking-tight">
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

							{/* Content */}
							<div className="relative z-10 px-6 md:px-8 pb-8">
								<VariantSelector
									current={currentVariant}
									onChange={onVariantChange}
								/>
								<ColorSelector
									active={accentColor}
									onChange={onAccentChange}
								/>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
