"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaceVariant } from "./face/types";
import { RiCloseFill } from "react-icons/ri";

/* ─── Color conversion ──────────────────────────────────── */

function hexToHsv(hex: string): [number, number, number] {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return [0, 0.8, 0.95];
	const r = parseInt(m[1], 16) / 255;
	const g = parseInt(m[2], 16) / 255;
	const b = parseInt(m[3], 16) / 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b),
		d = max - min;
	let h = 0;
	if (d) {
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
		else if (max === g) h = ((b - r) / d + 2) * 60;
		else h = ((r - g) / d + 4) * 60;
	}
	return [h, max === 0 ? 0 : d / max, max];
}

function hsvToHex(h: number, s: number, v: number): string {
	const c = v * s,
		x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
		m = v - c;
	let r = 0,
		g = 0,
		b = 0;
	if (h < 60) {
		r = c;
		g = x;
	} else if (h < 120) {
		r = x;
		g = c;
	} else if (h < 180) {
		g = c;
		b = x;
	} else if (h < 240) {
		g = x;
		b = c;
	} else if (h < 300) {
		r = x;
		b = c;
	} else {
		r = c;
		b = x;
	}
	const toHex = (n: number) =>
		Math.round((n + m) * 255)
			.toString(16)
			.padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/* ─── Constants ─────────────────────────────────────────── */

const FACES: { id: FaceVariant; name: string }[] = [
	{ id: "minimal", name: "Pure" },
	{ id: "tron", name: "Digital" },
	{ id: "analogue", name: "Sketch" },
	{ id: "robot", name: "Robot" },
];

const SWATCHES = [
	"#FF6B6B",
	"#F472B6",
	"#C084FC",
	"#A78BFA",
	"#60A5FA",
	"#06B6D4",
	"#34D399",
	"#FBBF24",
	"#FB923C",
	"#EF4444",
];

/* ─── Spectrum color picker ─────────────────────────────── */

function SpectrumPicker({
	color,
	onChange,
}: {
	color: string;
	onChange: (hex: string) => void;
}) {
	const [hsv, _setHsv] = React.useState<[number, number, number]>(() =>
		hexToHsv(color),
	);
	const hsvRef = React.useRef(hsv);
	const svRef = React.useRef<HTMLDivElement>(null);
	const hueRef = React.useRef<HTMLDivElement>(null);
	const dragging = React.useRef<"sv" | "hue" | null>(null);

	const setHsv = React.useCallback((v: [number, number, number]) => {
		hsvRef.current = v;
		_setHsv(v);
	}, []);

	React.useEffect(() => {
		if (!dragging.current) setHsv(hexToHsv(color));
	}, [color, setHsv]);

	const emit = React.useCallback(
		(h: number, s: number, v: number) => onChange(hsvToHex(h, s, v)),
		[onChange],
	);

	const pickSv = React.useCallback(
		(cx: number, cy: number) => {
			const el = svRef.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			const s = Math.max(0, Math.min(1, (cx - r.left) / r.width));
			const v = Math.max(0, Math.min(1, 1 - (cy - r.top) / r.height));
			const h = hsvRef.current[0];
			setHsv([h, s, v]);
			emit(h, s, v);
		},
		[setHsv, emit],
	);

	const pickHue = React.useCallback(
		(cx: number) => {
			const el = hueRef.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			const h = Math.max(
				0,
				Math.min(360, ((cx - r.left) / r.width) * 360),
			);
			const [, s, v] = hsvRef.current;
			setHsv([h, s, v]);
			emit(h, s, v);
		},
		[setHsv, emit],
	);

	React.useEffect(() => {
		const onMove = (e: PointerEvent) => {
			if (dragging.current === "sv") pickSv(e.clientX, e.clientY);
			else if (dragging.current === "hue") pickHue(e.clientX);
		};
		const onUp = () => {
			dragging.current = null;
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
		};
	}, [pickSv, pickHue]);

	const [h, s, v] = hsv;
	const pureHue = `hsl(${h}, 100%, 50%)`;

	return (
		<div className="space-y-2.5">
			{/* SV plane */}
			<div
				ref={svRef}
				className="relative w-full h-[140px] rounded-[10px] cursor-crosshair touch-none select-none overflow-hidden"
				style={{ backgroundColor: pureHue }}
				onPointerDown={(e) => {
					e.preventDefault();
					dragging.current = "sv";
					pickSv(e.clientX, e.clientY);
				}}
			>
				<div
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(to right, #ffffff, transparent)",
					}}
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(to bottom, transparent, #000000)",
					}}
				/>
				<div
					className="absolute size-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
					style={{
						left: `${s * 100}%`,
						top: `${(1 - v) * 100}%`,
						backgroundColor: color,
						boxShadow:
							"0 0 0 1px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.25)",
					}}
				/>
			</div>

			{/* Hue rail */}
			<div
				ref={hueRef}
				className="relative w-full h-3 rounded-full cursor-pointer touch-none select-none"
				style={{
					background:
						"linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
				}}
				onPointerDown={(e) => {
					e.preventDefault();
					dragging.current = "hue";
					pickHue(e.clientX);
				}}
			>
				<div
					className="absolute top-1/2 size-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
					style={{
						left: `${(h / 360) * 100}%`,
						backgroundColor: pureHue,
						boxShadow:
							"0 0 0 1px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.2)",
					}}
				/>
			</div>
		</div>
	);
}

