"use strict";
"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Angry, 
  Search, // Curiosity
  Mic, 
  MicOff, 
  History, 
  Settings, 
  Moon, 
  Sun,
  Plus
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Define preset types locally or import from page.tsx (better to share, but local for now to avoid circular deps if page imports this)
// We'll pass handlers as props
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activePreset?: string;
  onPresetChange?: (preset: string) => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: () => void;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
}

export function AppSidebar({
  activePreset,
  onPresetChange,
  voiceEnabled,
  onVoiceToggle,
  onHistoryClick,
  onSettingsClick,
  ...props
}: AppSidebarProps) {
  const { theme, setTheme } = useTheme();

  const presets = [
    { name: "neutral", icon: Meh, color: "text-zinc-500" },
    { name: "joy", icon: Smile, color: "text-emerald-500" },
    { name: "sad", icon: Frown, color: "text-blue-500" },
    { name: "surprised", icon: Zap, color: "text-yellow-500" },
    { name: "angry", icon: Angry, color: "text-red-500" },
    { name: "curious", icon: Search, color: "text-purple-500" },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl z-0" />
      <div className="absolute inset-0 bg-grain opacity-10 z-0 pointer-events-none" />
      
      <SidebarHeader className="relative z-10 pt-8 pl-6 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-4 transition-all group-data-[collapsible=icon]:justify-center">
               <div className="flex aspect-square size-10 items-center justify-center rounded-sm text-foreground bg-foreground/5 ring-1 ring-white/10 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]">
                 <span className="text-xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-doto)' }}>心</span>
               </div>
               <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                 <span className="font-bold text-sm tracking-[0.3em] font-mono">KOKORO</span>
                 <span className="text-[9px] text-muted-foreground/60 tracking-widest uppercase">Ver. 0.9</span>
               </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="relative z-10 px-4 py-4 gap-6">
        
        {/* EMOTIONS */}
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="text-[9px] tracking-[0.2em] font-mono text-muted-foreground/40 uppercase pl-2 mb-2 group-data-[collapsible=icon]:hidden">
            Emotions / 感情
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {[
                { id: 'neutral', label: 'Neutral', sub: '中立', icon: 'M' },
                { id: 'joy', label: 'Joy', sub: '喜び', icon: 'J' },
                { id: 'sad', label: 'Sadness', sub: '悲しみ', icon: 'S' },
                { id: 'surprised', label: 'Surprise', sub: '驚き', icon: '!' },
                { id: 'angry', label: 'Anger', sub: '怒り', icon: 'A' },
                { id: 'curious', label: 'Curiosity', sub: '好奇心', icon: '?' },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePreset === item.id}
                    onClick={() => onPresetChange?.(item.id)}
                    tooltip={item.label}
                    size="lg"
                    className="h-10 justify-start transition-all group/btn px-3 hover:bg-white/5 data-[active=true]:bg-white/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  >
                     <div className={cn(
                        "font-mono text-xs opacity-50 group-hover/btn:opacity-100 transition-opacity w-4 text-center",
                        activePreset === item.id && "text-foreground opacity-100 font-bold shadow-white/20" 
                     )}>
                        {activePreset === item.id ? "●" : item.icon}
                     </div>

                    <div className="flex flex-col items-start ml-3 group-data-[collapsible=icon]:hidden">
                        <span className={cn(
                            "text-sm font-sans tracking-tight transition-colors leading-none",
                            activePreset === item.id ? "text-foreground font-medium" : "text-muted-foreground group-hover/btn:text-foreground/80"
                        )}>
                            {item.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground/30 font-sans mt-0.5">{item.sub}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SYSTEM */}
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="text-[9px] tracking-[0.2em] font-mono text-muted-foreground/40 uppercase pl-2 mb-2 group-data-[collapsible=icon]:hidden">
            System / システム
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {/* Voice */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={voiceEnabled}
                  onClick={onVoiceToggle}
                  tooltip="Voice Input"
                  size="lg"
                  className="h-10 justify-start transition-all group/btn px-3 hover:bg-white/5 data-[active=true]:bg-white/10 group-data-[collapsible=icon]:justify-center"
                >
                  <div className={cn("size-4 flex items-center justify-center", voiceEnabled ? "text-red-500" : "text-muted-foreground/50")}>
                    {voiceEnabled ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
                  </div>
                  <div className="flex flex-col items-start ml-3 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm text-foreground/80 leading-none">Voice</span>
                      <span className="text-[9px] text-muted-foreground/30 mt-0.5">音声入力</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Theme */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  tooltip="Theme"
                  size="lg"
                  className="h-10 justify-start transition-all group/btn px-3 hover:bg-white/5 group-data-[collapsible=icon]:justify-center"
                >
                  <div className="size-4 flex items-center justify-center text-muted-foreground/50 group-hover/btn:text-foreground">
                    {theme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                  </div>
                   <div className="flex flex-col items-start ml-3 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm text-foreground/80 leading-none">Theme</span>
                      <span className="text-[9px] text-muted-foreground/30 mt-0.5">テーマ</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* DATA */}
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="text-[9px] tracking-[0.2em] font-mono text-muted-foreground/40 uppercase pl-2 mb-2 group-data-[collapsible=icon]:hidden">
            Data / ログ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onHistoryClick} tooltip="Logs" size="lg" className="h-10 justify-start transition-all group/btn px-3 hover:bg-white/5 group-data-[collapsible=icon]:justify-center">
                  <div className="size-4 flex items-center justify-center text-muted-foreground/50 group-hover/btn:text-foreground">
                    <History className="size-3.5" />
                  </div>
                  <div className="flex flex-col items-start ml-3 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm text-foreground/80 leading-none">Logs</span>
                      <span className="text-[9px] text-muted-foreground/30 mt-0.5">履歴</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="relative z-10 pb-6 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsClick} tooltip="Config" size="lg" className="h-9 hover:bg-white/5 group-data-[collapsible=icon]:justify-center group/btn pl-3">
               <Settings className="size-3.5 text-muted-foreground/50 group-hover/btn:text-foreground" />
               <span className="text-[10px] tracking-widest text-muted-foreground uppercase opacity-50 ml-3 group-data-[collapsible=icon]:hidden">Config</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
