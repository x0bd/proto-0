"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { DailyCheckInCard, type CheckInMood } from "@/components/ui/daily-check-in-card";
import { ReflectionPromptCard } from "@/components/ui/reflection-prompt-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { WeeklySnapshotPanel } from "@/components/ui/weekly-snapshot-panel";
import {
    Calendar,
    Smile,
    Frown,
    Meh,
    AlertCircle,
} from "lucide-react";

interface RitualDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-[calc(100vw-16px)] sm:w-[460px] sm:max-w-md p-0 flex flex-col right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 h-[calc(100svh-16px)] sm:h-[calc(100svh-32px)] rounded-[32px] border-0 shadow-premium overflow-hidden glass-card"
                style={
                    {
                        "--tw-glass-border": `${accentColor}20`,
                    } as React.CSSProperties
                }
            >
                {/* Subtle dynamic background wash */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-color-burn"
                    style={{ backgroundColor: accentColor }}
                />
                <div className="absolute inset-0 bg-washi pointer-events-none opacity-[0.15]" />

                {/* Header */}
                <SheetHeader className="relative z-10 px-8 py-7 pb-4 shrink-0 flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="size-10 rounded-full flex items-center justify-center shadow-sm"
                            style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                            }}
                        >
                            <Calendar className="size-5" />
                        </div>
                        <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground/90">
                            Rituals
                        </SheetTitle>
                    </div>
                    <StreakBadge
                        streak={currentStreak}
                        broken={showBrokenStreak}
                        accentColor={accentColor}
                    />
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-8 space-y-8 custom-scrollbar">
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
            </SheetContent>
        </Sheet>
    );
}
