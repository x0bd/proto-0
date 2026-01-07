"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
    X, 
    Settings2, 
    FileText, 
    Activity, 
    Cpu, 
    Eye,
    ChevronRight,
    Terminal
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface RightPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    history: any[]; // Replace with proper type
}

export function RightPanel({ isOpen, onToggle, history }: RightPanelProps) {
    const [activeTab, setActiveTab] = useState<"logs" | "sys">("logs");

    return (
        <div 
            className={cn(
                "fixed right-0 top-0 h-[100dvh] z-30 transition-all duration-300 ease-in-out border-l border-border/40 font-mono",
                isOpen ? "w-80 translate-x-0" : "w-12 translate-x-0 bg-transparent border-l-0"
            )}
        >
            {/* Background Layers (Only visible when open) */}
            <div className={cn("absolute inset-0 bg-background/60 backdrop-blur-3xl transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} />
            <div className={cn("absolute inset-0 bg-grain opacity-10 pointer-events-none transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} />

            {/* Toggle Handle (Visible when collapsed) */}
            {!isOpen && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onToggle}
                    className="absolute top-6 right-2 z-50 rounded-l-lg rounded-r-none bg-background/40 backdrop-blur-md border border-r-0 border-white/10 hover:bg-background/60 h-10 w-8"
                >
                    <ChevronRight className="size-4 text-muted-foreground rotate-180" />
                </Button>
            )}

            {/* Content Container */}
            <div className={cn("relative z-10 flex flex-col h-full overflow-hidden transition-all duration-300", !isOpen && "opacity-0 pointer-events-none")}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-foreground/80">
                         <Terminal className="size-4 opacity-50" />
                         <span className="text-xs font-bold tracking-[0.2em] font-mono uppercase">Console</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
                        <ChevronRight className="size-4 opacity-50" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-2 px-4 border-b border-white/5 bg-black/20">
                    <TabButton 
                        active={activeTab === "logs"} 
                        onClick={() => setActiveTab("logs")}
                        icon={FileText}
                        label="LOGS"
                    />
                    <TabButton 
                        active={activeTab === "sys"} 
                        onClick={() => setActiveTab("sys")}
                        icon={Settings2}
                        label="SYS"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {/* LOGS TAB */}
                    {activeTab === "logs" && (
                         <ScrollArea className="h-full w-full">
                            <div className="p-4 space-y-3">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 opacity-50">Session Logs</div>
                                
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 gap-2">
                                        <Activity className="size-6 opacity-50" />
                                        <span className="text-xs">No activity recorded</span>
                                    </div>
                                ) : (
                                    history.map((msg, idx) => (
                                        <div key={idx} className="flex flex-col gap-1 text-xs mb-4 group animate-in fade-in slide-in-from-right-2 duration-300">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("size-1.5 rounded-full", msg.role === 'user' ? "bg-cyan-500" : "bg-purple-500")} />
                                                <span className="capitalize font-bold text-foreground/70">{msg.role}</span>
                                                <span className="text-[9px] text-muted-foreground ml-auto font-mono opacity-50">00:0{idx}</span>
                                            </div>
                                            <div className="pl-3.5 border-l border-white/5 text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                         </ScrollArea>
                    )}

                    {/* SYS TAB */}
                    {activeTab === "sys" && (
                        <ScrollArea className="h-full w-full">
                             <div className="p-4 space-y-6">
                                {/* Monitor Group */}
                                <div className="space-y-3">
                                    <div className="text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground/50">Details / 詳細</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <MetricCard label="FPS" value="60" icon={Activity} />
                                        <MetricCard label="MEMORY" value="42MB" icon={Cpu} />
                                        <MetricCard label="LATENCY" value="12ms" icon={Terminal} />
                                        <MetricCard label="ENGINE" value="v1.0" icon={Settings2} />
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                {/* Debug Group */}
                                <div className="space-y-3">
                                     <div className="text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground/50">Overrides / オーバーライド</div>
                                     <div className="space-y-1">
                                        <ToggleRow label="Show Hitboxes" />
                                        <ToggleRow label="Debug Emotion" />
                                        <ToggleRow label="Disable Gaze" />
                                     </div>
                                </div>
                             </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-white/5 text-[9px] text-center text-muted-foreground/30 font-mono">
                    TERMINAL_ACTIVE // {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-sm transition-all text-xs font-mono tracking-wider",
                active ? "bg-white/10 text-foreground shadow-sm" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className="size-3" />
            <span>{label}</span>
        </button>
    )
}

function MetricCard({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="bg-white/5 rounded-sm p-3 border border-white/5 flex flex-col gap-1 hover:bg-white/10 transition-colors cursor-default group">
            <div className="flex items-center justify-between text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                <span className="text-[9px] tracking-wider">{label}</span>
                <Icon className="size-3" />
            </div>
            <div className="text-xl font-mono text-foreground/80 font-light" style={{ fontFamily: "var(--font-departure)" }}>{value}</div>
        </div>
    )
}

function ToggleRow({ label }: { label: string }) {
    return (
         <div className="flex items-center justify-between p-2 rounded-sm hover:bg-white/5 cursor-pointer group transition-colors">
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
            <div className="size-3 rounded-full border border-white/20 bg-transparent group-hover:border-white/40" />
         </div>
    )
}
