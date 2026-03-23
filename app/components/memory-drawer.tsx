"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Search,
    Database,
    Trash2,
    CalendarDays,
    MessageSquare,
    Mic,
    Sparkles,
    Filter,
} from "lucide-react";

interface MemoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
}

// Mock Data
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
                return <MessageSquare className="size-3" />;
            case "voice":
                return <Mic className="size-3" />;
            case "ritual":
                return <CalendarDays className="size-3" />;
            default:
                return <Sparkles className="size-3" />;
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
                className="w-[calc(100vw-16px)] sm:w-[450px] sm:max-w-md p-0 flex flex-col right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 h-[calc(100svh-16px)] sm:h-[calc(100svh-32px)] rounded-[24px] border overflow-hidden shadow-2xl bg-background"
                style={{ borderColor: `${accentColor}20` }}
            >
                {/* Subtle background tints */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundColor: accentColor }}
                />
                <div className="absolute inset-0 bg-washi pointer-events-none opacity-40 mix-blend-overlay" />

                {/* Clean Header */}
                <SheetHeader
                    className="relative z-10 px-6 py-5 border-b bg-background/80 backdrop-blur-md flex flex-row items-center space-y-0"
                    style={{ borderColor: `${accentColor}10` }}
                >
                    <div className="flex items-center gap-2">
                        <Database className="size-5" />
                        <SheetTitle className="text-lg font-bold">
                            Memory Core
                        </SheetTitle>
                    </div>
                    {/* Note: The default Sheet close button is automatically rendered by Shadcn in the top right. */}
                </SheetHeader>

                <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6 space-y-6">
                    {/* Main Controls Card */}
                    <div
                        className="flex flex-col gap-4 p-5 rounded-[20px] bg-card border shadow-sm"
                        style={{ borderColor: `${accentColor}10` }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold">
                                    Memory Engine
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Continuously learn from interactions
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
                            />
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-10 rounded-[12px] bg-background border-foreground/10 focus-visible:ring-1 shadow-sm text-sm"
                                style={
                                    {
                                        "--tw-ring-color": accentColor,
                                    } as React.CSSProperties
                                }
                            />
                        </div>

                        {tags.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                <Filter className="size-3.5 text-muted-foreground shrink-0 ml-1" />
                                <Badge
                                    variant={
                                        activeFilter === null
                                            ? "default"
                                            : "secondary"
                                    }
                                    className="cursor-pointer transition-colors rounded-full px-3 py-1 text-[11px]"
                                    style={
                                        activeFilter === null
                                            ? {
                                                  backgroundColor: accentColor,
                                                  color: "#fff",
                                              }
                                            : {}
                                    }
                                    onClick={() => setActiveFilter(null)}
                                >
                                    All
                                </Badge>
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={
                                            activeFilter === tag
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="cursor-pointer transition-colors rounded-full px-3 py-1 text-[11px]"
                                        style={
                                            activeFilter === tag
                                                ? {
                                                      backgroundColor:
                                                          accentColor,
                                                      color: "#fff",
                                                  }
                                                : {}
                                        }
                                        onClick={() => setActiveFilter(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {!memoryEnabled && (
                        <div className="p-4 rounded-[20px] border border-dashed border-warning/30 bg-warning/5 text-warning flex flex-col items-center text-center gap-2">
                            <Database className="size-6 opacity-50" />
                            <p className="text-sm font-medium">
                                Memory is paused
                            </p>
                            <p className="text-xs opacity-80">
                                I will not remember new information from our
                                conversations until this is re-enabled.
                            </p>
                        </div>
                    )}

                    {/* Memory List */}
                    <div className="space-y-3">
                        {filteredMemories.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center gap-3 opacity-50">
                                <Database className="size-8" />
                                <p className="text-sm">No memories found</p>
                            </div>
                        ) : (
                            filteredMemories.map((memory) => (
                                <div
                                    key={memory.id}
                                    className="group p-5 rounded-[24px] border bg-card shadow-sm transition-all hover:shadow-md"
                                    style={{ borderColor: `${accentColor}15` }}
                                >
                                    <p className="text-[14px] font-medium leading-relaxed mb-4 text-foreground/90">
                                        {memory.content}
                                    </p>
                                    <div
                                        className="flex items-center justify-between mt-auto pt-3 border-t"
                                        style={{
                                            borderColor: `${accentColor}10`,
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono font-semibold text-muted-foreground">
                                                {getSourceIcon(memory.source)}
                                                <span>{memory.source}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/30">
                                                •
                                            </span>
                                            <span className="text-[11px] font-mono text-muted-foreground/60">
                                                {memory.date}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                            onClick={() =>
                                                setDeleteId(memory.id)
                                            }
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                {memories.length > 0 && (
                    <div
                        className="relative z-10 p-5 border-t bg-background/80 backdrop-blur-md"
                        style={{ borderColor: `${accentColor}10` }}
                    >
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-[16px] text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 font-semibold"
                            onClick={() => setClearAllConfirm(true)}
                        >
                            <Trash2 className="size-4 mr-2" />
                            Purge All Memory
                        </Button>
                    </div>
                )}

                <ConfirmDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Delete Memory"
                    description="Are you sure you want to forget this? I will no longer use this information to personalize my responses."
                    confirmText="Forget"
                    destructive
                    onConfirm={handleDelete}
                />

                <ConfirmDialog
                    open={clearAllConfirm}
                    onOpenChange={setClearAllConfirm}
                    title="Purge All Memories"
                    description="This will permanently delete everything I have learned about you. This action cannot be undone."
                    confirmText="Purge Everything"
                    destructive
                    onConfirm={handleClearAll}
                />
            </SheetContent>
        </Sheet>
    );
}
