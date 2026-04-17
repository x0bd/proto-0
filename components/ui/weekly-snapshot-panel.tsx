"use client";

import * as React from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import type { CheckInMood } from "@/components/ui/daily-check-in-card";

interface WeeklySnapshotPanelProps {
    weekDays: string[];
    weeklyData: Record<string, CheckInMood>;
    empty: boolean;
}

const MOOD_COLORS: Record<Exclude<CheckInMood, null>, string> = {
    terrible: "var(--destructive)",
    bad: "var(--warning)",
    okay: "var(--muted-foreground)",
    good: "var(--info)",
    great: "var(--success)",
};

export function WeeklySnapshotPanel({
    weekDays,
    weeklyData,
    empty,
}: WeeklySnapshotPanelProps) {
    return (
        <section className="space-y-3">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pl-2 flex items-center justify-between">
                <span>Weekly Snapshot</span>
                <TrendingUp className="size-3.5 opacity-50" />
            </h3>

            <div className="p-5 hardware-input rounded-[24px]">
                <div className="flex justify-between items-end gap-2">
                    {weekDays.map((day, idx) => {
                        const mood = weeklyData[day];
                        const isToday = idx === 0;
                        const dotColor = mood
                            ? MOOD_COLORS[mood]
                            : "var(--foreground)";
                        const dotOpacity = mood ? 1 : 0.1;

                        return (
                            <div
                                key={day}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-8 flex justify-center items-end h-24 rounded-full bg-background border border-foreground/[0.05] relative shadow-sm">
                                    {mood && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "100%" }}
                                            className="absolute bottom-0 w-full rounded-full opacity-20"
                                            style={{
                                                backgroundColor: dotColor,
                                            }}
                                        />
                                    )}
                                    <div
                                        className="size-3 rounded-full mb-2 z-10 shadow-sm transition-all duration-300"
                                        style={{
                                            backgroundColor: dotColor,
                                            opacity: dotOpacity,
                                            boxShadow: mood
                                                ? `0 0 10px ${dotColor}`
                                                : "none",
                                        }}
                                    />
                                </div>
                                <span
                                    className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                                        isToday
                                            ? "text-foreground"
                                            : "text-muted-foreground/50"
                                    }`}
                                >
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {empty && (
                    <div className="mt-6 pt-5 border-t border-foreground/[0.05] flex items-center justify-center">
                        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 text-center">
                            Check in today to start building your weekly chart.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
