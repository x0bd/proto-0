"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
    Settings2, 
    FileText, 
    Activity, 
    Cpu, 
    ChevronLeft,
    Terminal
} from "lucide-react";

interface RightPanelProps extends React.ComponentProps<typeof Sidebar> {
    history: { role: string; content: string }[];
}

export function RightPanel({ history, ...props }: RightPanelProps) {
    const [activeTab, setActiveTab] = useState<"logs" | "sys">("logs");

    return (
        <Sidebar side="right" collapsible="icon" className="border-l-0" {...props}>
            {/* Background Layers */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl z-0" />
            <div className="absolute inset-0 bg-grain opacity-10 z-0 pointer-events-none" />

            {/* Header */}
            <SidebarHeader className="relative z-10 pt-8 pr-6 pb-2 border-b border-white/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 justify-end group-data-[collapsible=icon]:justify-center transition-all">
                           <div className="flex flex-col items-end gap-0.5 group-data-[collapsible=icon]:hidden">
                                <span className="font-bold text-sm tracking-[0.2em] font-mono">CONSOLE</span>
                                <span className="text-[9px] text-muted-foreground/60 tracking-widest uppercase">ターミナル</span>
                           </div>
                           <div className="flex aspect-square size-10 items-center justify-center rounded-sm text-foreground bg-foreground/5 ring-1 ring-white/10">
                               <Terminal className="size-4 opacity-70" />
                           </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Tabs (for expanded mode) */}
            <div className="relative z-10 flex items-center gap-1 p-2 px-4 border-b border-white/5 bg-black/20 group-data-[collapsible=icon]:hidden">
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

            {/* Content */}
            <SidebarContent className="relative z-10">
                {/* LOGS TAB */}
                {activeTab === "logs" && (
                    <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
                        <ScrollArea className="h-[calc(100vh-200px)] w-full">
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
                    </SidebarGroup>
                )}

                {/* SYS TAB */}
                {activeTab === "sys" && (
                    <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
                        <ScrollArea className="h-[calc(100vh-200px)] w-full">
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
                    </SidebarGroup>
                )}

                {/* Collapsed Icons */}
                <SidebarGroup className="hidden group-data-[collapsible=icon]:block p-2">
                    <SidebarMenu className="gap-2">
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Logs" onClick={() => setActiveTab("logs")} isActive={activeTab === "logs"}>
                                <FileText className="size-4" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="System" onClick={() => setActiveTab("sys")} isActive={activeTab === "sys"}>
                                <Settings2 className="size-4" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="relative z-10 pb-6 px-4 border-t border-white/5">
                 <div className="flex items-center gap-2 justify-end group-data-[collapsible=icon]:justify-center opacity-30 hover:opacity-100 transition-opacity cursor-default">
                    <span className="text-[9px] font-mono tracking-widest uppercase group-data-[collapsible=icon]:hidden">Terminal Active</span>
                    <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                 </div>
            </SidebarFooter>
        </Sidebar>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) {
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

function MetricCard({ label, value, icon: Icon }: { label: string, value: string, icon: React.ElementType }) {
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
