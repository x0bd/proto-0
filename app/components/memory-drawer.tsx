"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
                <SheetHeader className="relative z-10 px-8 py-7 pb-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="size-10 rounded-full flex items-center justify-center shadow-sm"
                                style={{
                                    backgroundColor: `${accentColor}15`,
                                    color: accentColor,
                                }}
                            >
                                <Database className="size-5" />
                            </div>
                            <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground/90">
                                Memory
                            </SheetTitle>
                        </div>
                        {/* Custom Close Button overriding the default one for better placement */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="size-9 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors active:scale-95"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-8 space-y-8 custom-scrollbar">
                    {/* Top Controls Group (Search + Engine Toggle) */}
                    <div className="space-y-4 pt-2">
                        {/* Search Bar - iOS Style */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-muted-foreground/60 transition-colors group-focus-within:text-foreground/80" />
                            <input
                                type="text"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-foreground/[0.03] hover:bg-foreground/[0.05] focus:bg-foreground/[0.04] border border-transparent focus:border-foreground/10 outline-none transition-all text-[15px] placeholder:text-muted-foreground/50"
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
                                    className="cursor-pointer transition-all duration-200 rounded-full px-4 py-1.5 text-xs font-medium border-transparent"
                                    style={
                                        activeFilter === null
                                            ? {
                                                  backgroundColor: accentColor,
                                                  color: "#fff",
                                                  boxShadow: `0 4px 12px ${accentColor}40`,
                                              }
                                            : {
                                                  backgroundColor:
                                                      "var(--color-foreground)",
                                                  opacity: 0.05,
                                                  color: "transparent",
                                              }
                                    } // Using a trick for inactive state
                                    onClick={() => setActiveFilter(null)}
                                >
                                    <span
                                        style={
                                            activeFilter === null
                                                ? {}
                                                : {
                                                      color: "var(--color-foreground)",
                                                      opacity: 20,
                                                  }
                                        }
                                    >
                                        All
                                    </span>
                                </Badge>
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="cursor-pointer transition-all duration-200 rounded-full px-4 py-1.5 text-xs font-medium border-transparent"
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
                                                          "var(--color-foreground)",
                                                      opacity: 0.05,
                                                      color: "transparent",
                                                  }
                                        }
                                        onClick={() => setActiveFilter(tag)}
                                    >
                                        <span
                                            style={
                                                activeFilter === tag
                                                    ? {}
                                                    : {
                                                          color: "var(--color-foreground)",
                                                          opacity: 20,
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

                    {/* Engine Settings Group (iOS Settings Style) */}
                    <div className="bg-background/60 backdrop-blur-md rounded-[24px] border border-foreground/[0.05] overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-[15px] font-medium text-foreground/90">
                                    Memory Engine
                                </span>
                                <span className="text-[13px] text-muted-foreground/70">
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
                                <p className="text-[14px] font-semibold tracking-tight">
                                    Engine Paused
                                </p>
                                <p className="text-[13px] opacity-80 leading-relaxed">
                                    I am currently not storing any new memories.
                                    Re-enable to resume personalization.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Memory List Group */}
                    <div className="space-y-3">
                        <h3 className="text-micro pl-2">
                            Stored Context ({filteredMemories.length})
                        </h3>

                        {filteredMemories.length === 0 ? (
                            <div className="py-16 text-center flex flex-col items-center gap-4 text-muted-foreground">
                                <div className="size-16 rounded-full bg-foreground/5 flex items-center justify-center">
                                    <Database className="size-6 opacity-40" />
                                </div>
                                <p className="text-[15px] font-medium">
                                    Nothing to show
                                </p>
                            </div>
                        ) : (
                            <div className="bg-background/60 backdrop-blur-md rounded-[28px] border border-foreground/[0.05] overflow-hidden shadow-sm flex flex-col">
                                {filteredMemories.map((memory, index) => (
                                    <div
                                        key={memory.id}
                                        className="group relative flex flex-col p-5 transition-colors hover:bg-foreground/[0.02]"
                                        style={{
                                            borderBottom:
                                                index !==
                                                filteredMemories.length - 1
                                                    ? "1px solid var(--color-foreground)"
                                                    : "none",
                                            borderBottomOpacity: 0.05,
                                        }}
                                    >
                                        <p className="text-[15px] leading-relaxed text-foreground/90 pr-8">
                                            {memory.content}
                                        </p>

                                        <div className="flex items-center gap-3 mt-4">
                                            <div
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase"
                                                style={{
                                                    backgroundColor: `${accentColor}12`,
                                                    color: accentColor,
                                                }}
                                            >
                                                {getSourceIcon(memory.source)}
                                                {memory.source}
                                            </div>
                                            <span className="text-[12px] text-muted-foreground/40">
                                                {memory.date}
                                            </span>
                                        </div>

                                        <button
                                            className="absolute top-5 right-5 size-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white active:scale-90"
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
                    <div className="relative z-20 p-5 pt-4 border-t border-foreground/[0.05] bg-background/80 backdrop-blur-xl shrink-0">
                        <button
                            onClick={() => setClearAllConfirm(true)}
                            className="w-full h-14 rounded-[20px] bg-foreground/5 hover:bg-destructive/10 text-destructive font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Trash2 className="size-[18px]" />
                            Purge All Memory
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
            </SheetContent>
        </Sheet>
    );
}
