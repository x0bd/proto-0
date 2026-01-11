"use client";

import * as React from "react";
import { 
    Mic, 
    MicOff, 
    Moon, 
    Sun,
    Settings,
    MoreHorizontal
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SystemMenuProps {
    voiceEnabled: boolean;
    onVoiceToggle: () => void;
    onSettingsClick: () => void;
}

export function SystemMenu({ voiceEnabled, onVoiceToggle, onSettingsClick }: SystemMenuProps) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-3">
            {/* Matte Background Pill for Toggles */}
            <div className="glass-card rounded-full p-1.5 flex items-center gap-1 shadow-premium">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onVoiceToggle}
                    className={cn(
                        "size-9 rounded-full transition-all duration-300 click-tactic",
                        voiceEnabled ? "bg-foreground/5 text-foreground shadow-zen" : "text-muted-foreground hover:bg-foreground/5"
                    )}
                    title={voiceEnabled ? "Voice On" : "Voice Off"}
                >
                    {voiceEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                </Button>

                <div className="w-px h-4 bg-foreground/10 mx-0.5" />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="size-9 rounded-full hover:bg-foreground/5 text-muted-foreground transition-all duration-300 click-tactic"
                    title="Toggle Theme"
                >
                    {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </Button>
            </div>

            {/* Separate Settings Button (Floating) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="size-12 rounded-full glass-card hover:bg-card/80 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-premium click-tactic"
                    >
                        <Settings className="size-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card rounded-[1.5rem] p-2 animate-in fade-in zoom-in-95 duration-200 border-0 shadow-premium">
                    <DropdownMenuItem onClick={onSettingsClick} className="rounded-xl cursor-pointer p-3 hover:bg-foreground/5 focus:bg-foreground/5 focus:text-foreground">
                        <Settings className="mr-3 size-4 opacity-50" />
                        <span className="font-mono text-xs tracking-wide">SETTINGS</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="rounded-xl opacity-30 p-3">
                        <MoreHorizontal className="mr-3 size-4 opacity-50" />
                        <span className="font-mono text-xs tracking-wide">ADVANCED</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
