"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

export interface MemoryEntry {
    id: string;
    content: string;
    tags: string[];
    source: "chat" | "voice" | "ritual" | "system";
    date: string;       // ISO string
    dateLabel?: string;  // Display label
}

const STORAGE_KEY = "dot_memory_core";

// --- Persistence helpers ---

export function loadMemories(): MemoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* fall through */ }
    return [];
}

function saveMemories(memories: MemoryEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

export function isMemoryEnabled(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dot_memory_enabled") !== "false";
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
    localStorage.setItem("dot_memory_enabled", val.toString());
}

export function MemoryDrawer({
    open,
    onOpenChange,
    accentColor = "#7c3aed",
    constraintsRef,
}: MemoryDrawerProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
    const [memories, setMemories] = React.useState<MemoryEntry[]>([]);
    const [memoryEnabled, setMemoryEnabled] = React.useState(true);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [clearAllConfirm, setClearAllConfirm] = React.useState(false);
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

    const tags = Array.from(new Set(memories.flatMap((m) => m.tags)));

    const filteredMemories = memories.filter((m) => {
        const matchesSearch = m.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter
            ? m.tags.includes(activeFilter)
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 left-12 w-[600px] h-auto te-module z-[100] flex flex-col"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[var(--te-blue)]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">MEMORY_CORE</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/30 ml-2">SN: 04-892</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-blue)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    {/* Content - 2 Column Layout */}
                    <div className="relative z-10 flex flex-row p-4 gap-5 bg-[var(--panel-bg)] h-full">
                        
                        {/* Left Column - Controls */}
                        <div className="flex flex-col gap-4 w-[240px] shrink-0">
                            {/* LCD Status Display */}
                            <div className="te-lcd p-3 flex flex-col justify-center relative overflow-hidden shrink-0 h-[64px] border border-black/10 dark:border-white/10">
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)' }} />
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold">STATUS</span>
                                    <span className="text-[8px] opacity-30 tracking-[0.2em] font-bold">CAPACITY</span>
                                </div>
                                <div className="flex items-center justify-between mt-1.5 relative z-10">
                                    <div className="flex items-center gap-2">
                                        {memoryEnabled ? (
                                            <>
                                                <div className="size-2.5 rounded-full bg-[var(--te-green)] shadow-[0_0_8px_var(--te-green)] animate-pulse" />
                                                <span className="text-[14px] font-bold opacity-90 tracking-widest">REC...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="size-2.5 rounded-full bg-[var(--te-orange)] shadow-[0_0_8px_var(--te-orange)]" />
                                                <span className="text-[14px] font-bold opacity-90 tracking-widest">PAUSED</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[14px] font-bold opacity-90 tracking-widest">{memories.length} BLK</span>
                                </div>
                            </div>

                            {/* Search */}
                            <section className="flex flex-col gap-1.5 shrink-0">
                                <div className="flex items-center justify-between px-1">
                                    <span className="te-label">QUERY_STR</span>
                                </div>
                                <div className="te-recessed p-1.5 flex items-center gap-2 relative">
                                    <span className="absolute left-3 text-[12px] font-bold text-[var(--lcd-text)]/50 font-mono">{">"}</span>
                                    <input
                                        type="text"
                                        placeholder="_"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-10 rounded-[8px] pl-7 pr-8 text-[12px] font-bold text-[var(--lcd-text)] focus:outline-none transition-all font-mono uppercase tracking-widest placeholder:text-[var(--lcd-text)]/30 bg-[var(--lcd-bg)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(0,0,0,0.1),0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.05)]"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 size-6 flex items-center justify-center text-[var(--lcd-text)]/50 hover:text-[var(--lcd-text)]"
                                        >
                                            <X className="size-3.5" />
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
                                    <div className="te-recessed p-1.5 flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => setActiveFilter(null)}
                                            className="h-8 px-3 te-button rounded-[6px] text-[9px] transition-all duration-150"
                                            style={activeFilter === null ? {
                                                "--key-bg": "var(--te-blue)",
                                                "--key-border": `color-mix(in srgb, var(--te-blue) 80%, black)`,
                                                "--key-shadow": `color-mix(in srgb, var(--te-blue) 60%, black)`,
                                                color: "#ffffff"
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
                                                    className="h-8 px-3 te-button rounded-[6px] text-[9px] transition-all duration-150"
                                                    style={active ? {
                                                        "--key-bg": "var(--te-blue)",
                                                        "--key-border": `color-mix(in srgb, var(--te-blue) 80%, black)`,
                                                        "--key-shadow": `color-mix(in srgb, var(--te-blue) 60%, black)`,
                                                        color: "#ffffff"
                                                    } as React.CSSProperties : undefined}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            <div className="flex-1" />

                            {/* Engine Settings Group */}
                            <section className="flex items-center justify-between te-recessed p-2 shrink-0">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="size-1.5 rounded-full" style={{ backgroundColor: memoryEnabled ? 'var(--te-green)' : 'var(--te-orange)', boxShadow: `0 0 6px ${memoryEnabled ? 'var(--te-green)' : 'var(--te-orange)'}` }} />
                                    <span className="te-label">LEARNING_ENG</span>
                                </div>
                                <button
                                    onClick={toggleMemoryEnabled}
                                    className="h-8 px-4 te-button rounded-[6px] text-[9px] transition-all duration-150"
                                    style={memoryEnabled ? {
                                        "--key-bg": "var(--te-green)",
                                        "--key-border": `color-mix(in srgb, var(--te-green) 80%, black)`,
                                        "--key-shadow": `color-mix(in srgb, var(--te-green) 60%, black)`,
                                        color: "#ffffff"
                                    } as React.CSSProperties : undefined}
                                >
                                    {memoryEnabled ? "ON" : "OFF"}
                                </button>
                            </section>

                            {/* Fixed Bottom Action */}
                            {memories.length > 0 && (
                                <button
                                    onClick={() => setClearAllConfirm(true)}
                                    className="w-full h-10 te-button rounded-[8px] text-[11px] flex items-center justify-center gap-2 shrink-0 text-[var(--te-orange)] hover:border-[var(--panel-border)]"
                                >
                                    <Trash2 className="size-[14px]" />
                                    PURGE_ALL
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="w-[1px] h-full bg-[var(--panel-border)] opacity-50 shadow-[1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[1px_0_0_rgba(0,0,0,0.5)]" />

                        {/* Right Column - Data Blocks Matrix */}
                        <div className="flex flex-col flex-1 gap-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">DATA_BLOCKS</span>
                                <span className="te-label">PAGE {currentPage}/{totalPages}</span>
                            </div>

                            <div className="te-recessed p-2 flex flex-col flex-1 h-full min-h-[340px]">
                                {filteredMemories.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-50">
                                        <Database className="size-6" />
                                        <span className="te-label">EMPTY_BANK</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 grid-rows-4 gap-2 flex-1">
                                        {paginatedMemories.map((memory) => {
                                            const sourceColor = memory.source === "chat" ? "var(--te-blue)" : memory.source === "voice" ? "var(--te-orange)" : "var(--te-green)";
                                            return (
                                                <div
                                                    key={memory.id}
                                                    className="group relative flex items-center p-2 rounded-[8px] bg-[var(--key-bg)] border border-[var(--key-border)] shadow-sm transition-all hover:border-[var(--panel-border)] h-full overflow-hidden"
                                                >
                                                    {/* Hardware Color Tab */}
                                                    <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: sourceColor }} />
                                                    
                                                    <div className="flex flex-col flex-1 pl-4 pr-2 h-full justify-center">
                                                        <p className="text-[11px] font-mono leading-tight text-foreground/90 uppercase tracking-wide line-clamp-2">
                                                            {memory.content}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-1" style={{ color: sourceColor }}>
                                                                {getSourceIcon(memory.source)}
                                                                {memory.source}
                                                            </span>
                                                            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
                                                                {formatDateLabel(memory.date)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="size-8 te-button !rounded-[6px] !border-b-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 text-foreground/40 hover:text-[var(--te-orange)] shrink-0 mr-1"
                                                        onClick={() => setDeleteId(memory.id)}
                                                        title="Eject Block"
                                                    >
                                                        <span className="text-[8px] font-bold tracking-widest leading-none">EJECT</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--panel-border)]">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="h-8 px-3 te-button !rounded-[6px] flex items-center justify-center disabled:opacity-30 text-foreground/70 hover:text-foreground"
                                        >
                                            <ChevronLeft className="size-4" />
                                        </button>
                                        
                                        <div className="te-lcd px-3 py-1 h-8 flex items-center justify-center">
                                            <span className="text-[10px] font-bold tracking-[0.2em] opacity-80">
                                                [{currentPage}/{totalPages}]
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-8 px-3 te-button !rounded-[6px] flex items-center justify-center disabled:opacity-30 text-foreground/70 hover:text-foreground"
                                        >
                                            <ChevronRight className="size-4" />
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}
