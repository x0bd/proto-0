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
        <div className="flex items-center gap-2">
            {/* Direct Toggles */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onVoiceToggle}
                className={cn(
                    "size-9 rounded-full transition-all duration-300",
                    voiceEnabled ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "hover:bg-foreground/5 text-muted-foreground"
                )}
                title={voiceEnabled ? "Voice On" : "Voice Off"}
            >
                {voiceEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="size-9 rounded-full hover:bg-foreground/5 text-muted-foreground transition-all duration-300"
                title="Toggle Theme"
            >
                {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>

            {/* More Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="size-9 rounded-full hover:bg-foreground/5 text-muted-foreground transition-all duration-300"
                    >
                        <Settings className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuItem onClick={onSettingsClick} className="rounded-lg cursor-pointer">
                        <Settings className="mr-2 size-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="rounded-lg opacity-50">
                        <MoreHorizontal className="mr-2 size-4" />
                        <span>Advanced</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
