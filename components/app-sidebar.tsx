"use strict";
"use client";

import * as React from "react";
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
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Angry, 
  Search,
  Mic, 
  MicOff, 
  Moon, 
  Sun,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

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

  const emotions = [
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-muted-foreground' },
    { id: 'joy', label: 'Joy', icon: Smile, color: 'text-emerald-500' },
    { id: 'sad', label: 'Sadness', icon: Frown, color: 'text-blue-500' },
    { id: 'surprised', label: 'Surprise', icon: Zap, color: 'text-amber-500' },
    { id: 'angry', label: 'Anger', icon: Angry, color: 'text-rose-500' },
    { id: 'curious', label: 'Curiosity', icon: Search, color: 'text-indigo-500' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      {/* Glass Background */}
      <div className="absolute inset-0 bg-card/40 backdrop-blur-xl z-0" />
      <div className="absolute inset-0 bg-grain z-0 pointer-events-none" />
      
      {/* Header */}
      <SidebarHeader className="relative z-10 pt-10 pl-6 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-4 transition-all group-data-[collapsible=icon]:justify-center">
              {/* Logo Mark */}
              <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-foreground/5 ring-1 ring-border/40 shadow-premium glow-internal">
                <span 
                  className="text-2xl font-bold mt-0.5 text-foreground/80" 
                  style={{ fontFamily: 'var(--font-doto)' }}
                >
                  心
                </span>
              </div>
              {/* Wordmark */}
              <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold tracking-[0.15em]">KOKORO</span>
                <span className="text-micro">Version 0.9</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="relative z-10 px-3 py-6 gap-8">
        
        {/* EMOTIONS GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-micro pl-3 mb-3">
            Emotions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {emotions.map((item) => {
                const Icon = item.icon;
                const isActive = activePreset === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onPresetChange?.(item.id)}
                      tooltip={item.label}
                      size="lg"
                      className={cn(
                        "h-11 justify-start px-3 rounded-xl transition-all duration-300",
                        "hover:bg-foreground/5",
                        isActive && "bg-foreground/10 shadow-zen"
                      )}
                    >
                      <Icon className={cn(
                        "size-4 transition-colors",
                        isActive ? item.color : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "ml-3 text-sm transition-colors group-data-[collapsible=icon]:hidden",
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SYSTEM GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-micro pl-3 mb-3">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {/* Voice Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={voiceEnabled}
                  onClick={onVoiceToggle}
                  tooltip="Voice"
                  size="lg"
                  className={cn(
                    "h-11 justify-start px-3 rounded-xl transition-all duration-300",
                    "hover:bg-foreground/5",
                    voiceEnabled && "bg-rose-500/10"
                  )}
                >
                  {voiceEnabled ? (
                    <Mic className="size-4 text-rose-500" />
                  ) : (
                    <MicOff className="size-4 text-muted-foreground" />
                  )}
                  <span className="ml-3 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                    Voice
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Theme Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  tooltip="Theme"
                  size="lg"
                  className="h-11 justify-start px-3 rounded-xl transition-all duration-300 hover:bg-foreground/5"
                >
                  {theme === "dark" ? (
                    <Moon className="size-4 text-indigo-400" />
                  ) : (
                    <Sun className="size-4 text-amber-500" />
                  )}
                  <span className="ml-3 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                    Theme
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="relative z-10 pb-8 px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={onSettingsClick} 
              tooltip="Settings" 
              size="lg" 
              className="h-11 justify-start px-3 rounded-xl hover:bg-foreground/5"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span className="ml-3 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                Settings
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
