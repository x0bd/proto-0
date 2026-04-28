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
    { id: "terrible", label: "Terrible", short: "TRB", color: "var(--destructive)" },
    { id: "bad", label: "Bad", short: "BAD", color: "var(--warning)" },
    { id: "okay", label: "Okay", short: "OK", color: "var(--muted-foreground)" },
    { id: "good", label: "Good", short: "GD", color: "var(--info)" },
    { id: "great", label: "Great", short: "GRT", color: "var(--success)" },
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
    accentColor = "#7c3aed",
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 w-[360px] h-auto te-module te-safe-panel z-[100] flex flex-col"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[var(--te-green)]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">SYNC_MOD</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest te-whisper ml-2">RT-09</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-green)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex flex-col p-4 gap-4 bg-[var(--panel-bg)] h-full">
                        
                        {/* LCD Main Display */}
                        <div className="te-lcd p-3 flex flex-col justify-between relative overflow-hidden shrink-0 h-[80px] border border-black/10 dark:border-white/10">
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)' }} />
                            
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold">MODE: {hasCheckedInToday ? "REFLECTION" : "ACQUISITION"}</span>
                                <span className="text-[8px] opacity-30 tracking-[0.2em] font-bold">SEQ_ACTIVE</span>
                            </div>
                            
                            <div className="flex flex-col relative z-10">
                                <div className="text-[12px] font-bold opacity-90 tracking-widest line-clamp-1">
                                    {hasCheckedInToday 
                                        ? "> 'What is one thing you accomplished?'" 
                                        : "> AWAITING_INPUT..."}
                                </div>
                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-current/20">
                                    <span className="text-[10px] font-bold opacity-70 tracking-widest">
                                        STREAK: [{String(streak).padStart(3, "0")}]
                                    </span>
                                    <span className="text-[10px] font-bold opacity-70 tracking-widest">
                                        BEST: [{String(longestStreak).padStart(3, "0")}]
                                    </span>
                                    <span className="text-[10px] font-bold opacity-70 tracking-widest" style={{ color: hasCheckedInToday && todayEntry?.mood ? MOODS.find(m => m.id === todayEntry.mood)?.color : "inherit" }}>
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
                            <div className="te-recessed p-1.5 flex gap-1.5">
                                {WEEK_DAYS.map((day) => {
                                    const mood = weeklyData[day];
                                    const moodInfo = mood ? MOODS.find(m => m.id === mood) : null;
                                    const isActive = !!mood;
                                    
                                    return (
                                        <div key={day} className="flex-1 flex flex-col gap-1 items-center">
                                            <div 
                                                className="w-full h-2 rounded-[2px]" 
                                                style={{ 
                                                    backgroundColor: isActive && moodInfo ? moodInfo.color : "var(--key-bg)",
                                                    boxShadow: isActive && moodInfo ? `0 0 6px ${moodInfo.color}` : "inset 0 1px 2px rgba(0,0,0,0.1)",
                                                    border: "1px solid var(--panel-border)"
                                                }} 
                                            />
                                            <span className="text-[8px] font-mono font-bold tracking-widest opacity-50">{day[0]}</span>
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
                                    <div className="te-recessed p-1.5 flex gap-1.5">
                                        {MOODS.map((mood) => {
                                            const active = selectedMood === mood.id;
                                            return (
                                                <button
                                                    key={mood.id}
                                                    onClick={() => setSelectedMood(mood.id)}
                                                    className="flex-1 h-9 te-button rounded-[8px] text-[10px] transition-all duration-150"
                                                    style={active ? {
                                                        "--key-bg": mood.color,
                                                        "--key-border": `color-mix(in srgb, ${mood.color} 80%, black)`,
                                                        "--key-shadow": `color-mix(in srgb, ${mood.color} 60%, black)`,
                                                        color: "#ffffff"
                                                    } as React.CSSProperties : undefined}
                                                >
                                                    {mood.short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Input & Execute Block */}
                                <section className="flex gap-2 h-16 shrink-0 mt-1">
                                    <div className="flex-1 te-recessed p-1.5 relative group">
                                        <div className="absolute top-2.5 left-3 size-1.5 rounded-full bg-[var(--lcd-text)]/20 group-focus-within:bg-[var(--te-orange)] shadow-[0_0_8px_var(--te-orange)] transition-colors opacity-0 group-focus-within:opacity-100" />
                                        <textarea
                                            placeholder="LOG_DATA..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full h-full bg-transparent resize-none focus:outline-none text-[11px] font-mono font-bold tracking-wider placeholder:text-[var(--lcd-text)]/30 text-[var(--lcd-text)] custom-scrollbar px-3 py-1"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={!selectedMood}
                                        className="w-16 h-full te-button rounded-[10px] flex flex-col items-center justify-center gap-1 disabled:opacity-30 transition-all text-foreground"
                                        style={selectedMood ? {
                                            "--key-bg": "var(--te-green)",
                                            "--key-border": `color-mix(in srgb, var(--te-green) 80%, black)`,
                                            "--key-shadow": `color-mix(in srgb, var(--te-green) 60%, black)`,
                                            color: "#ffffff"
                                        } as React.CSSProperties : undefined}
                                    >
                                        <Check className="size-4" />
                                        <span className="text-[8px] font-bold tracking-[0.2em]">EXE</span>
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
                                    <div className="te-recessed p-3 flex-1 flex flex-col h-[115px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="size-2 rounded-full" style={{ backgroundColor: todayEntry?.mood ? MOODS.find(m => m.id === todayEntry.mood)?.color : "var(--te-green)", boxShadow: `0 0 8px ${todayEntry?.mood ? MOODS.find(m => m.id === todayEntry.mood)?.color : "var(--te-green)"}` }} />
                                            <span className="text-[10px] font-bold font-mono tracking-widest opacity-70">
                                                {todayEntry?.mood ? MOODS.find(m => m.id === todayEntry.mood)?.label.toUpperCase() : "SYNC"}
                                            </span>
                                        </div>
                                        {todayEntry?.note ? (
                                            <p className="text-[11px] font-mono font-bold tracking-wider opacity-90 custom-scrollbar overflow-y-auto">
                                                {todayEntry.note}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] font-mono font-bold tracking-wider opacity-40 italic">
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
