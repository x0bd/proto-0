"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AudioLines, Sparkles, Volume2, Waves } from "lucide-react";

interface VoiceSettingsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
}

const VOICE_PROFILES = [
    {
        id: "companion",
        name: "Companion",
        description: "Warm, calm, and emotionally present.",
    },
    {
        id: "guide",
        name: "Guide",
        description: "More focused and gently instructional.",
    },
    {
        id: "late-night",
        name: "Late Night",
        description: "Soft and intimate for slower sessions.",
    },
];

export function VoiceSettingsSheet({
    open,
    onOpenChange,
    accentColor = "#7c3aed",
}: VoiceSettingsSheetProps) {
    const [activeProfile, setActiveProfile] = React.useState("companion");
    const [speed, setSpeed] = React.useState([58]);
    const [warmth, setWarmth] = React.useState([72]);
    const [clarity, setClarity] = React.useState([64]);
    const [autoSpeak, setAutoSpeak] = React.useState(true);
    const [interruptible, setInterruptible] = React.useState(true);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-[calc(100vw-16px)] sm:w-[460px] sm:max-w-md p-0 flex flex-col right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 h-[calc(100svh-16px)] sm:h-[calc(100svh-32px)] rounded-[32px] border-0 shadow-premium overflow-hidden glass-card"
            >
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-color-burn"
                    style={{ backgroundColor: accentColor }}
                />
                <div className="absolute inset-0 bg-washi pointer-events-none opacity-[0.12]" />

                <SheetHeader className="relative z-10 px-7 pt-7 pb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="size-10 rounded-full flex items-center justify-center shadow-sm"
                            style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                            }}
                        >
                            <AudioLines className="size-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground/90">
                                Voice Settings
                            </SheetTitle>
                            <SheetDescription className="mt-1 text-[13px] leading-relaxed text-muted-foreground/75">
                                Shape how DOT sounds and behaves in live
                                companion mode.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-7 space-y-5 custom-scrollbar">
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <Sparkles
                                className="size-3.5"
                                style={{ color: accentColor }}
                            />
                            <span className="text-micro">Voice Profile</span>
                        </div>
                        <div className="space-y-3">
                            {VOICE_PROFILES.map((profile) => {
                                const isActive = profile.id === activeProfile;
                                return (
                                    <button
                                        key={profile.id}
                                        onClick={() =>
                                            setActiveProfile(profile.id)
                                        }
                                        className="w-full text-left p-4 rounded-[24px] border transition-all duration-300 bg-background/60 backdrop-blur-md shadow-sm hover:bg-background/80"
                                        style={{
                                            borderColor: isActive
                                                ? `${accentColor}45`
                                                : "rgba(28,10,46,0.06)",
                                            boxShadow: isActive
                                                ? `0 10px 24px -14px ${accentColor}60`
                                                : undefined,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[15px] font-semibold tracking-tight text-foreground/90">
                                                    {profile.name}
                                                </p>
                                                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground/75">
                                                    {profile.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <Badge
                                                    className="rounded-full border-0"
                                                    style={{
                                                        backgroundColor: `${accentColor}14`,
                                                        color: accentColor,
                                                    }}
                                                >
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="space-y-4 rounded-[28px] bg-background/60 backdrop-blur-md border border-foreground/[0.05] p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Waves
                                className="size-4"
                                style={{ color: accentColor }}
                            />
                            <span className="text-micro">Voice Tuning</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    label: "Speed",
                                    value: speed,
                                    onChange: setSpeed,
                                },
                                {
                                    label: "Warmth",
                                    value: warmth,
                                    onChange: setWarmth,
                                },
                                {
                                    label: "Clarity",
                                    value: clarity,
                                    onChange: setClarity,
                                },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-medium text-foreground/85">
                                            {item.label}
                                        </span>
                                        <span
                                            className="text-[11px] font-mono font-bold tracking-widest"
                                            style={{ color: accentColor }}
                                        >
                                            {item.value[0]}
                                        </span>
                                    </div>
                                    <Slider
                                        value={item.value}
                                        onValueChange={item.onChange}
                                        max={100}
                                        step={1}
                                        className="py-1"
                                        style={
                                            {
                                                "--primary": accentColor,
                                            } as React.CSSProperties
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[28px] bg-background/60 backdrop-blur-md border border-foreground/[0.05] p-5 shadow-sm space-y-5">
                        <div className="flex items-center gap-2">
                            <Volume2
                                className="size-4"
                                style={{ color: accentColor }}
                            />
                            <span className="text-micro">Behavior</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-[15px] font-medium text-foreground/90">
                                    Auto-speak responses
                                </p>
                                <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                                    DOT speaks as soon as a reply is ready.
                                </p>
                            </div>
                            <Switch
                                checked={autoSpeak}
                                onCheckedChange={setAutoSpeak}
                                style={
                                    autoSpeak
                                        ? { backgroundColor: accentColor }
                                        : undefined
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-[15px] font-medium text-foreground/90">
                                    Allow interruption
                                </p>
                                <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                                    Stop DOT mid-sentence and take over.
                                </p>
                            </div>
                            <Switch
                                checked={interruptible}
                                onCheckedChange={setInterruptible}
                                style={
                                    interruptible
                                        ? { backgroundColor: accentColor }
                                        : undefined
                                }
                            />
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
