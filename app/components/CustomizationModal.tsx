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
	"#1A1B52", // brand indigo
	"#BAFF29", // brand lime
	"#FF6B6B",
	"#F472B6",
	"#C084FC",
	"#60A5FA",
	"#06B6D4",
	"#34D399",
	"#FBBF24",
	"#FB923C",
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
				className="relative w-full h-[100px] rounded-[6px] cursor-crosshair touch-none select-none overflow-hidden border border-[var(--hair-2)]"
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
					className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white pointer-events-none"
					style={{
						left: `${s * 100}%`,
						top: `${(1 - v) * 100}%`,
						backgroundColor: color,
						boxShadow: "0 0 0 1px rgba(26,27,82,0.45)",
					}}
				/>
			</div>

			{/* Hue rail */}
			<div
				ref={hueRef}
				className="relative w-full h-3.5 rounded-[4px] cursor-pointer touch-none select-none border border-[var(--hair-2)]"
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
					className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-[var(--fg)] bg-white pointer-events-none"
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
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	lowLabel: string;
	highLabel: string;
}) {
	return (
		<div className="te-recessed p-2.5">
			<div className="mb-2.5 flex items-center justify-between">
				<span className="te-label">{label}</span>
				<span
					className="font-mono text-[11px] tabular-nums tracking-[0.06em] text-[var(--fg)]"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{Math.round(value).toString().padStart(2, "0")}
				</span>
			</div>
			<input
				type="range"
				min={0}
				max={100}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="h-1.5 w-full appearance-none rounded-full bg-[var(--hair-2)] outline-none"
				style={{ accentColor: "var(--fg)" } as React.CSSProperties}
			/>
			<div className="flex justify-between pt-2 font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
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
					initial={{ opacity: 0, y: 8, scale: 0.99 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 8, scale: 0.99 }}
					transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
					className="absolute top-24 right-12 w-[320px] h-auto pb-3 te-module te-safe-panel z-[100]"
				>
					{/* Header / Drag Handle */}
					<div className="te-module-header h-10 px-3">
						<div className="flex items-center gap-2">
							<span className="size-2 shrink-0 bg-[var(--fg)]" />
							<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg)]">
								SYS_CONFIG
							</span>
						</div>
						<div className="te-grip h-2.5 w-10 opacity-70" />
						<button
							onClick={onClose}
							className="size-6 shrink-0 te-button rounded-[5px]"
							aria-label="Close"
						>
							<X className="size-3" strokeWidth={1.5} />
						</button>
					</div>

					{/* Content */}
					<div className="relative z-10 flex h-full flex-col space-y-4 px-4 py-4">
						<Tabs defaultValue="appearance" className="w-full">
							<TabsList className="mb-4 flex w-full gap-1.5 te-recessed p-1.5">
								{(
									[
										["appearance", "SHELL"],
										["keys", "KEYS"],
										["persona", "CORE"],
									] as const
								).map(([value, label]) => (
									<TabsTrigger
										key={value}
										value={value}
										className="relative h-9 flex-1 rounded-[5px] te-button font-mono text-[10px] uppercase tracking-[0.12em] data-[state=active]:border-[var(--fg)] data-[state=active]:bg-[var(--fg)] data-[state=active]:text-[var(--bg)]"
									>
										{label}
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent
								value="appearance"
								className="fade-up mt-0 space-y-4"
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
											className="h-10 w-full rounded-[5px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-3 font-mono text-[12px] uppercase tracking-widest text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)]"
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
													className="h-9 flex-1 rounded-[5px] te-button text-[10px]"
													style={
														active
															? ({
																	background:
																		"var(--fg)",
																	borderColor:
																		"var(--fg)",
																	color: "var(--bg)",
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
										<div className="te-lcd min-w-[54px] px-2 py-0.5 text-center text-[9px] tabular-nums">
											{accentColor}
										</div>
									</div>

									{/* Dedicated Color Module */}
									<div className="te-recessed flex flex-col gap-2 p-2">
										<SpectrumPicker
											color={accentColor}
											onChange={onAccentColorChange}
										/>

										<div className="my-1 h-px w-full bg-[var(--hair)]" />

										{/* Swatches — the colourful pattern-break */}
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
														className="h-6 rounded-[4px] transition-transform duration-150 hover:scale-110"
														style={{
															background: hex,
															outline: active
																? "2px solid var(--fg)"
																: "1px solid var(--hair-2)",
															outlineOffset: active ? "1px" : "0px",
														}}
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
								className="fade-up mt-0 space-y-4"
							>
								<section className="flex flex-col gap-1.5 shrink-0">
									<div className="flex items-center justify-between px-1">
										<span className="te-label">
											PERSONA_CORE
										</span>
										<span className="te-lcd px-2 py-0.5 text-[9px]">
											{activePersona.tone.toUpperCase()}
										</span>
									</div>
									<div className="te-recessed flex flex-col gap-1.5 p-1.5">
										{PERSONAS.map((persona) => {
											const active =
												activePersonaId === persona.id;

											return (
												<button
													key={persona.id}
													onClick={() =>
														onPersonaChange(
															persona.id,
														)
													}
													className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[6px] te-button px-3 py-2 text-left text-[10px]"
													style={
														active
															? ({
																	background:
																		"var(--fg)",
																	borderColor:
																		"var(--fg)",
																	color: "var(--bg)",
																} as React.CSSProperties)
															: undefined
													}
												>
													<span className="flex flex-col gap-0.5">
														<span
															className="text-[12px] tracking-[0.04em]"
															style={{
																fontFamily:
																	"var(--font-display)",
															}}
														>
															{persona.name.toUpperCase()}
														</span>
														<span className="text-[8px] tracking-wider opacity-60">
															{persona.description.toUpperCase()}
														</span>
													</span>
													{active ? (
														<span className="size-2 shrink-0 bg-[var(--accent)]" />
													) : (
														<span className="font-mono text-[8px] tracking-widest opacity-40">
															SET
														</span>
													)}
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
											className="h-6 rounded-[5px] te-button px-2.5 text-[8px] tracking-widest"
											style={
												personaTuning.autoVoice
													? ({
															background:
																"var(--accent)",
															borderColor:
																"var(--accent)",
															color: "var(--accent-foreground)",
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
													className="h-9 rounded-[5px] te-button text-[9px] tracking-widest disabled:opacity-40"
													style={
														active &&
														personaTuning.autoVoice
															? ({
																	background:
																		"var(--fg)",
																	borderColor:
																		"var(--fg)",
																	color: "var(--bg)",
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
									<div className="te-lcd flex min-h-[60px] items-center justify-center p-3 text-center">
										<span className="font-mono text-[10px] normal-case leading-relaxed text-[var(--fg-muted)]">
											{activePersona.preview}
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
