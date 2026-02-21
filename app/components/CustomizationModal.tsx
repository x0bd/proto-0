"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaceVariant } from "./face/types";
import { VARIANT_COLORS } from "./face/themes";
import { IoCloseOutline, IoCheckmark } from "react-icons/io5";

const PALETTE = [
	"#FF6B6B", // coral
	"#F472B6", // sakura
	"#C084FC", // plum
	"#A78BFA", // lavender
	"#60A5FA", // sky
	"#06B6D4", // cyan
	"#34D399", // mint
	"#FBBF24", // citron
	"#FB923C", // tangerine
	"#EF4444", // brick
	"#8B7355", // umber
	"#374151", // ink
];

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: FaceVariant;
	onVariantChange: (variant: FaceVariant) => void;
	avatarName: string;
	onAvatarNameChange: (name: string) => void;
	accentColor: string;
	onAccentColorChange: (color: string) => void;
}

const FACES: { id: FaceVariant; name: string; desc: string; kanji: string }[] =
	[
		{ id: "minimal", name: "Pure", desc: "Essential form", kanji: "純" },
		{ id: "tron", name: "Digital", desc: "System grid", kanji: "数" },
		{ id: "analogue", name: "Sketch", desc: "Hand drawn", kanji: "描" },
	];

function EyePreview({
	variant,
	color,
}: {
	variant: FaceVariant;
	color: string;
}) {
	const style = { fill: color };
	const styleStroke = { fill: "none", stroke: color, strokeWidth: 1.5 };
	switch (variant) {
		case "minimal":
			return (
				<svg viewBox="0 0 48 24" className="w-9 h-[18px]">
					<ellipse cx="12" cy="12" rx="6" ry="4" style={style} />
					<ellipse cx="36" cy="12" rx="6" ry="4" style={style} />
				</svg>
			);
		case "tron":
			return (
				<svg viewBox="0 0 48 24" className="w-9 h-[18px]">
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
				<svg viewBox="0 0 48 24" className="w-9 h-[18px]">
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

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-3 mb-4">
			<span className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/35 shrink-0">
				{children}
			</span>
			<div className="flex-1 border-t border-foreground/[0.07]" />
		</div>
	);
}

export const CustomizationModal = React.memo(function CustomizationModal({
	isOpen,
	onClose,
	currentVariant,
	onVariantChange,
	avatarName,
	onAvatarNameChange,
	accentColor,
	onAccentColorChange,
}: CustomizationModalProps) {
	const [hasAnimated, setHasAnimated] = React.useState(false);
	const [nameVal, setNameVal] = React.useState(avatarName);
	const customColorRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		setNameVal(avatarName);
	}, [avatarName]);

	React.useEffect(() => {
		if (isOpen) {
			setHasAnimated(false);
			const timer = setTimeout(() => setHasAnimated(true), 700);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const handleNameBlur = () => {
		const trimmed = nameVal.trim();
		if (trimmed) onAvatarNameChange(trimmed);
		else setNameVal(avatarName);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
						className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
						onClick={onClose}
					/>

					<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.97, y: 14 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.97, y: 14 }}
							transition={{
								type: "spring",
								damping: 38,
								stiffness: 420,
								mass: 0.7,
							}}
							className="pointer-events-auto w-full max-w-[460px]"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Paper card */}
							<div className="relative bg-background border border-foreground/[0.07] rounded-[28px] overflow-hidden shadow-[0_12px_48px_-8px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.06)] max-h-[90vh] overflow-y-auto">
								{/* Washi fiber texture */}
								<div className="absolute inset-0 bg-washi pointer-events-none z-0" />

								{/* Vertical Japanese watermark */}
								<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-0 select-none">
									<span className="writing-vertical-rl text-[72px] font-black text-foreground/[0.025] tracking-wider">
										設定
									</span>
								</div>

								<div className="relative z-10 px-6 sm:px-8 pt-7 pb-8">
									{/* Header */}
									<div className="flex items-start justify-between mb-8">
										<div>
											<h2 className="logo-font text-base font-bold tracking-[0.15em] text-foreground leading-none uppercase">
												Settings
											</h2>
											<p className="text-[9px] text-foreground/35 font-mono tracking-[0.25em] mt-1.5 uppercase">
												personalise your companion
											</p>
										</div>
										<button
											onClick={onClose}
											className="size-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/8 transition-all duration-200 active:scale-90 touch-manipulation shrink-0"
										>
											<IoCloseOutline className="size-4.5" />
										</button>
									</div>

									{/* ── IDENTITY ── */}
									<SectionLabel>Identity</SectionLabel>
									<div className="mb-8">
										<div className="relative">
											<input
												type="text"
												value={nameVal}
												onChange={(e) =>
													setNameVal(e.target.value)
												}
												onBlur={handleNameBlur}
												onKeyDown={(e) => {
													if (e.key === "Enter")
														e.currentTarget.blur();
												}}
												maxLength={20}
												placeholder="Name your companion"
												className="w-full bg-transparent text-foreground logo-font text-2xl font-bold tracking-[0.05em] pb-2 border-0 border-b border-foreground/12 focus:outline-none transition-colors duration-200 placeholder:text-foreground/18 placeholder:font-normal placeholder:tracking-normal placeholder:text-lg"
												style={{
													caretColor: accentColor,
												}}
											/>
											<motion.div
												className="absolute bottom-0 left-0 h-[1.5px] rounded-full"
												animate={{
													width: nameVal
														? "100%"
														: "0%",
												}}
												transition={{
													duration: 0.4,
													ease: [0.16, 1, 0.3, 1],
												}}
												style={{
													backgroundColor:
														accentColor,
													opacity: 0.45,
												}}
											/>
										</div>
										<p className="text-[9px] font-mono text-foreground/22 uppercase tracking-[0.2em] mt-2.5">
											displayed in the header
										</p>
									</div>

									{/* ── FACE ── */}
									<SectionLabel>Face Style</SectionLabel>
									<div className="flex gap-2 mb-8">
										{FACES.map((item, i) => {
											const isActive =
												currentVariant === item.id;
											const varColor =
												VARIANT_COLORS[item.id];
											return (
												<motion.button
													key={item.id}
													onClick={() =>
														onVariantChange(item.id)
													}
													initial={
														hasAnimated
															? false
															: {
																	opacity: 0,
																	y: 8,
																}
													}
													animate={{
														opacity: 1,
														y: 0,
													}}
													transition={
														hasAnimated
															? { duration: 0.15 }
															: {
																	delay:
																		i *
																		0.05,
																	type: "spring",
																	damping: 28,
																	stiffness: 320,
																}
													}
													whileTap={{ scale: 0.96 }}
													className="flex-1 relative flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl transition-all duration-200 touch-manipulation border overflow-hidden"
													style={
														isActive
															? {
																	backgroundColor: `${varColor}14`,
																	borderColor: `${varColor}50`,
																}
															: {
																	backgroundColor:
																		"transparent",
																	borderColor:
																		"rgba(0,0,0,0.06)",
																}
													}
												>
													<span
														className="absolute -bottom-1 right-0.5 text-[40px] font-black select-none pointer-events-none leading-none"
														style={{
															color: isActive
																? `${varColor}1a`
																: "transparent",
														}}
													>
														{item.kanji}
													</span>
													<EyePreview
														variant={item.id}
														color={
															isActive
																? varColor
																: "currentColor"
														}
													/>
													<div className="relative z-10 text-center">
														<div
															className="text-[11px] font-bold logo-font leading-none tracking-wide"
															style={{
																color: isActive
																	? varColor
																	: undefined,
															}}
														>
															{item.name}
														</div>
														<div className="text-[8px] text-foreground/30 font-mono tracking-widest mt-0.5 uppercase">
															{item.desc}
														</div>
													</div>
													{isActive && (
														<motion.div
															layoutId="face-check"
															className="absolute top-2 right-2 size-3.5 rounded-full flex items-center justify-center"
															style={{
																backgroundColor:
																	varColor,
															}}
															initial={false}
														>
															<IoCheckmark className="size-2 text-white" />
														</motion.div>
													)}
												</motion.button>
											);
										})}
									</div>

									{/* ── COLOR ── */}
									<SectionLabel>Accent Color</SectionLabel>
									<div className="flex flex-wrap gap-2 items-center">
										{PALETTE.map((hex) => {
											const isActive =
												accentColor === hex;
											return (
												<motion.button
													key={hex}
													onClick={() =>
														onAccentColorChange(hex)
													}
													whileTap={{ scale: 0.82 }}
													className="relative size-7 rounded-full touch-manipulation focus:outline-none shrink-0"
													style={{
														backgroundColor: hex,
													}}
												>
													{isActive && (
														<motion.div
															layoutId="color-ring"
															className="absolute -inset-[3px] rounded-full border-[1.5px]"
															style={{
																borderColor:
																	hex,
															}}
															initial={false}
															transition={{
																type: "spring",
																stiffness: 600,
																damping: 40,
															}}
														/>
													)}
													{isActive && (
														<IoCheckmark
															className="absolute inset-0 m-auto size-3 text-white"
															style={{
																filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
															}}
														/>
													)}
												</motion.button>
											);
										})}
										{/* Custom color swatch */}
										<button
											onClick={() =>
												customColorRef.current?.click()
											}
											className="relative size-7 rounded-full border border-dashed border-foreground/20 flex items-center justify-center hover:border-foreground/40 transition-colors duration-200 touch-manipulation overflow-hidden shrink-0"
											title="Custom color"
										>
											{!PALETTE.includes(accentColor) ? (
												<>
													<div
														className="absolute inset-0 rounded-full"
														style={{
															backgroundColor:
																accentColor,
														}}
													/>
													<IoCheckmark
														className="relative z-10 size-3 text-white"
														style={{
															filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
														}}
													/>
												</>
											) : (
												<span className="text-foreground/30 text-sm leading-none">
													+
												</span>
											)}
										</button>
										<input
											ref={customColorRef}
											type="color"
											value={accentColor}
											onChange={(e) =>
												onAccentColorChange(
													e.target.value,
												)
											}
											className="sr-only"
											aria-hidden
										/>
									</div>
									<p className="text-[9px] font-mono text-foreground/22 uppercase tracking-[0.2em] mt-3">
										overrides the face variant default
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
