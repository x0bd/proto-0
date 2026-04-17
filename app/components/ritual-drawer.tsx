"use client";

import * as React from "react";
import { DailyCheckInCard, type CheckInMood } from "@/components/ui/daily-check-in-card";
import { ReflectionPromptCard } from "@/components/ui/reflection-prompt-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { WeeklySnapshotPanel } from "@/components/ui/weekly-snapshot-panel";
import { motion, AnimatePresence } from "motion/react";
import {
    Calendar,
    Smile,
    Frown,
    Meh,
    AlertCircle,
    X,
} from "lucide-react";

interface RitualDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

const MOODS: {
    id: CheckInMood;
    label: string;
    icon: React.ReactNode;
    color: string;
}[] = [
    { id: "terrible", label: "Terrible", icon: <Frown className="size-5" />, color: "var(--destructive)" },
    { id: "bad", label: "Bad", icon: <Frown className="size-5 opacity-70" />, color: "var(--warning)" },
    { id: "okay", label: "Okay", icon: <Meh className="size-5" />, color: "var(--muted-foreground)" },
    { id: "good", label: "Good", icon: <Smile className="size-5 opacity-70" />, color: "var(--info)" },
    { id: "great", label: "Great", icon: <Smile className="size-5" />, color: "var(--success)" },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function RitualDrawer({
    open,
    onOpenChange,
    accentColor = "#7c3aed",
    constraintsRef,
}: RitualDrawerProps) {
    const [hasCheckedInToday, setHasCheckedInToday] = React.useState(false);
    const [selectedMood, setSelectedMood] = React.useState<CheckInMood>(null);
    const [note, setNote] = React.useState("");
    const [showCheckInForm, setShowCheckInForm] = React.useState(false);
    const [hasHistory, setHasHistory] = React.useState(false);

    const hadPreviousStreak = hasHistory && !hasCheckedInToday;
    const currentStreak = hasCheckedInToday ? 3 : 0;
    const showBrokenStreak = hadPreviousStreak && currentStreak === 0;

    const weeklyData: Record<string, CheckInMood> = {
        Mon: hasCheckedInToday ? selectedMood : hasHistory ? "good" : null,
        Tue: hasHistory ? "okay" : null,
        Wed: hasHistory ? "great" : null,
        Thu: null,
        Fri: null,
        Sat: null,
        Sun: null,
    };

    const handleCheckIn = () => {
        if (!selectedMood) return;
        setHasCheckedInToday(true);
        setHasHistory(true);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 left-[400px] w-[340px] h-[500px] te-module z-[100]"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[var(--te-green)]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">RITUALS</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-orange)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6 space-y-8 custom-scrollbar bg-[var(--panel-bg)]">
                        {/* Daily Check-In Section */}
                    <section className="space-y-3">
                        <h3 className="text-micro pl-2">Daily Check-in</h3>
                        <DailyCheckInCard
                            mode={
                                hasCheckedInToday
                                    ? "complete"
                                    : showCheckInForm || hasHistory
                                      ? "form"
                                      : "onboarding"
                            }
                            moodOptions={MOODS}
                            selectedMood={selectedMood}
                            note={note}
                            onMoodSelect={setSelectedMood}
                            onNoteChange={setNote}
                            onStart={() => setShowCheckInForm(true)}
                            onSubmit={handleCheckIn}
                            accentColor={accentColor}
                        />
                    </section>

                    {showBrokenStreak && (
                        <div className="px-5 py-4 rounded-[20px] bg-warning/10 border border-warning/20 text-warning flex items-start gap-4 shadow-sm">
                            <div className="mt-0.5">
                                <AlertCircle className="size-5 opacity-80" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[14px] font-semibold tracking-tight">
                                    Your streak cooled off
                                </p>
                                <p className="text-[13px] opacity-80 leading-relaxed">
                                    One check-in brings the ritual back to life.
                                </p>
                            </div>
                        </div>
                    )}

                    {hasCheckedInToday && (
                        <section className="space-y-3">
                            <h3 className="text-micro pl-2">Daily Reflection</h3>
                            <ReflectionPromptCard
                                prompt='"What is one small thing you accomplished today that you feel proud of?"'
                                accentColor={accentColor}
                            />
                        </section>
                    )}

                    <WeeklySnapshotPanel
                        weekDays={WEEK_DAYS}
                        weeklyData={weeklyData}
                        empty={!hasHistory && !hasCheckedInToday}
                    />
                </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
