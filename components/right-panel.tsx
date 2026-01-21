"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
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
    Terminal,
    Zap
} from "lucide-react";

interface RightPanelProps extends React.ComponentProps<typeof Sidebar> {
    history: { role: string; content: string }[];
}

export function RightPanel({ history, ...props }: RightPanelProps) {
    const [activeTab, setActiveTab] = useState<"logs" | "sys">("logs");

    return (
        <Sidebar side="right" collapsible="icon" className="border-l-0" {...props}>
            {/* Glass Background */}
            <div className="absolute inset-0 bg-card/40 backdrop-blur-xl z-0" />
            <div className="absolute inset-0 bg-grain z-0 pointer-events-none" />

            {/* Header */}
            <SidebarHeader className="relative z-10 pt-10 pr-6 pb-4 border-b border-border/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-4 justify-end group-data-[collapsible=icon]:justify-center transition-all">
                            <div className="flex flex-col items-end gap-1 group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-semibold tracking-[0.15em]">CONSOLE</span>
                                <span className="text-micro text-right">System Logs</span>
                            </div>
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-foreground/5 ring-1 ring-border/40 shadow-premium glow-internal">
                                <Terminal className="size-5 text-foreground/60" />
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Tabs */}
            <div className="relative z-10 flex items-center gap-1.5 p-2 px-3 border-b border-border/40 group-data-[collapsible=icon]:hidden">
                <TabButton 
                    active={activeTab === "logs"} 
                    onClick={() => setActiveTab("logs")}
                    icon={FileText}
                    label="Logs"
                />
                <TabButton 
                    active={activeTab === "sys"} 
                    onClick={() => setActiveTab("sys")}
                    icon={Settings2}
                    label="System"
                />
            </div>

            {/* Content */}
            <SidebarContent className="relative z-10">
                {/* LOGS TAB */}
                {activeTab === "logs" && (
                    <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
                        <ScrollArea className="h-[calc(100vh-220px)] w-full">
                            <div className="p-4 space-y-4">
                                <div className="text-micro mb-4">Session History</div>
                                
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-3">
                                        <Activity className="size-8 opacity-40" />
                                        <span className="text-sm">No activity</span>
                                    </div>
                                ) : (
                                    history.map((msg, idx) => (
                                        <div 
                                            key={idx} 
                                            className="group animate-in fade-in slide-in-from-right-2 duration-300"
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={cn(
                                                    "size-2 rounded-full",
                                                    msg.role === 'user' ? "bg-emerald-500" : 
                                                    msg.role === 'dot' ? "bg-indigo-500" : "bg-amber-500"
                                                )} />
                                                <span className="text-xs font-medium text-foreground/70 capitalize">
                                                    {msg.role}
                                                </span>
                                                <span className="text-micro ml-auto font-mono">
                                                    00:0{idx}
                                                </span>
                                            </div>
                                            <div className="pl-4 border-l-2 border-border/40 text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
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
                        <ScrollArea className="h-[calc(100vh-220px)] w-full">
                            <div className="p-4 space-y-6">
                                {/* Metrics Grid */}
                                <div className="space-y-3">
                                    <div className="text-micro">Performance</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <MetricCard label="FPS" value="60" icon={Zap} accent="emerald" />
                                        <MetricCard label="Memory" value="42MB" icon={Cpu} accent="amber" />
                                        <MetricCard label="Latency" value="12ms" icon={Activity} accent="indigo" />
                                        <MetricCard label="Engine" value="v1.0" icon={Settings2} accent="rose" />
                                    </div>
                                </div>

                                <Separator className="bg-border/40" />

                                {/* Debug Options */}
                                <div className="space-y-3">
                                    <div className="text-micro">Debug</div>
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
                            <SidebarMenuButton 
                                tooltip="Logs" 
                                onClick={() => setActiveTab("logs")} 
                                isActive={activeTab === "logs"}
                                className="rounded-xl"
                            >
                                <FileText className="size-4" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                tooltip="System" 
                                onClick={() => setActiveTab("sys")} 
                                isActive={activeTab === "sys"}
                                className="rounded-xl"
                            >
                                <Settings2 className="size-4" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="relative z-10 pb-8 px-4 border-t border-border/40">
                <div className="flex items-center gap-2 justify-end group-data-[collapsible=icon]:justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <span className="text-micro group-data-[collapsible=icon]:hidden">Active</span>
                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { 
    active: boolean; 
    onClick: () => void; 
    icon: React.ElementType; 
    label: string;
}) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300 text-sm",
                active 
                    ? "bg-foreground/10 text-foreground shadow-zen" 
                    : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className="size-4" />
            <span>{label}</span>
        </button>
    );
}

function MetricCard({ label, value, icon: Icon, accent }: { 
    label: string; 
    value: string; 
    icon: React.ElementType;
    accent: "emerald" | "amber" | "indigo" | "rose";
}) {
    const accentClasses = {
        emerald: "text-emerald-500",
        amber: "text-amber-500",
        indigo: "text-indigo-500",
        rose: "text-rose-500",
    };

    return (
        <div className="bg-foreground/5 rounded-2xl p-4 border border-border/40 flex flex-col gap-2 hover:bg-foreground/10 transition-all duration-300 cursor-default group glow-internal">
            <div className="flex items-center justify-between text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                <span className="text-micro">{label}</span>
                <Icon className={cn("size-4", accentClasses[accent])} />
            </div>
            <div className="text-2xl font-light tracking-tight text-foreground/90">
                {value}
            </div>
        </div>
    );
}

function ToggleRow({ label }: { label: string }) {
    const [enabled, setEnabled] = React.useState(false);
    
    return (
        <button 
            onClick={() => setEnabled(!enabled)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5 transition-all duration-300 group"
        >
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
            </span>
            <div className={cn(
                "size-5 rounded-full border-2 transition-all duration-300",
                enabled 
                    ? "bg-emerald-500 border-emerald-500" 
                    : "border-border/60 group-hover:border-foreground/30"
            )} />
        </button>
    );
}
