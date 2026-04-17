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
        preview:
            '"Let’s reduce the noise and move one strong step at a time."',
    },
    {
        id: "playful",
        name: "Playful",
        tone: "Light / charming",
        description:
            "Softer, brighter, and more companion-like with a little bounce in the phrasing.",
        preview:
            '"We can make this feel lighter. Small wins still count."',
    },
    {
        id: "deep-thinker",
        name: "Deep Thinker",
        tone: "Reflective / calm",
        description:
            "Gentle, philosophical, and more interested in meaning than raw speed.",
        preview:
            '"There is usually a quieter layer beneath the first reaction."',
        unavailable: true,
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

/* ─── Modal (Now a Panel) ─────────────────────────────────────────────── */
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KeyVaultPanel } from "./key-vault-panel";
import { PersonaPicker } from "@/components/ui/persona-picker";
import { PersonaPreview } from "@/components/ui/persona-preview";
import { PersonaSettingsPanel } from "@/components/ui/persona-settings-panel";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Settings2, WandSparkles } from "lucide-react";

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

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-[calc(100vw-16px)] sm:w-[460px] sm:max-w-md p-0 flex flex-col right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 h-[calc(100svh-16px)] sm:h-[calc(100svh-32px)] te-panel overflow-hidden"
            >
                {/* Header */}
                <SheetHeader className="relative z-10 px-8 py-7 pb-4 shrink-0 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 te-recessed flex items-center justify-center">
                                <Settings2 className="size-5 text-foreground/50" />
                            </div>
                            <SheetTitle className="text-xl font-mono font-bold tracking-widest uppercase text-foreground">
                                SYS_CONFIG
                            </SheetTitle>
                        </div>
                        <div className="te-lcd px-3 py-1 text-[10px]">
                            V.0.1.0
                        </div>
                    </div>
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-[var(--panel-bg)]">
                    <Tabs defaultValue="appearance" className="w-full">
                            <TabsList
                                className="mb-8 w-full flex p-2 te-recessed"
                            >
                                <TabsTrigger
                                    value="appearance"
                                    className="data-[state=active]:bg-[var(--key-bg)] data-[state=active]:shadow-sm relative h-10 rounded-[10px] transition-all data-[state=active]:text-foreground text-foreground/50 font-mono text-[11px] uppercase tracking-widest font-bold flex-1"
                                >
                                    SHELL
                                </TabsTrigger>
                                <TabsTrigger
                                    value="keys"
                                    className="data-[state=active]:bg-[var(--key-bg)] data-[state=active]:shadow-sm relative h-10 rounded-[10px] transition-all data-[state=active]:text-foreground text-foreground/50 font-mono text-[11px] uppercase tracking-widest font-bold flex-1"
                                >
                                    KEYS
                                </TabsTrigger>
                                <TabsTrigger
                                    value="persona"
                                    className="data-[state=active]:bg-[var(--key-bg)] data-[state=active]:shadow-sm relative h-10 rounded-[10px] transition-all data-[state=active]:text-foreground text-foreground/50 font-mono text-[11px] uppercase tracking-widest font-bold flex-1"
                                >
                                    CORE
                                </TabsTrigger>
                            </TabsList>

                        <TabsContent
                            value="appearance"
                            className="space-y-10"
                        >
                            {/* ── name ── */}
                            <div className="space-y-3">
                                <label className="te-label flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-[var(--te-blue)]" />
                                    IDENTITY_STR
                                </label>
                                <div className="te-recessed p-2">
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
                                        className="w-full h-12 rounded-[10px] px-4 text-[14px] font-bold text-foreground focus:outline-none transition-all font-mono placeholder:text-foreground/30 bg-[var(--key-bg)] border border-[var(--key-border)] shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* ── style ── */}
                            <div className="space-y-3">
                                <label className="te-label flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-[var(--te-orange)]" />
                                    HARDWARE_MODEL
                                </label>
                                <div className="grid grid-cols-3 gap-3 te-recessed p-3">
                                    {FACES.map((face) => {
                                        const active = currentVariant === face.id;
                                        return (
                                            <button
                                                key={face.id}
                                                onClick={() => onVariantChange(face.id)}
                                                className={`h-14 te-button ${active ? 'border-b-[1px] translate-y-[3px] text-[var(--te-orange)]' : 'text-foreground/60 hover:text-foreground'}`}
                                            >
                                                {face.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── accent color ── */}
                            <div className="space-y-3">
                                <label className="te-label flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-[var(--te-green)]" />
                                    AURA_HEX
                                </label>
                                <div className="p-5 te-recessed space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="te-lcd px-3 py-1.5 min-w-[80px] text-center">
                                            {accentColor}
                                        </div>
                                    </div>
                                    
                                    <SpectrumPicker
                                        color={accentColor}
                                        onChange={onAccentColorChange}
                                    />

                                    {/* quick-pick swatches */}
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        {SWATCHES.map((hex) => {
                                            const active = accentColor.toUpperCase() === hex;
                                            return (
                                                <button
                                                    key={hex}
                                                    onClick={() => onAccentColorChange(hex)}
                                                    className={`relative size-8 rounded-[8px] transition-all duration-150 border-2 ${active ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                                                    style={{
                                                        backgroundColor: hex,
                                                        boxShadow: active ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="keys" className="mt-0">
                            <KeyVaultPanel accentColor={accentColor} />
                        </TabsContent>

                        <TabsContent value="persona" className="mt-0 space-y-6 px-2">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                    Persona Packs
                                </label>
                                <div className="rounded-[28px] bg-background/60 backdrop-blur-md border border-foreground/[0.05] p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="size-10 rounded-full flex items-center justify-center shadow-sm"
                                            style={{
                                                backgroundColor: `${accentColor}15`,
                                                color: accentColor,
                                            }}
                                        >
                                            <WandSparkles className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[16px] font-semibold tracking-tight text-foreground/90">
                                                Shape how DOT feels
                                            </p>
                                            <p className="text-[13px] leading-relaxed text-muted-foreground/75">
                                                Personality affects tone, rhythm, and how companion-like the product feels.
                                            </p>
                                        </div>
                                    </div>
                                    <PersonaPicker
                                        personas={[...PERSONAS]}
                                        activePersonaId={activePersonaId}
                                        onSelect={onPersonaChange}
                                        accentColor={accentColor}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                    Live Preview
                                </label>
                                <PersonaPreview
                                    name={activePersona.name}
                                    sample={activePersona.preview}
                                    accentColor={accentColor}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                    Persona Tuning
                                </label>
                                <PersonaSettingsPanel accentColor={accentColor} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
});
