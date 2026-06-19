"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DEFAULT_MEMORY_POLICY,
    type MemoryEntry,
} from "@/lib/memory-types";
import {
    Search,
    Database,
    Trash2,
    MessageSquare,
    Mic,
    CalendarDays,
    Sparkles,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

interface MemoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

const STORAGE_KEY = "dot_memory_core";
const MAX_MEMORY_ENTRIES = DEFAULT_MEMORY_POLICY.retentionLimit;
const MEMORY_STOP_WORDS = new Set([
    "about",
    "after",
    "again",
    "also",
    "because",
    "before",
    "being",
    "could",
    "from",
    "have",
    "into",
    "just",
    "like",
    "need",
    "really",
    "that",
    "their",
    "then",
    "there",
    "they",
    "this",
    "want",
    "were",
    "what",
    "when",
    "with",
    "would",
    "your",
]);

// --- Persistence helpers ---

function normalizeMemoryEntry(value: unknown): MemoryEntry | null {
    if (!value || typeof value !== "object") return null;
    const input = value as Partial<MemoryEntry>;
    if (typeof input.content !== "string" || !input.content.trim()) return null;
    const source =
        input.source === "chat" ||
        input.source === "voice" ||
        input.source === "ritual" ||
        input.source === "system"
            ? input.source
            : "system";
    const date =
        typeof input.date === "string" && Number.isFinite(new Date(input.date).getTime())
            ? input.date
            : new Date().toISOString();

    return {
        id: typeof input.id === "string" && input.id ? input.id : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        content: input.content,
        tags: Array.isArray(input.tags)
            ? input.tags.filter((tag): tag is string => typeof tag === "string")
            : ["general"],
        source,
        date,
    };
}

function normalizeMemories(value: unknown): MemoryEntry[] {
    if (!Array.isArray(value)) return [];
    return value
        .map(normalizeMemoryEntry)
        .filter((entry): entry is MemoryEntry => entry !== null);
}

export function loadMemories(): MemoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return normalizeMemories(JSON.parse(raw));
    } catch { /* fall through */ }
    return [];
}

function applyRetentionLimit(memories: MemoryEntry[]): MemoryEntry[] {
    return memories.slice(0, MAX_MEMORY_ENTRIES);
}

function saveMemories(memories: MemoryEntry[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applyRetentionLimit(memories)));
    } catch {
        /* storage may be unavailable or full; never block chat/voice */
    }
}

export function isMemoryEnabled(): boolean {
    if (typeof window === "undefined") return false;
    try {
        return localStorage.getItem("dot_memory_enabled") !== "false";
    } catch {
        return false;
    }
}

/** Add a memory from anywhere in the app */
export function addMemory(entry: Omit<MemoryEntry, "id" | "date">): void {
    const memories = loadMemories();
    const newEntry: MemoryEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        date: new Date().toISOString(),
    };
    memories.unshift(newEntry); // newest first
    saveMemories(memories);
}

export function purgeMemoriesByTag(tag: string): MemoryEntry[] {
    const normalizedTag = tag.toLowerCase();
    const updated = loadMemories().filter((memory) => {
        const tags = Array.isArray(memory.tags) ? memory.tags : [];
        return !tags.some((item) => item.toLowerCase() === normalizedTag);
    });
    saveMemories(updated);
    return updated;
}

function tokenizeMemoryText(value: string): string[] {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 2 && !MEMORY_STOP_WORDS.has(token));
}

function getRecencyScore(iso: string): number {
    const timestamp = new Date(iso).getTime();
    if (!Number.isFinite(timestamp)) return 0;
    const ageDays = Math.max(0, (Date.now() - timestamp) / 86_400_000);
    return Math.max(0, 1 - ageDays / 30);
}

function scoreMemory(memory: MemoryEntry, queryTokens: Set<string>, query: string): number {
    const content = memory.content.toLowerCase();
    const memoryTokens = new Set(tokenizeMemoryText(memory.content));
    const tags = Array.isArray(memory.tags) ? memory.tags : [];
    let score = getRecencyScore(memory.date) * 0.35;

    if (query && content.includes(query)) score += 3;

    for (const token of queryTokens) {
        if (memoryTokens.has(token)) score += 1.4;
        if (tags.some((tag) => tag.toLowerCase().includes(token))) score += 1.8;
        if (content.includes(token)) score += 0.45;
    }

    if (memory.source === "ritual") score += 0.12;
    return score;
}

