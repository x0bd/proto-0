"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Waves, Mic2 } from "lucide-react";

interface PersonaSettingsPanelProps {
    accentColor?: string;
}

export function PersonaSettingsPanel({
    accentColor = "#7c3aed",
}: PersonaSettingsPanelProps) {
    const [expressiveness, setExpressiveness] = React.useState([72]);
    const [directness, setDirectness] = React.useState([54]);
    const [autoVoice, setAutoVoice] = React.useState(true);
    const [voiceMood, setVoiceMood] = React.useState("matched");

    return (
        <div className="space-y-5">
            <div className="rounded-[28px] bg-background/60 backdrop-blur-md border border-foreground/[0.05] p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                    <Waves
                        className="size-4"
                        style={{ color: accentColor }}
                    />
                    <span className="text-micro">Tone Tuning</span>
                </div>

                {[
                    {
                        label: "Expressiveness",
                        value: expressiveness,
                        onChange: setExpressiveness,
                    },
                    {
                        label: "Directness",
                        value: directness,
                        onChange: setDirectness,
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
                        />
                    </div>
                ))}
            </div>

            <div className="rounded-[28px] bg-background/60 backdrop-blur-md border border-foreground/[0.05] p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                    <Mic2
                        className="size-4"
                        style={{ color: accentColor }}
                    />
                    <span className="text-micro">Voice Match</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-[15px] font-medium text-foreground/90">
                            Auto-voice persona
                        </p>
                        <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                            Match voice energy to the selected personality.
                        </p>
                    </div>
                    <Switch
                        checked={autoVoice}
                        onCheckedChange={setAutoVoice}
                        style={
                            autoVoice
                                ? { backgroundColor: accentColor }
                                : undefined
                        }
                    />
                </div>

                <RadioGroup
                    value={voiceMood}
                    onValueChange={setVoiceMood}
                    className="grid grid-cols-1 gap-3"
                >
                    {[
                        {
                            id: "matched",
                            title: "Matched",
                            description: "Mirror the selected persona fully.",
                        },
                        {
                            id: "softened",
                            title: "Softened",
                            description:
                                "Keep the persona, but make speech gentler.",
                        },
                    ].map((option) => (
                        <label
                            key={option.id}
                            htmlFor={option.id}
                            className="flex items-start gap-3 rounded-[22px] border border-foreground/[0.06] bg-background/45 p-4 cursor-pointer"
                        >
                            <RadioGroupItem
                                value={option.id}
                                id={option.id}
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor={option.id}
                                    className="text-[14px] font-medium text-foreground/90 cursor-pointer"
                                >
                                    {option.title}
                                </Label>
                                <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                                    {option.description}
                                </p>
                            </div>
                        </label>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
}