/* ─── Modal ─────────────────────────────────────────────── */

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
	const [nameVal, setNameVal] = React.useState(avatarName);

	React.useEffect(() => {
		setNameVal(avatarName);
	}, [avatarName]);

	const commitName = () => {
		const trimmed = nameVal.trim();
		if (trimmed) onAvatarNameChange(trimmed);
		else setNameVal(avatarName);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/50 backdrop-blur-md"
						onClick={onClose}
					/>

					<div className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.96, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96, y: 10 }}
							transition={{
								type: "spring",
								damping: 34,
								stiffness: 400,
								mass: 0.6,
							}}
							className="pointer-events-auto w-full max-w-[400px]"
							onClick={(e) => e.stopPropagation()}
						>
							<div
								className="relative bg-background rounded-[14px] overflow-hidden max-h-[92svh] overflow-y-auto"
								style={{
									border: `1px solid ${accentColor}22`,
									boxShadow: `0 20px 60px -12px rgba(0,0,0,0.14), 0 0 0 1px ${accentColor}0a`,
								}}
							>
								{/* washi texture */}
								<div className="absolute inset-0 bg-washi pointer-events-none opacity-40" />

								{/* faint accent wash */}
								<div
									className="absolute inset-0 pointer-events-none"
									style={{
										backgroundColor: `${accentColor}05`,
									}}
								/>

								<div className="relative z-10 px-5 pt-5 pb-6">
									{/* ── header ── */}
									<div className="flex items-start justify-between mb-7">
										<div>
											<p className="text-[9px] font-mono text-foreground/30 tracking-[0.22em] uppercase mb-1.5">
												Configure
											</p>
											<h2 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground leading-none">
												{avatarName || "Your Companion"}
											</h2>
										</div>
										<button
											onClick={onClose}
											className="size-7 rounded-[7px] flex items-center justify-center transition-all duration-150 active:scale-90 mt-0.5"
											style={{
												backgroundColor: `${accentColor}0c`,
												color: `${accentColor}80`,
											}}
										>
											<RiCloseFill className="size-4" />
										</button>
									</div>

									{/* ── name ── */}
									<label className="block text-[9px] font-mono font-medium uppercase tracking-[0.22em] text-foreground/30 mb-2">
										Name
									</label>
									<div className="relative mb-6">
										<input
											type="text"
											value={nameVal}
											onChange={(e) =>
												setNameVal(e.target.value)
											}
											onBlur={commitName}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													e.currentTarget.blur();
											}}
											maxLength={20}
											spellCheck={false}
											placeholder="Name your companion"
											className="w-full bg-foreground/[0.03] rounded-[8px] px-3.5 h-10 text-[13px] font-medium text-foreground focus:outline-none transition-all duration-200 font-mono placeholder:text-foreground/20 placeholder:font-normal"
											style={{
												caretColor: accentColor,
												border: `1px solid ${accentColor}20`,
											}}
										/>
									</div>

									{/* ── style ── */}
									<label className="block text-[9px] font-mono font-medium uppercase tracking-[0.22em] text-foreground/30 mb-2">
										Style
									</label>
									<div
										className="relative flex rounded-[8px] p-[3px] mb-6"
										style={{
											backgroundColor: `${accentColor}07`,
											border: `1px solid ${accentColor}18`,
										}}
									>
										{FACES.map((face) => {
											const active =
												currentVariant === face.id;
											return (
												<button
													key={face.id}
													onClick={() =>
														onVariantChange(face.id)
													}
													className="relative flex-1 h-9 font-mono text-[10px] font-semibold uppercase tracking-widest cursor-pointer transition-colors duration-150 rounded-[5px]"
													style={{
														color: active
															? accentColor
															: "var(--foreground)",
														opacity: active
															? 1
															: 0.38,
													}}
												>
													{active && (
														<motion.div
															layoutId="face-pill"
															className="absolute inset-0 rounded-[5px]"
															style={{
																backgroundColor: `${accentColor}18`,
															}}
															transition={{
																type: "spring",
																stiffness: 450,
																damping: 38,
															}}
														/>
													)}
													<span className="relative z-10">
														{face.name}
													</span>
												</button>
											);
										})}
									</div>

									{/* ── accent color ── */}
									<label className="block text-[9px] font-mono font-medium uppercase tracking-[0.22em] text-foreground/30 mb-2">
										Accent
									</label>
									<SpectrumPicker
										color={accentColor}
										onChange={onAccentColorChange}
									/>

									{/* quick-pick swatches */}
									<div className="flex flex-wrap items-center gap-2 mt-3">
										{SWATCHES.map((hex) => {
											const active =
												accentColor.toUpperCase() ===
												hex;
											return (
												<button
													key={hex}
													onClick={() =>
														onAccentColorChange(hex)
													}
													className="relative size-5 rounded-[4px] transition-transform duration-150 hover:scale-110 active:scale-90 shrink-0"
													style={{
														backgroundColor: hex,
														boxShadow: active
															? `0 0 0 2px var(--background), 0 0 0 3.5px ${hex}`
															: "none",
													}}
												/>
											);
										})}
									</div>

									{/* hex readout */}
									<div
										className="flex items-center justify-between mt-3.5 pt-3"
										style={{
											borderTop: `1px solid ${accentColor}10`,
										}}
									>
										<span className="text-[9px] font-mono text-foreground/30 uppercase tracking-[0.2em]">
											Hex
										</span>
										<div className="flex items-center gap-2">
											<div
												className="size-3.5 rounded-[3px] shrink-0"
												style={{
													backgroundColor:
														accentColor,
												}}
											/>
											<span className="text-[11px] font-mono font-medium text-foreground/60 uppercase tracking-[0.08em]">
												{accentColor}
											</span>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
});
