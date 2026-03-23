"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Search, BrainCircuit, Trash2, CalendarDays, MessageSquare, Mic, Sparkles, Filter } from "lucide-react"

interface MemoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accentColor?: string
}

// Mock Data
const MOCK_MEMORIES = [
  { id: "1", content: "User prefers concise answers over long explanations.", tags: ["preference"], source: "chat", date: "2 hours ago" },
  { id: "2", content: "Working on a new Next.js project called DOT.", tags: ["project"], source: "voice", date: "Yesterday" },
  { id: "3", content: "Feeling stressed about upcoming deadlines.", tags: ["mood"], source: "ritual", date: "2 days ago" },
  { id: "4", content: "Loves minimalist UI design and smooth animations.", tags: ["preference", "design"], source: "chat", date: "Last week" },
]

export function MemoryDrawer({ open, onOpenChange, accentColor = "#7c3aed" }: MemoryDrawerProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null)
  const [memories, setMemories] = React.useState(MOCK_MEMORIES)
  const [memoryEnabled, setMemoryEnabled] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [clearAllConfirm, setClearAllConfirm] = React.useState(false)

  const tags = Array.from(new Set(MOCK_MEMORIES.flatMap(m => m.tags)))

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter ? m.tags.includes(activeFilter) : true
    return matchesSearch && matchesFilter
  })

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "chat": return <MessageSquare className="size-3" />
      case "voice": return <Mic className="size-3" />
      case "ritual": return <CalendarDays className="size-3" />
      default: return <Sparkles className="size-3" />
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      setMemories(memories.filter(m => m.id !== deleteId))
      setDeleteId(null)
    }
  }

  const handleClearAll = () => {
    setMemories([])
    setClearAllConfirm(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[450px] p-0 flex flex-col border-l"
        style={{ borderColor: `${accentColor}20` }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute inset-0 bg-washi pointer-events-none opacity-40 mix-blend-overlay" />

        <SheetHeader className="relative z-10 p-6 pb-4 border-b bg-background/80 backdrop-blur-md" style={{ borderColor: `${accentColor}10` }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
              <BrainCircuit className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-xl">Memory Core</SheetTitle>
              <SheetDescription>What I've learned about you</SheetDescription>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 mt-4 rounded-lg bg-foreground/5 border border-foreground/10">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Memory Engine</span>
              <span className="text-xs text-muted-foreground">Continuously learn from interactions</span>
            </div>
            <Switch
              checked={memoryEnabled}
              onCheckedChange={setMemoryEnabled}
              style={memoryEnabled ? { backgroundColor: accentColor } : {}}
            />
          </div>
        </SheetHeader>

        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {!memoryEnabled && (
            <div className="p-4 rounded-lg border border-dashed border-warning/30 bg-warning/5 text-warning flex flex-col items-center text-center gap-2">
              <BrainCircuit className="size-6 opacity-50" />
              <p className="text-sm font-medium">Memory is paused</p>
              <p className="text-xs opacity-80">I will not remember new information from our conversations until this is re-enabled.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-foreground/10 focus-visible:ring-1"
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            </div>

            {tags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <Badge
                  variant={activeFilter === null ? "default" : "secondary"}
                  className="cursor-pointer transition-colors"
                  style={activeFilter === null ? { backgroundColor: accentColor, color: '#fff' } : {}}
                  onClick={() => setActiveFilter(null)}
                >
                  All
                </Badge>
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant={activeFilter === tag ? "default" : "secondary"}
                    className="cursor-pointer transition-colors"
                    style={activeFilter === tag ? { backgroundColor: accentColor, color: '#fff' } : {}}
                    onClick={() => setActiveFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredMemories.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-3 opacity-50">
                <BrainCircuit className="size-8" />
                <p className="text-sm">No memories found</p>
              </div>
            ) : (
              filteredMemories.map(memory => (
                <div
                  key={memory.id}
                  className="group p-4 rounded-xl border bg-card/50 backdrop-blur-sm transition-all hover:shadow-sm"
                  style={{ borderColor: `${accentColor}15` }}
                >
                  <p className="text-sm leading-relaxed mb-3">{memory.content}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                        {getSourceIcon(memory.source)}
                        <span>{memory.source}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50">•</span>
                      <span className="text-[10px] text-muted-foreground">{memory.date}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(memory.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {memories.length > 0 && (
          <div className="relative z-10 p-4 border-t bg-background/80 backdrop-blur-md" style={{ borderColor: `${accentColor}10` }}>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
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
  )
}
