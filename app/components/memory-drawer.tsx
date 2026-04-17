"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion, AnimatePresence } from "motion/react";
import {
    Search,
    Database,
    Trash2,
    MessageSquare,
    Mic,
    CalendarDays,
    Sparkles,
    Filter,
    X,
} from "lucide-react";

interface MemoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

const MOCK_MEMORIES = [
    {
        id: "1",
        content: "User prefers concise answers over long explanations.",
        tags: ["preference"],
        source: "chat",
        date: "2 hours ago",
    },
    {
        id: "2",
        content: "Working on a new Next.js project called DOT.",
        tags: ["project"],
        source: "voice",
        date: "Yesterday",
    },
    {
        id: "3",
        content: "Feeling stressed about upcoming deadlines.",
        tags: ["mood"],
        source: "ritual",
        date: "2 days ago",
    },
    {
        id: "4",
        content: "Loves minimalist UI design and smooth animations.",
        tags: ["preference", "design"],
        source: "chat",
        date: "Last week",
    },
];

export function MemoryDrawer({
    open,
    onOpenChange,
    accentColor = "#7c3aed",
    constraintsRef,
}: MemoryDrawerProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
    const [memories, setMemories] = React.useState(MOCK_MEMORIES);
    const [memoryEnabled, setMemoryEnabled] = React.useState(true);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [clearAllConfirm, setClearAllConfirm] = React.useState(false);

    const tags = Array.from(new Set(MOCK_MEMORIES.flatMap((m) => m.tags)));

    const filteredMemories = memories.filter((m) => {
        const matchesSearch = m.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter
            ? m.tags.includes(activeFilter)
            : true;
        return matchesSearch && matchesFilter;
    });

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
            setMemories(memories.filter((m) => m.id !== deleteId));
            setDeleteId(null);
        }
    };

    const handleClearAll = () => {
        setMemories([]);
        setClearAllConfirm(false);
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
                    className="absolute top-24 left-12 w-[340px] h-[500px] te-module z-[100]"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[var(--te-blue)]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">MEMORY_CORE</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-orange)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6 space-y-8 custom-scrollbar bg-[var(--panel-bg)]">
                        {/* Top Controls Group (Search + Engine Toggle) */}
                    <div className="space-y-4 pt-2">
                        {/* Search Bar - Hardware Style */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-muted-foreground/60 transition-colors group-focus-within:text-foreground/80" />
                            <input
                                type="text"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 rounded-[16px] hardware-input outline-none transition-all text-[15px] font-mono placeholder:text-muted-foreground/50 focus:ring-1"
                                style={{ outlineColor: `${accentColor}50` }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 size-5 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-colors"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>

                        {/* Tags / Filters */}
                        {tags.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer transition-all duration-200 rounded-[8px] px-3 py-1 text-[10px] font-mono uppercase tracking-widest border-transparent"
                                    style={
                                        activeFilter === null
                                            ? {
                                                  backgroundColor: accentColor,
                                                  color: "#fff",
                                                  boxShadow: `0 4px 12px ${accentColor}40`,
                                              }
                                            : {
                                                  backgroundColor:
                                                      "var(--foreground)",
                                                  color: "var(--background)",
                                                  opacity: 0.15,
                                              }
                                    }
                                    onClick={() => setActiveFilter(null)}
                                >
                                    <span
                                        style={
                                            activeFilter === null
                                                ? {}
                                                : { color: "var(--background)" }
                                        }
                                    >
                                        All
                                    </span>
                                </Badge>
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="cursor-pointer transition-all duration-200 rounded-[8px] px-3 py-1 text-[10px] font-mono uppercase tracking-widest border-transparent"
                                        style={
                                            activeFilter === tag
                                                ? {
                                                      backgroundColor:
                                                          accentColor,
                                                      color: "#fff",
                                                      boxShadow: `0 4px 12px ${accentColor}40`,
                                                  }
                                                : {
                                                      backgroundColor:
                                                          "var(--foreground)",
                                                      color: "var(--background)",
                                                      opacity: 0.15,
                                                  }
                                        }
                                        onClick={() => setActiveFilter(tag)}
                                    >
                                        <span
                                            style={
                                                activeFilter === tag
                                                    ? {}
                                                    : {
                                                          color: "var(--background)",
                                                      }
                                            }
                                        >
                                            {tag}
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Engine Settings Group */}
                    <div className="hardware-input rounded-[20px] overflow-hidden">
                        <div className="flex items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-[14px] font-mono font-bold uppercase tracking-widest text-foreground/90">
                                    Memory Engine
                                </span>
                                <span className="text-[12px] text-muted-foreground/70 font-mono">
                                    Allow learning from conversations
                                </span>
                            </div>
                            <Switch
                                checked={memoryEnabled}
                                onCheckedChange={setMemoryEnabled}
                                style={
                                    memoryEnabled
                                        ? { backgroundColor: accentColor }
                                        : {}
                                }
                                className="scale-110"
                            />
                        </div>
                    </div>

                    {!memoryEnabled && (
                        <div className="px-5 py-4 rounded-[20px] bg-warning/10 border border-warning/20 text-warning flex items-start gap-4 shadow-sm">
                            <div className="mt-0.5">
                                <Database className="size-5 opacity-80" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[13px] font-mono font-bold uppercase tracking-widest">
                                    Engine Paused
                                </p>
                                <p className="text-[12px] opacity-80 leading-relaxed font-mono">
                                    I am currently not storing any new memories.
                                    Re-enable to resume personalization.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Memory List Group */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pl-2">
                            Stored Context ({filteredMemories.length})
                        </h3>

                        {filteredMemories.length === 0 ? (
                            <div className="py-16 text-center flex flex-col items-center gap-4 text-muted-foreground">
                                <div className="size-16 rounded-[16px] hardware-input flex items-center justify-center">
                                    <Database className="size-6 opacity-40" />
                                </div>
                                <p className="text-[13px] font-mono uppercase tracking-widest font-bold">
                                    Empty Bank
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filteredMemories.map((memory) => (
                                    <div
                                        key={memory.id}
                                        className="group relative flex flex-col p-5 rounded-[24px] hardware-btn transition-all hover:bg-foreground/[0.02]"
                                    >
                                        <p className="text-[14px] leading-relaxed text-foreground/90 pr-8">
                                            {memory.content}
                                        </p>

                                        <div className="flex items-center gap-3 mt-4">
                                            <div
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-mono font-bold tracking-widest uppercase"
                                                style={{
                                                    backgroundColor: `${accentColor}12`,
                                                    color: accentColor,
                                                }}
                                            >
                                                {getSourceIcon(memory.source)}
                                                {memory.source}
                                            </div>
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
                                                {memory.date}
                                            </span>
                                        </div>

                                        <button
                                            className="absolute top-5 right-5 size-8 rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white active:scale-90"
                                            onClick={() =>
                                                setDeleteId(memory.id)
                                            }
                                            title="Forget this"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Bottom Action */}
                {memories.length > 0 && (
                    <div className="relative z-20 p-4 border-t border-[var(--panel-border)] bg-[var(--panel-bg)] shrink-0">
                        <button
                            onClick={() => setClearAllConfirm(true)}
                            className="w-full h-12 te-button text-[var(--te-orange)]"
                        >
                            <Trash2 className="size-[16px] mr-2" />
                            PURGE_ALL
                        </button>
                    </div>
                )}

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