export function getRelevantMemories(prompt: string, limit: number = 8): MemoryEntry[] {
    const memories = loadMemories();
    if (memories.length === 0) return [];

    const query = prompt.trim().toLowerCase();
    const queryTokens = new Set(tokenizeMemoryText(query));
    if (queryTokens.size === 0) return memories.slice(0, limit);

    return memories
        .map((memory, index) => ({
            memory,
            index,
            score: scoreMemory(memory, queryTokens, query),
        }))
        .filter((item) => item.score > 0.15)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, limit)
        .map((item) => item.memory);
}

export function buildMemoryContextForPrompt(prompt: string, limit: number = 8): string {
    return getRelevantMemories(prompt, limit)
        .map((memory) => {
            const tagsList = Array.isArray(memory.tags) ? memory.tags : [];
            const tags = tagsList.length ? ` [${tagsList.join(", ")}]` : "";
            return `- ${memory.content.slice(0, 140)}${tags}`;
        })
        .join("\n");
}

function formatDateLabel(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function loadMemoryEnabled(): boolean {
    if (typeof window === "undefined") return true;
    try {
        const val = localStorage.getItem("dot_memory_enabled");
        return val !== "false";
    } catch { return true; }
}

function saveMemoryEnabled(val: boolean): void {
    try {
        localStorage.setItem("dot_memory_enabled", val.toString());
    } catch {
        /* noop */
    }
}

export function MemoryDrawer({
    open,
    onOpenChange,
    constraintsRef,
}: MemoryDrawerProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
    const [memories, setMemories] = React.useState<MemoryEntry[]>([]);
    const [memoryEnabled, setMemoryEnabled] = React.useState(true);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [clearAllConfirm, setClearAllConfirm] = React.useState(false);
    const [purgeTagConfirm, setPurgeTagConfirm] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 4;

    // Load from localStorage on mount
    React.useEffect(() => {
        setMemories(loadMemories());
        setMemoryEnabled(loadMemoryEnabled());
    }, []);

    // Reload when panel opens (in case memories were added externally)
    React.useEffect(() => {
        if (open) setMemories(loadMemories());
    }, [open]);

    const tags = Array.from(new Set(memories.flatMap((m) => Array.isArray(m.tags) ? m.tags : [])));

    const filteredMemories = memories.filter((m) => {
        const matchesSearch = m.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const memoryTags = Array.isArray(m.tags) ? m.tags : [];
        const matchesFilter = activeFilter
            ? memoryTags.includes(activeFilter)
            : true;
        return matchesSearch && matchesFilter;
    });

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);

    const totalPages = Math.ceil(filteredMemories.length / ITEMS_PER_PAGE) || 1;
    const paginatedMemories = filteredMemories.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getSourceIcon = (source: string) => {
        switch (source) {
            case "chat":
                return <MessageSquare className="size-3.5" />;
            case "voice":
                return <Mic className="size-3.5" />;
            case "ritual":
                return <CalendarDays className="size-3.5" />;
            default:
                return <Sparkles className="size-3.5" />;
        }
    };

    const handleDelete = () => {
        if (deleteId) {
            const updated = memories.filter((m) => m.id !== deleteId);
            setMemories(updated);
            saveMemories(updated);
            setDeleteId(null);
        }
    };

    const handleClearAll = () => {
        setMemories([]);
        saveMemories([]);
        setClearAllConfirm(false);
    };

    const handlePurgeTag = () => {
        if (!purgeTagConfirm) return;
        const updated = purgeMemoriesByTag(purgeTagConfirm);
        setMemories(updated);
        if (activeFilter === purgeTagConfirm) setActiveFilter(null);
        setPurgeTagConfirm(null);
    };

    const toggleMemoryEnabled = () => {
        const next = !memoryEnabled;
        setMemoryEnabled(next);
        saveMemoryEnabled(next);
    };

    const { x, y, onDragEnd } = usePanelPosition("memory");

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
                    className="absolute top-24 left-12 z-[100] flex h-auto w-[600px] flex-col te-module te-safe-panel"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header h-10 px-3">
                        <div className="flex items-center gap-2">
                            <span className="size-2 shrink-0 bg-[var(--fg)]" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg)]">MEMORY_CORE</span>
                            <span className="label">SN 04-892</span>
                        </div>
                        <div className="te-grip h-2.5 w-10 opacity-70" />
                        <button onClick={() => onOpenChange(false)} className="size-6 shrink-0 te-button rounded-[5px]" aria-label="Close">
                            <X className="size-3" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Content - 2 Column Layout */}
                    <div className="fade-up relative z-10 flex h-full flex-col gap-4 p-3 sm:flex-row sm:gap-5 sm:p-4">
                        
                        {/* Left Column - Controls */}
                        <div className="flex flex-col gap-4 w-full sm:w-[240px] shrink-0">
                            {/* Status readout */}
                            <div className="te-lcd flex h-[64px] shrink-0 flex-col justify-center gap-1.5 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="label leading-none">STATUS</span>
                                    <span className="label leading-none">CAPACITY</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`size-2 shrink-0 ${memoryEnabled ? "animate-pulse" : ""}`}
                                            style={{ background: memoryEnabled ? "var(--accent)" : "var(--fg-faint)" }}
                                        />
                                        <span
                                            className="text-[14px] tracking-widest text-[var(--fg)]"
                                            style={{ fontFamily: "var(--font-display)" }}
                                        >
                                            {memoryEnabled ? "REC" : "PAUSED"}
                                        </span>
                                    </div>
                                    <span
                                        className="text-[14px] tabular-nums tracking-widest text-[var(--fg)]"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        {memories.length}/{MAX_MEMORY_ENTRIES}
                                    </span>
                                </div>
                            </div>

                            {/* Search */}
                            <section className="flex flex-col gap-1.5 shrink-0">
                                <div className="flex items-center justify-between px-1">
                                    <span className="te-label">QUERY_STR</span>
                                </div>
                                <div className="te-recessed relative flex items-center gap-2 p-1.5">
                                    <span className="absolute left-3 font-mono text-[12px] text-[var(--fg-faint)]">{">"}</span>
                                    <input
                                        type="text"
                                        placeholder="_"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-full rounded-[5px] border border-[var(--hair-2)] bg-[var(--surface-raised)] pl-7 pr-8 font-mono text-[12px] uppercase tracking-widest text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)]"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 flex size-6 items-center justify-center text-[var(--fg-faint)] hover:text-[var(--fg)]"
                                        >
                                            <X className="size-3.5" strokeWidth={1.5} />
                                        </button>
                                    )}
                                </div>
                            </section>

                            {/* Tags / Filters */}
                            {tags.length > 0 && (
                                <section className="flex flex-col gap-1.5 shrink-0">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="te-label">FILTER_TAG</span>
                                    </div>
                                    <div className="te-recessed flex flex-wrap gap-1.5 p-1.5">
                                        <button
                                            onClick={() => setActiveFilter(null)}
                                            className="h-9 rounded-[5px] te-button px-3 text-[9px]"
                                            style={activeFilter === null ? {
                                                background: "var(--fg)",
                                                borderColor: "var(--fg)",
                                                color: "var(--bg)",
                                            } as React.CSSProperties : undefined}
                                        >
                                            ALL
                                        </button>
                                        {tags.map((tag) => {
                                            const active = activeFilter === tag;
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => setActiveFilter(tag)}
                                                    className="h-9 rounded-[5px] te-button px-3 text-[9px]"
                                                    style={active ? {
                                                        background: "var(--fg)",
                                                        borderColor: "var(--fg)",
                                                        color: "var(--bg)",
                                                    } as React.CSSProperties : undefined}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {activeFilter && (
                                        <button
                                            onClick={() => setPurgeTagConfirm(activeFilter)}
                                            className="h-8 rounded-[5px] te-button text-[9px] tracking-widest text-[var(--error)] hover:border-[var(--error)]"
                                        >
                                            PURGE_TAG · {activeFilter.toUpperCase()}
                                        </button>
                                    )}
                                </section>
                            )}

                            <div className="flex-1" />

                            {/* Engine Settings Group */}
                            <section className="flex shrink-0 items-center justify-between te-recessed p-2">
                                <div className="flex items-center gap-2 px-1">
                                    <span className={`size-1.5 shrink-0 ${memoryEnabled ? "animate-pulse" : ""}`} style={{ background: memoryEnabled ? "var(--accent)" : "var(--fg-faint)" }} />
                                    <span className="te-label">LEARNING_ENG</span>
                                </div>
                                <button
                                    onClick={toggleMemoryEnabled}
                                    className="h-9 rounded-[5px] te-button px-4 text-[9px]"
                                    style={memoryEnabled ? {
                                        background: "var(--accent)",
                                        borderColor: "var(--accent)",
                                        color: "var(--accent-foreground)",
                                    } as React.CSSProperties : undefined}
                                >
                                    {memoryEnabled ? "ON" : "OFF"}
                                </button>
                            </section>

                            {/* Fixed Bottom Action */}
                            {memories.length > 0 && (
                                <button
                                    onClick={() => setClearAllConfirm(true)}
                                    className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[5px] te-button text-[11px] text-[var(--fg-muted)] hover:border-[var(--error)] hover:text-[var(--error)]"
                                >
                                    <Trash2 className="size-[14px]" strokeWidth={1.5} />
                                    PURGE_ALL
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="hidden h-full w-px bg-[var(--hair)] sm:block" />

                        {/* Right Column - Data Blocks Matrix */}
                        <div className="flex flex-col flex-1 gap-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">DATA_BLOCKS</span>
                                <span className="te-label">PAGE {currentPage}/{totalPages}</span>
                            </div>

                            <div className="te-recessed flex h-full min-h-[280px] flex-1 flex-col p-2 sm:min-h-[340px]">
                                {filteredMemories.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[var(--fg-faint)]">
                                        <Database className="size-6" strokeWidth={1.5} />
                                        <span className="te-label">EMPTY_BANK</span>
                                    </div>
                                ) : (
                                    <div className="grid flex-1 grid-cols-1 grid-rows-4 gap-2">
                                        {paginatedMemories.map((memory) => {
                                            const sourceColor = memory.source === "chat" ? "var(--fg)" : memory.source === "voice" ? "var(--warning)" : "var(--success)";
                                            return (
                                                <div
                                                    key={memory.id}
                                                    className="group relative flex h-full items-center overflow-hidden rounded-[6px] border border-[var(--hair-2)] bg-[var(--surface-raised)] p-2 transition-colors hover:border-[var(--fg)]"
                                                >
                                                    {/* Source colour tab */}
                                                    <div className="absolute bottom-0 left-0 top-0 w-1.5" style={{ background: sourceColor }} />

                                                    <div className="flex h-full flex-1 flex-col justify-center pl-4 pr-2">
                                                        <p className="line-clamp-2 font-mono text-[11px] leading-tight text-[var(--fg)]">
                                                            {memory.content}
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-3">
                                                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest" style={{ color: sourceColor }}>
                                                                {getSourceIcon(memory.source)}
                                                                {memory.source}
                                                            </span>
                                                            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--fg-faint)]">
                                                                {formatDateLabel(memory.date)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="mr-1 size-9 shrink-0 rounded-[5px] te-button text-[var(--fg-muted)] opacity-100 transition-opacity duration-200 hover:border-[var(--error)] hover:text-[var(--error)] sm:opacity-0 sm:group-hover:opacity-100"
                                                        onClick={() => setDeleteId(memory.id)}
                                                        title="Eject Block"
                                                    >
                                                        <span className="text-[8px] tracking-widest leading-none">EJECT</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-2 flex items-center justify-between border-t border-[var(--hair)] pt-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex h-9 items-center justify-center rounded-[5px] te-button px-3 disabled:opacity-30"
                                        >
                                            <ChevronLeft className="size-4" strokeWidth={1.5} />
                                        </button>

                                        <div className="flex h-8 items-center justify-center te-lcd px-3 py-1">
                                            <span className="text-[10px] tabular-nums tracking-[0.2em] text-[var(--fg)]">
                                                [{currentPage}/{totalPages}]
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex h-9 items-center justify-center rounded-[5px] te-button px-3 disabled:opacity-30"
                                        >
                                            <ChevronRight className="size-4" strokeWidth={1.5} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <ConfirmDialog
                        open={!!deleteId}
                        onOpenChange={(open) => !open && setDeleteId(null)}
                        title="Forget this memory?"
                        description="I will no longer use this information to personalize my responses."
                        confirmText="Forget"
                        destructive
                        onConfirm={handleDelete}
                    />

                    <ConfirmDialog
                        open={clearAllConfirm}
                        onOpenChange={setClearAllConfirm}
                        title="Purge Memory Core?"
                        description="This will permanently delete everything I have learned about you. This action cannot be undone."
                        confirmText="Purge Everything"
                        destructive
                        onConfirm={handleClearAll}
                    />

                    <ConfirmDialog
                        open={purgeTagConfirm !== null}
                        onOpenChange={(open) => !open && setPurgeTagConfirm(null)}
                        title="Purge memory tag?"
                        description={`This will permanently delete every memory tagged "${purgeTagConfirm ?? ""}". Other memory blocks stay intact.`}
                        confirmText="Purge Tag"
                        destructive
                        onConfirm={handlePurgeTag}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
