"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaceVariant } from "./face/types";

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

const PERSONAS = [
	{
		id: "coach",
		name: "Coach",
		tone: "Driven / focused",
		description:
			"More structured, motivating, and momentum-oriented when you need clarity.",
		preview: '"Let’s reduce the noise and move one strong step at a time."',
	},
	{
		id: "playful",
		name: "Playful",
		tone: "Light / charming",
		description:
			"Softer, brighter, and more companion-like with a little bounce in the phrasing.",
		preview: '"We can make this feel lighter. Small wins still count."',
	},
	{
		id: "deep-thinker",
		name: "Deep Thinker",
		tone: "Reflective / calm",
		description:
			"Gentle, philosophical, and more interested in meaning than raw speed.",
		preview:
			'"There is usually a quieter layer beneath the first reaction."',
	},
	{
		id: "focus-buddy",
		name: "Focus Buddy",
		tone: "Quiet / practical",
		description:
			"Minimal, low-friction support for deep work and sustained attention.",
		preview:
			'"I’ll keep this simple. One task. One window. Let’s stay with it."',
	},
] as const;

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
		<div className="space-y-1.5 w-full">
			{/* SV plane */}
			<div
				ref={svRef}
				className="relative w-full h-[100px] rounded-[6px] cursor-crosshair touch-none select-none overflow-hidden border-[1px] border-[var(--panel-border)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
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
					className="absolute size-3.5 rounded-full border-[1.5px] border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
				className="relative w-full h-3.5 rounded-[4px] cursor-pointer touch-none select-none border-[1px] border-[var(--panel-border)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]"
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
					className="absolute top-1/2 w-1.5 h-4 bg-white border border-black/20 rounded-[2px] -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-sm"
					style={{
						left: `${(h / 360) * 100}%`,
					}}
				/>
			</div>
		</div>
	);
}

/* ─── Modal (Now a Panel) ─────────────────────────────────────────────── */
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KeyVaultPanel } from "./key-vault-panel";
import { X } from "lucide-react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import type {
	PersonaTuningSettings,
	PersonaVoiceMood,
} from "@/hooks/usePersonaSettings";

interface CustomizationModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: FaceVariant;
	onVariantChange: (variant: FaceVariant) => void;
	avatarName: string;
	onAvatarNameChange: (name: string) => void;
	accentColor: string;
	onAccentColorChange: (color: string) => void;
	activePersonaId: string;
	onPersonaChange: (personaId: string) => void;
	personaTuning: PersonaTuningSettings;
	onPersonaTuningChange: (patch: Partial<PersonaTuningSettings>) => void;
	constraintsRef?: React.RefObject<Element>;
}

