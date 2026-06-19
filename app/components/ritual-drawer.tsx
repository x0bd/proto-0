"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import { addMemory, isMemoryEnabled } from "./memory-drawer";

interface RitualDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

type CheckInMood = "terrible" | "bad" | "okay" | "good" | "great" | null;

const MOODS: {
    id: NonNullable<CheckInMood>;
    label: string;
    short: string;
    color: string;
}[] = [
    { id: "terrible", label: "Terrible", short: "TRB", color: "var(--error)" },
    { id: "bad", label: "Bad", short: "BAD", color: "var(--warning)" },
    { id: "okay", label: "Okay", short: "OK", color: "var(--fg-faint)" },
    { id: "good", label: "Good", short: "GD", color: "var(--success)" },
    { id: "great", label: "Great", short: "GRT", color: "var(--accent)" },
];

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STORAGE_KEY = "dot_sync_mod";

// --- Persistence helpers ---

interface SyncData {
    entries: Record<string, { mood: CheckInMood; note: string }>; // keyed by "YYYY-MM-DD"
    streak: number;
    longestStreak: number;
    timezone: string;
}

function getLocalTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
}

function getDateKey(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDateKey(key: string): Date {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
}

function shiftDateKey(key: string, offsetDays: number): string {
    const date = parseDateKey(key);
    date.setDate(date.getDate() + offsetDays);
    return getDateKey(date);
}

function getDayOfWeek(): number {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon ... 6=Sun
}

function loadSyncData(): SyncData {
    if (typeof window === "undefined") {
        return { entries: {}, streak: 0, longestStreak: 0, timezone: getLocalTimezone() };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return normalizeSyncData(JSON.parse(raw));
    } catch { /* fall through */ }
    return { entries: {}, streak: 0, longestStreak: 0, timezone: getLocalTimezone() };
}

function saveSyncData(data: SyncData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeSyncData(value: unknown): SyncData {
    const input = value && typeof value === "object"
        ? value as Partial<SyncData>
        : {};
    const entries = input.entries && typeof input.entries === "object"
        ? input.entries
        : {};
    const streak = calculateCurrentStreak(entries);
    return {
        entries,
        streak,
        longestStreak: Math.max(Number(input.longestStreak || 0), calculateLongestStreak(entries), streak),
        timezone: input.timezone || getLocalTimezone(),
    };
}

function calculateCurrentStreak(
    entries: Record<string, { mood: CheckInMood; note: string }>,
    fromKey: string = getDateKey(),
): number {
    let streak = 0;
    let key = fromKey;
    while (true) {
        if (entries[key]) {
            streak++;
            key = shiftDateKey(key, -1);
        } else {
            break;
        }
    }
    return streak;
}

function calculateLongestStreak(entries: Record<string, { mood: CheckInMood; note: string }>): number {
    const keys = new Set(Object.keys(entries));
    let longest = 0;

    for (const key of keys) {
        if (keys.has(shiftDateKey(key, -1))) continue;

        let current = 0;
        let cursor = key;
        while (keys.has(cursor)) {
            current++;
            cursor = shiftDateKey(cursor, 1);
        }
        longest = Math.max(longest, current);
    }

    return longest;
}

function getWeekEntries(entries: Record<string, { mood: CheckInMood; note: string }>): Record<string, CheckInMood> {
    const result: Record<string, CheckInMood> = {};
    const today = new Date();
    const dayOfWeek = getDayOfWeek();

    // Walk back to Monday of this week
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = getDateKey(d);
        result[WEEK_DAYS[i]] = entries[key]?.mood ?? null;
    }
    return result;
}

export function buildRitualContextForPrompt(limit: number = 7): string {
    const data = loadSyncData();
    const entryKeys = Object.keys(data.entries)
        .filter((key) => data.entries[key]?.mood)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, limit);

    if (entryKeys.length === 0) return "";

    const todayKey = getDateKey();
    const streak = calculateCurrentStreak(data.entries, todayKey);
    const longestStreak = Math.max(
        data.longestStreak || 0,
        calculateLongestStreak(data.entries),
        streak,
    );

    const rows = entryKeys.map((key) => {
        const entry = data.entries[key];
        const moodLabel =
            MOODS.find((mood) => mood.id === entry.mood)?.label ??
            entry.mood ??
            "Unknown";
        const note = entry.note.trim() ? ` - ${entry.note.trim().slice(0, 120)}` : "";
        return `- ${key}: ${moodLabel}${note}`;
    });

    return [
        `Daily check-in summary: current streak ${streak}, best streak ${longestStreak}, timezone ${data.timezone}.`,
        ...rows,
    ].join("\n");
}

