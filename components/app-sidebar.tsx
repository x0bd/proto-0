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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-doto)' }}>心</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold font-mono">kokoro</span>
                <span className="truncate text-xs text-muted-foreground">v0.1.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* EMOTIONS GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel>Emotions</SidebarGroupLabel>
          <SidebarGroupAction title="Add Preset">
            <Plus /> <span className="sr-only">Add Preset</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {presets.map((preset) => (
                <SidebarMenuItem key={preset.name}>
                  <SidebarMenuButton
                    isActive={activePreset === preset.name}
                    onClick={() => onPresetChange?.(preset.name)}
                    tooltip={preset.name}
                    className="group-data-[collapsible=icon]:!p-2"
                  >
                    <preset.icon className={cn("size-4", preset.color)} />
                    <span className="capitalize font-mono">{preset.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* CONTROLS GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel>Controls</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Voice Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={voiceEnabled}
                  onClick={onVoiceToggle}
                  tooltip="Toggle Voice"
                >
                  {voiceEnabled ? <Mic className="size-4 text-red-500" /> : <MicOff className="size-4 opacity-50" />}
                  <span className="font-mono">Voice Input</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Theme Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  tooltip="Toggle Theme"
                >
                  {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  <span className="font-mono">Theme</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* MEMORY GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel>Memory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onHistoryClick} tooltip="Conversation History">
                  <History className="size-4" />
                  <span className="font-mono">History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsClick} tooltip="Settings">
              <Settings className="size-4" />
              <span className="font-mono">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
