"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Sparkles } from "lucide-react";

export type CheckInMood =
    | "terrible"
    | "bad"
    | "okay"
    | "good"
    | "great"
    | null;

interface MoodOption {
    id: CheckInMood;
    label: string;
    icon: React.ReactNode;
    color: string;
}

interface DailyCheckInCardProps {
    mode: "onboarding" | "form" | "complete";
    moodOptions: MoodOption[];
    selectedMood: CheckInMood;
    note: string;
    onMoodSelect: (mood: CheckInMood) => void;
    onNoteChange: (note: string) => void;
    onStart: () => void;
    onSubmit: () => void;
    accentColor?: string;
}

export function DailyCheckInCard({
    mode,
    moodOptions,
    selectedMood,
    note,
    onMoodSelect,
    onNoteChange,
    onStart,
    onSubmit,
    accentColor = "#7c3aed",
}: DailyCheckInCardProps) {
    return (
        <AnimatePresence mode="wait">
            {mode === "onboarding" && (
                <motion.div
                    key="onboarding"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 bg-background/60 backdrop-blur-md rounded-[28px] border border-foreground/[0.05] shadow-sm space-y-5"
                >
                    <div className="space-y-2">
                        <div
                            className="size-11 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: `${accentColor}14`,
                                color: accentColor,
                            }}
                        >
                            <Sparkles className="size-5" />
                        </div>
                        <h4 className="text-[17px] font-semibold text-foreground/90 tracking-tight">
                            Start your first check-in
                        </h4>
                        <p className="text-[14px] text-muted-foreground/80 leading-relaxed">
                            Rituals help DOT reflect your day, build momentum,
                            and shape more personal responses over time.
                        </p>
                    </div>

                    <button
                        onClick={onStart}
                        className="w-full h-12 rounded-[20px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
                        style={{
                            backgroundColor: accentColor,
                            color: "#fff",
                            boxShadow: `0 4px 14px ${accentColor}40`,
                        }}
                    >
                        Begin Today&apos;s Ritual
                    </button>
                </motion.div>
            )}

            {mode === "form" && (
                <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 bg-background/60 backdrop-blur-md rounded-[28px] border border-foreground/[0.05] shadow-sm space-y-5"
                >
                    <div className="space-y-1.5">
                        <h4 className="text-[17px] font-semibold text-foreground/90 tracking-tight">
                            How are you feeling today?
                        </h4>
                        <p className="text-[14px] text-muted-foreground/80 leading-relaxed">
                            Take a moment to reflect. This helps DOT adapt to
                            your current state.
                        </p>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        {moodOptions.map((mood) => (
                            <button
                                key={mood.label}
                                onClick={() => onMoodSelect(mood.id)}
                                className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all duration-200 flex-1 ${
                                    selectedMood === mood.id
                                        ? "bg-foreground/5 scale-110 shadow-sm"
                                        : "hover:bg-foreground/[0.03] hover:scale-105 opacity-60 hover:opacity-100"
                                }`}
                                style={{
                                    color:
                                        selectedMood === mood.id
                                            ? mood.color
                                            : "currentColor",
                                }}
                            >
                                {mood.icon}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder="Add a private note (optional)..."
                        className="w-full h-20 p-3 rounded-[16px] bg-foreground/[0.03] hover:bg-foreground/[0.04] focus:bg-foreground/[0.05] border border-transparent focus:border-foreground/10 outline-none transition-all text-[14px] placeholder:text-muted-foreground/50 resize-none"
                    />

                    <button
                        onClick={onSubmit}
                        disabled={!selectedMood}
                        className="w-full h-12 rounded-[20px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                        style={
                            selectedMood
                                ? {
                                      backgroundColor: accentColor,
                                      color: "#fff",
                                      boxShadow: `0 4px 14px ${accentColor}40`,
                                  }
                                : {
                                      backgroundColor: "var(--foreground)",
                                      opacity: 0.1,
                                      color: "var(--background)",
                                  }
                        }
                    >
                        Save Check-in
                    </button>
                </motion.div>
            )}

            {mode === "complete" && (
                <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 bg-success/10 border border-success/20 rounded-[28px] shadow-sm flex items-start gap-4"
                >
                    <div className="mt-1 bg-success text-success-foreground rounded-full p-1 shadow-sm">
                        <CheckCircle2 className="size-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[16px] font-semibold text-success tracking-tight">
                            Checked in for today
                        </h4>
                        <p className="text-[14px] text-success/80 leading-relaxed">
                            Your streak is growing. Come back tomorrow to keep
                            it alive.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