function TuningSlider({
	label,
	value,
	onChange,
	lowLabel,
	highLabel,
	color = "var(--te-green)",
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	lowLabel: string;
	highLabel: string;
	color?: string;
}) {
	return (
		<div className="te-recessed p-2 border border-[var(--panel-border)]">
			<div className="flex items-center justify-between mb-2">
				<span className="te-label">{label}</span>
				<span className="te-lcd px-2 py-0.5 text-[8px] min-w-10 text-center">
					{Math.round(value).toString().padStart(2, "0")}
				</span>
			</div>
			<input
				type="range"
				min={0}
				max={100}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="w-full h-2 appearance-none rounded-full bg-[var(--lcd-bg)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] accent-[var(--te-green)]"
				style={
					{
						accentColor: color,
					} as React.CSSProperties
				}
			/>
			<div className="flex justify-between pt-1.5 text-[8px] font-mono uppercase tracking-widest text-foreground/35">
				<span>{lowLabel}</span>
				<span>{highLabel}</span>
			</div>
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
	activePersonaId,
	onPersonaChange,
	personaTuning,
	onPersonaTuningChange,
	constraintsRef,
}: CustomizationModalProps) {
	const [nameVal, setNameVal] = React.useState(avatarName);
	const activePersona =
		PERSONAS.find((persona) => persona.id === activePersonaId) ??
		PERSONAS[0];

	React.useEffect(() => {
		setNameVal(avatarName);
	}, [avatarName]);

	const commitName = () => {
		const trimmed = nameVal.trim();
		if (trimmed) onAvatarNameChange(trimmed);
		else setNameVal(avatarName);
	};

	const { x, y, onDragEnd } = usePanelPosition("customization");

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					drag
					dragConstraints={constraintsRef}
					dragMomentum={false}
					style={{ x, y }}
					onDragEnd={onDragEnd}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					className="absolute top-24 right-12 w-[320px] h-auto pb-3 te-module z-[100]"
				>
					{/* Header / Drag Handle */}
					<div className="te-module-header">
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-[var(--te-blue)]" />
							<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
								SYS_CONFIG
							</span>
						</div>
						<div className="w-16 h-2 te-grip opacity-50" />
						<button
							onClick={onClose}
							className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-blue)]"
						>
							<X className="size-3" />
						</button>
					</div>

					{/* Content */}
					<div className="relative z-10 flex flex-col px-4 py-4 space-y-4 bg-[var(--panel-bg)] h-full">
						<Tabs defaultValue="appearance" className="w-full">
							<TabsList className="mb-4 w-full flex p-2 te-recessed gap-1.5">
								<TabsTrigger
									value="appearance"
									className="data-[state=active]:bg-[var(--te-blue)] data-[state=active]:text-white data-[state=active]:border-b-[var(--key-shadow)] relative h-9 rounded-[8px] transition-all text-foreground/50 font-mono text-[10px] uppercase tracking-widest font-bold flex-1 te-button !border-b-2"
								>
									SHELL
								</TabsTrigger>
								<TabsTrigger
									value="keys"
									className="data-[state=active]:bg-[var(--te-orange)] data-[state=active]:text-white data-[state=active]:border-b-[var(--key-shadow)] relative h-9 rounded-[8px] transition-all text-foreground/50 font-mono text-[10px] uppercase tracking-widest font-bold flex-1 te-button !border-b-2"
								>
									KEYS
								</TabsTrigger>
								<TabsTrigger
									value="persona"
									className="data-[state=active]:bg-[var(--te-green)] data-[state=active]:text-white data-[state=active]:border-b-[var(--key-shadow)] relative h-9 rounded-[8px] transition-all text-foreground/50 font-mono text-[10px] uppercase tracking-widest font-bold flex-1 te-button !border-b-2"
								>
									CORE
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="appearance"
								className="space-y-4 mt-0"
							>
								{/* ── name ── */}
								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											IDENTITY_STR
										</span>
									</div>
									<div className="te-recessed p-1.5">
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
											placeholder="NAME"
											className="w-full h-10 rounded-[8px] px-3 text-[12px] font-bold text-[var(--lcd-text)] focus:outline-none transition-all font-mono uppercase tracking-widest placeholder:text-[var(--lcd-text)]/30 bg-[var(--lcd-bg)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(0,0,0,0.1),0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.05)]"
										/>
									</div>
								</section>

								{/* ── style ── */}
								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											HARDWARE_MODEL
										</span>
									</div>
									<div className="te-recessed p-1.5 flex gap-1.5">
										{FACES.map((face) => {
											const active =
												currentVariant === face.id;
											const btnColor =
												face.id === "minimal"
													? "var(--te-blue)"
													: face.id === "tron"
														? "var(--te-green)"
														: "var(--te-orange)";
											const shortName =
												face.id === "minimal"
													? "PURE"
													: face.id === "tron"
														? "DIGI"
														: "SKET";
											return (
												<button
													key={face.id}
													onClick={() =>
														onVariantChange(face.id)
													}
													className="flex-1 h-9 te-button rounded-[8px] text-[10px] transition-all duration-150"
													style={
														active
															? ({
																	"--key-bg":
																		btnColor,
																	"--key-border": `color-mix(in srgb, ${btnColor} 80%, black)`,
																	"--key-shadow": `color-mix(in srgb, ${btnColor} 60%, black)`,
																	color: "#ffffff",
																} as React.CSSProperties)
															: undefined
													}
												>
													{shortName}
												</button>
											);
										})}
									</div>
								</section>

								{/* ── accent color ── */}
								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											AURA_HEX
										</span>
										<div className="te-lcd px-2 py-0.5 text-[8px] min-w-[50px] text-center">
											{accentColor}
										</div>
									</div>

									{/* Dedicated Color Module */}
									<div className="te-recessed p-2 flex flex-col gap-2 border-[1px] border-[var(--panel-border)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
										<SpectrumPicker
											color={accentColor}
											onChange={onAccentColorChange}
										/>

										<div className="h-[1px] w-full bg-[var(--panel-border)] opacity-30 my-1" />

										{/* Hardware Swatches */}
										<div className="grid grid-cols-5 gap-1.5">
											{SWATCHES.map((hex) => {
												const active =
													accentColor.toUpperCase() ===
													hex;
												return (
													<button
														key={hex}
														onClick={() =>
															onAccentColorChange(
																hex,
															)
														}
														className="h-6 te-button rounded-[6px] transition-all duration-150"
														style={
															{
																"--key-bg": hex,
																"--key-border": `color-mix(in srgb, ${hex} 80%, black)`,
																"--key-shadow": `color-mix(in srgb, ${hex} 60%, black)`,
																transform:
																	active
																		? "translateY(2px)"
																		: "none",
																borderBottomWidth:
																	active
																		? "1px"
																		: "4px",
															} as React.CSSProperties
														}
													/>
												);
											})}
										</div>
									</div>
								</section>
							</TabsContent>

							<TabsContent value="keys" className="mt-0">
                                <KeyVaultPanel />
							</TabsContent>

							<TabsContent
								value="persona"
								className="mt-0 space-y-4"
							>
								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											PERSONA_CORE
										</span>
										<span className="te-lcd px-2 py-0.5 text-[8px]">
											{activePersona.tone.toUpperCase()}
										</span>
									</div>
									<div className="te-recessed p-1.5 flex flex-col gap-1.5">
										{PERSONAS.map((persona) => {
											const active =
												activePersonaId === persona.id;
											const btnColor =
												persona.id === "coach"
													? "var(--te-orange)"
													: persona.id === "playful"
														? "var(--te-yellow)"
														: persona.id ===
															  "deep-thinker"
															? "var(--te-blue)"
															: "var(--te-green)";
											const textColor =
												persona.id === "playful"
													? "#1c1c1e"
													: "#ffffff";

											return (
												<button
													key={persona.id}
													onClick={() =>
														onPersonaChange(
															persona.id,
														)
													}
													className="w-full min-h-11 te-button rounded-[8px] text-[10px] transition-all duration-150 flex items-center justify-between gap-3 px-3 py-2 text-left"
													style={
														active
															? ({
																	"--key-bg":
																		btnColor,
																	"--key-border": `color-mix(in srgb, ${btnColor} 80%, black)`,
																	"--key-shadow": `color-mix(in srgb, ${btnColor} 60%, black)`,
																	color: textColor,
																} as React.CSSProperties)
															: undefined
														}
												>
													<span className="flex flex-col gap-0.5">
														<span className="font-bold tracking-widest">
															{persona.name.toUpperCase()}
														</span>
														<span className="text-[8px] tracking-wider opacity-60">
															{persona.description.toUpperCase()}
														</span>
													</span>
													<span className="font-mono text-[8px] font-bold tracking-widest opacity-50">
														{active ? "ON" : "SET"}
													</span>
												</button>
											);
										})}
									</div>
								</section>

								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											TONE_TUNE
										</span>
									</div>
									<div className="grid grid-cols-1 gap-2">
										<TuningSlider
											label="EXP"
											value={personaTuning.expressiveness}
											onChange={(value) =>
												onPersonaTuningChange({
													expressiveness: value,
												})
											}
											lowLabel="quiet"
											highLabel="vivid"
											color="var(--te-yellow)"
										/>
										<TuningSlider
											label="DIR"
											value={personaTuning.directness}
											onChange={(value) =>
												onPersonaTuningChange({
													directness: value,
												})
											}
											lowLabel="soft"
											highLabel="sharp"
											color="var(--te-green)"
										/>
									</div>
								</section>

								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											VOX_MATCH
										</span>
										<button
											type="button"
											onClick={() =>
												onPersonaTuningChange({
													autoVoice:
														!personaTuning.autoVoice,
												})
											}
											className="h-6 px-2 te-button rounded-[6px] text-[8px] font-bold tracking-widest"
											style={
												personaTuning.autoVoice
													? ({
															"--key-bg":
																"var(--te-green)",
															"--key-border":
																"color-mix(in srgb, var(--te-green) 80%, black)",
															"--key-shadow":
																"color-mix(in srgb, var(--te-green) 60%, black)",
															color: "#ffffff",
														} as React.CSSProperties)
													: undefined
											}
										>
											{personaTuning.autoVoice
												? "AUTO_ON"
												: "AUTO_OFF"}
										</button>
									</div>
									<div className="te-recessed p-1.5 grid grid-cols-2 gap-1.5">
										{(
											[
												["matched", "MATCH"],
												["softened", "SOFT"],
											] as const
										).map(([mood, label]) => {
											const active =
												personaTuning.voiceMood === mood;
											return (
												<button
													type="button"
													key={mood}
													onClick={() =>
														onPersonaTuningChange({
															voiceMood:
																mood as PersonaVoiceMood,
														})
													}
													disabled={
														!personaTuning.autoVoice
													}
													className="h-9 te-button rounded-[8px] text-[9px] font-bold tracking-widest disabled:opacity-40"
													style={
														active &&
														personaTuning.autoVoice
															? ({
																	"--key-bg":
																		"var(--te-blue)",
																	"--key-border":
																		"color-mix(in srgb, var(--te-blue) 80%, black)",
																	"--key-shadow":
																		"color-mix(in srgb, var(--te-blue) 60%, black)",
																	color: "#ffffff",
																} as React.CSSProperties)
															: undefined
													}
												>
													{label}
												</button>
											);
										})}
									</div>
								</section>

								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											PREVIEW
										</span>
									</div>
									<div className="te-lcd p-3 min-h-[60px] flex items-center justify-center text-center">
										<span className="text-[10px] leading-relaxed opacity-80">
											{activePersona.preview.toUpperCase()}
										</span>
									</div>
								</section>
							</TabsContent>
						</Tabs>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
});
