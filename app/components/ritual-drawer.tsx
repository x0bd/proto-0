"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
    Flame,
    Calendar,
    Smile,
    Frown,
    Meh,
    CheckCircle2,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RitualDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
}

type Mood = "terrible" | "bad" | "okay" | "good" | "great" | null;

const MOODS: { id: Mood; label: string; icon: React.ReactNode; color: string }[] = [
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
    const [selectedMood, setSelectedMood] = React.useState<Mood>(null);
    const [note, setNote] = React.useState("");

    // Mock Streak Data
    const currentStreak = 3;
    const isStreakActive = currentStreak > 0;

    // Mock Weekly Data
    const weeklyData: Record<string, Mood> = {
        Mon: "good",
        Tue: "okay",
        Wed: "great",
        Thu: null,
        Fri: null,
        Sat: null,
        Sun: null,
    };

    const handleCheckIn = () => {
        if (!selectedMood) return;
        setHasCheckedInToday(true);
        // In real app, save to state/db
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

                    {/* Streak Badge */}
                    {isStreakActive && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm">
                            <Flame className="size-4" fill="currentColor" />
                            <span className="text-sm font-bold tracking-tight">
                                {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-8 space-y-8 custom-scrollbar">

                    {/* Daily Check-In Section */}
                    <section className="space-y-3">
                        <h3 className="text-micro pl-2">Daily Check-in</h3>

                        <AnimatePresence mode="wait">
                            {!hasCheckedInToday ? (
                                <motion.div
                                    key="check-in-form"
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
                                            Take a moment to reflect. This helps DOT adapt to your current state.
                                        </p>
                                    </div>

                                    {/* Mood Selection */}
                                    <div className="flex justify-between items-center gap-2">
                                        {MOODS.map((mood) => (
                                            <button
                                                key={mood.id}
                                                onClick={() => setSelectedMood(mood.id)}
                                                className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all duration-200 flex-1 ${
                                                    selectedMood === mood.id
                                                        ? "bg-foreground/5 scale-110 shadow-sm"
                                                        : "hover:bg-foreground/[0.03] hover:scale-105 opacity-60 hover:opacity-100"
                                                }`}
                                                style={{
                                                    color: selectedMood === mood.id ? mood.color : "currentColor",
                                                }}
                                            >
                                                {mood.icon}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Optional Note */}
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add a private note (optional)..."
                                        className="w-full h-20 p-3 rounded-[16px] bg-foreground/[0.03] hover:bg-foreground/[0.04] focus:bg-foreground/[0.05] border border-transparent focus:border-foreground/10 outline-none transition-all text-[14px] placeholder:text-muted-foreground/50 resize-none"
                                    />

                                    <button
                                        onClick={handleCheckIn}
                                        disabled={!selectedMood}
                                        className="w-full h-12 rounded-[20px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                                        style={selectedMood ? {
                                            backgroundColor: accentColor,
                                            color: "#fff",
                                            boxShadow: `0 4px 14px ${accentColor}40`,
                                        } : {
                                            backgroundColor: "var(--foreground)",
                                            opacity: 0.1,
                                            color: "var(--background)"
                                        }}
                                    >
                                        Save Check-in
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="checked-in-success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
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
                                            Your streak is growing! Come back tomorrow to keep it alive.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Reflection Prompt Section */}
                    {hasCheckedInToday && (
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <h3 className="text-micro pl-2">Daily Reflection</h3>
                            <div className="p-5 bg-background/60 backdrop-blur-md rounded-[28px] border border-foreground/[0.05] shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                                    <Sparkles className="w-24 h-24" />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center gap-2 text-foreground/70">
                                        <Sparkles className="size-4" style={{ color: accentColor }} />
                                        <span className="text-[13px] font-medium uppercase tracking-wider">Suggested for you</span>
                                    </div>
                                    <p className="text-[16px] font-medium leading-snug text-foreground/90">
                                        "What is one small thing you accomplished today that you feel proud of?"
                                    </p>
                                    <button
                                        className="text-[14px] font-semibold flex items-center gap-1.5 transition-colors mt-2"
                                        style={{ color: accentColor }}
                                    >
                                        Discuss with DOT
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* Weekly Snapshot Section */}
                    <section className="space-y-3">
                        <h3 className="text-micro pl-2 flex items-center justify-between">
                            <span>Weekly Snapshot</span>
                            <TrendingUp className="size-3.5 opacity-50" />
                        </h3>

                        <div className="p-5 bg-background/60 backdrop-blur-md rounded-[28px] border border-foreground/[0.05] shadow-sm">
                            <div className="flex justify-between items-end">
                                {WEEK_DAYS.map((day, idx) => {
                                    const mood = weeklyData[day] || (hasCheckedInToday && day === "Mon" ? selectedMood : null); // Simple mock logic
                                    const isToday = idx === 0; // Pretend Monday is today for mockup

                                    let dotColor = "var(--foreground)";
                                    let dotOpacity = 0.1;

                                    if (mood) {
                                        const moodConfig = MOODS.find(m => m.id === mood);
                                        dotColor = moodConfig?.color || dotColor;
                                        dotOpacity = 1;
                                    }

                                    return (
                                        <div key={day} className="flex flex-col items-center gap-3">
                                            {/* Data point */}
                                            <div
                                                className="w-8 flex justify-center items-end h-24 rounded-full bg-foreground/[0.02] relative"
                                            >
                                                {mood && (
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: "100%" }}
                                                        className="absolute bottom-0 w-full rounded-full opacity-20"
                                                        style={{ backgroundColor: dotColor }}
                                                    />
                                                )}
                                                <div
                                                    className="size-3 rounded-full mb-2 z-10 shadow-sm transition-all duration-300"
                                                    style={{
                                                        backgroundColor: dotColor,
                                                        opacity: dotOpacity,
                                                        boxShadow: mood ? `0 0 10px ${dotColor}` : 'none'
                                                    }}
                                                />
                                            </div>
                                            {/* Day Label */}
                                            <span className={`text-[12px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                                {day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {!isStreakActive && !hasCheckedInToday && (
                                <div className="mt-6 pt-5 border-t border-foreground/[0.05] flex items-center justify-center">
                                    <p className="text-[13px] text-muted-foreground/60 text-center">
                                        Check in today to start building your weekly chart.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </SheetContent>
        </Sheet>
    );
}