export function RitualDrawer({
    open,
    onOpenChange,
    constraintsRef,
}: RitualDrawerProps) {
    const [syncData, setSyncData] = React.useState<SyncData>(() => loadSyncData());
    const [selectedMood, setSelectedMood] = React.useState<CheckInMood>(null);
    const [note, setNote] = React.useState("");

    const todayKey = getDateKey();
    const todayEntry = syncData.entries[todayKey];
    const hasCheckedInToday = !!todayEntry;
    const streak = calculateCurrentStreak(syncData.entries, todayKey);
    const longestStreak = Math.max(syncData.longestStreak || 0, calculateLongestStreak(syncData.entries), streak);
    const weeklyData = getWeekEntries(syncData.entries);

    // Load today's entry into local form state when opening
    React.useEffect(() => {
        if (open && todayEntry) {
            setSelectedMood(todayEntry.mood);
            setNote(todayEntry.note);
        } else if (open) {
            setSelectedMood(null);
            setNote("");
        }
    }, [open, todayEntry]);

    const handleCheckIn = () => {
        if (!selectedMood) return;
        const updated: SyncData = {
            ...syncData,
            entries: {
                ...syncData.entries,
                [todayKey]: { mood: selectedMood, note },
            },
            streak: 0, // will be recalculated
            longestStreak: syncData.longestStreak || 0,
            timezone: getLocalTimezone(),
        };
        updated.streak = calculateCurrentStreak(updated.entries, todayKey);
        updated.longestStreak = Math.max(updated.longestStreak, calculateLongestStreak(updated.entries));
        setSyncData(updated);
        saveSyncData(updated);
        if (isMemoryEnabled()) {
            const moodLabel = MOODS.find((m) => m.id === selectedMood)?.label ?? selectedMood;
            const content = note.trim()
                ? `Mood check-in: ${moodLabel}. ${note.trim()}`
                : `Mood check-in: ${moodLabel}`;
            addMemory({ content, tags: ["ritual", "mood"], source: "ritual" });
        }
    };

    const { x, y, onDragEnd } = usePanelPosition("ritual");

    return (
        <AnimatePresence>
            {open && (
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
                    className="absolute top-24 left-1/2 z-[100] flex h-auto w-[360px] -translate-x-1/2 flex-col te-module te-safe-panel"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header h-10 px-3">
                        <div className="flex items-center gap-2">
                            <span className="size-2 shrink-0 bg-[var(--fg)]" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg)]">SYNC_MOD</span>
                            <span className="label">RT-09</span>
                        </div>
                        <div className="te-grip h-2.5 w-10 opacity-70" />
                        <button onClick={() => onOpenChange(false)} className="size-6 shrink-0 te-button rounded-[5px]" aria-label="Close">
                            <X className="size-3" strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="fade-up relative z-10 flex h-full flex-col gap-4 p-4">
                        
                        {/* Main readout */}
                        <div className="te-lcd flex h-[80px] shrink-0 flex-col justify-between p-3">
                            <div className="flex items-center justify-between">
                                <span className="label leading-none">MODE: {hasCheckedInToday ? "REFLECTION" : "ACQUISITION"}</span>
                                <span className="label leading-none">SEQ_ACTIVE</span>
                            </div>

                            <div className="flex flex-col">
                                <div className="line-clamp-1 font-mono text-[12px] tracking-wider text-[var(--fg)]">
                                    {hasCheckedInToday
                                        ? "> 'What is one thing you accomplished?'"
                                        : "> AWAITING_INPUT..."}
                                </div>
                                <div className="mt-1 flex items-center justify-between border-t border-[var(--hair)] pt-1">
                                    <span className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)]">
                                        STREAK <span className="tabular-nums text-[var(--fg)]" style={{ fontFamily: "var(--font-display)" }}>{String(streak).padStart(3, "0")}</span>
                                    </span>
                                    <span className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)]">
                                        BEST <span className="tabular-nums text-[var(--fg)]" style={{ fontFamily: "var(--font-display)" }}>{String(longestStreak).padStart(3, "0")}</span>
                                    </span>
                                    <span
                                        className="font-mono text-[10px] tracking-widest"
                                        style={{ color: hasCheckedInToday ? "var(--success)" : "var(--fg-faint)" }}
                                    >
                                        {hasCheckedInToday ? "SYNC_OK" : "PENDING"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* SEQ / Snapshot (Week) */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">WEEK_TRK</span>
                            </div>
                            <div className="te-recessed flex gap-1.5 p-1.5">
                                {WEEK_DAYS.map((day) => {
                                    const mood = weeklyData[day];
                                    const moodInfo = mood ? MOODS.find(m => m.id === mood) : null;
                                    const isActive = !!mood;

                                    return (
                                        <div key={day} className="flex flex-1 flex-col items-center gap-1">
                                            <div
                                                className="h-2 w-full rounded-[2px] border"
                                                style={{
                                                    backgroundColor: isActive && moodInfo ? moodInfo.color : "transparent",
                                                    borderColor: isActive && moodInfo ? moodInfo.color : "var(--hair-2)",
                                                }}
                                            />
                                            <span className="font-mono text-[8px] tracking-widest text-[var(--fg-faint)]">{day[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {!hasCheckedInToday ? (
                            <>
                                {/* State Parameters */}
                                <section className="flex flex-col gap-1.5 shrink-0">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="te-label">STATE_PARAM</span>
                                    </div>
                                    <div className="te-recessed flex gap-1.5 p-1.5">
                                        {MOODS.map((mood) => {
                                            const active = selectedMood === mood.id;
                                            return (
                                                <button
                                                    key={mood.id}
                                                    onClick={() => setSelectedMood(mood.id)}
                                                    className="flex h-9 flex-1 flex-col items-center justify-center gap-1 rounded-[5px] te-button text-[9px]"
                                                    style={active ? {
                                                        background: "var(--fg)",
                                                        borderColor: "var(--fg)",
                                                        color: "var(--bg)",
                                                    } as React.CSSProperties : undefined}
                                                >
                                                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: mood.color }} />
                                                    {mood.short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Input & Execute Block */}
                                <section className="mt-1 flex h-16 shrink-0 gap-2">
                                    <textarea
                                        placeholder="LOG_DATA..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="custom-scrollbar h-full flex-1 resize-none rounded-[6px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-3 py-2 font-mono text-[11px] tracking-wider text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)]"
                                    />
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={!selectedMood}
                                        className="flex h-full w-16 flex-col items-center justify-center gap-1 rounded-[6px] te-button disabled:opacity-30"
                                        style={selectedMood ? {
                                            background: "var(--accent)",
                                            borderColor: "var(--accent)",
                                            color: "var(--accent-foreground)",
                                        } as React.CSSProperties : undefined}
                                    >
                                        <Check className="size-4" strokeWidth={1.5} />
                                        <span className="text-[8px] tracking-[0.2em]">EXE</span>
                                    </button>
                                </section>
                            </>
                        ) : (
                            <>
                                {/* Reflection Display Block */}
                                <section className="flex flex-col gap-1.5 flex-1 mt-1">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="te-label">LOG_ENTRY_SAVED</span>
                                    </div>
                                    <div className="te-recessed flex h-[115px] flex-1 flex-col p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="size-2 shrink-0 rounded-full" style={{ background: todayEntry?.mood ? MOODS.find(m => m.id === todayEntry.mood)?.color : "var(--success)" }} />
                                            <span className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)]">
                                                {todayEntry?.mood ? MOODS.find(m => m.id === todayEntry.mood)?.label.toUpperCase() : "SYNC"}
                                            </span>
                                        </div>
                                        {todayEntry?.note ? (
                                            <p className="custom-scrollbar overflow-y-auto font-mono text-[11px] tracking-wider text-[var(--fg)]">
                                                {todayEntry.note}
                                            </p>
                                        ) : (
                                            <p className="font-mono text-[11px] italic tracking-wider text-[var(--fg-faint)]">
                                                [ NO_ADDITIONAL_DATA ]
                                            </p>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                        
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
