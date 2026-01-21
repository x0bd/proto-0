"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    IoCloseOutline, 
    IoRemoveOutline, 
    IoExpandOutline, 
    IoTrashOutline, 
    IoArrowUpOutline,
    IoMicOutline,
    IoPlay,
    IoPause
} from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";

interface ConsoleOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    history: { role: string; content: string }[];
    onSendMessage: (message: string) => void;
    onClear: () => void;
}

export function ConsoleOverlay({ isOpen, onClose, history, onSendMessage, onClear }: ConsoleOverlayProps) {
    const [isMinimized, setIsMinimized] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [isRecording, setIsRecording] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [history, isMinimized]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(10px)" }}
                    animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1, 
                        filter: "blur(0px)",
                        height: isMinimized ? "auto" : "620px"
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 32, stiffness: 280, mass: 0.8 }}
                    drag
                    dragMomentum={false}
                    className="fixed top-8 right-8 z-50 w-[420px] bg-background/80 backdrop-blur-3xl rounded-[32px] overflow-hidden flex flex-col shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5"
                >
                    {/* Grain Texture Overlay */}
                    <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none z-[-1]" />

                    {/* Header: Audio Spectrum & Controls */}
                    <div className="flex items-center justify-between px-6 py-5 cursor-grab active:cursor-grabbing select-none relative z-10 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            {/* Organic Voice Spectrum */}
                            <div className="flex items-center gap-0.5 h-6 w-20 opacity-60 mix-blend-overlay">
                                {[...Array(16)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ 
                                            height: [4, Math.random() * 20 + 4, 4],
                                            opacity: [0.3, 0.7, 0.3] 
                                        }}
                                        transition={{ 
                                            duration: 1.5 + Math.random(), 
                                            repeat: Infinity, 
                                            delay: i * 0.05,
                                            ease: "easeInOut" 
                                        }}
                                        className="w-1 bg-foreground rounded-full origin-center"
                                    />
                                ))}
                            </div>
                            
                            <div className="flex flex-col gap-0.5">
                                <span className="text-micro text-foreground/80 tracking-[0.25em]">
                                    Dot
                                </span>
                                <span className="text-[10px] text-emerald-500/80 tracking-wider font-medium flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    ONLINE
                                </span>
                            </div>
                        </div>
                        
                        {/* Refined Window Controls */}
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-all active:scale-95"
                                title={isMinimized ? "Expand" : "Minimize"}
                            >
                                {isMinimized ? <IoExpandOutline className="size-3.5" /> : <IoRemoveOutline className="size-3.5" />}
                            </button>
                            <button 
                                onClick={onClear}
                                className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-all active:scale-95"
                                title="Clear History"
                            >
                                <IoTrashOutline className="size-3.5" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="size-8 rounded-full flex items-center justify-center hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-95"
                                title="Close"
                            >
                                <IoCloseOutline className="size-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <div className="flex-1 w-full flex flex-col min-h-0 relative bg-gradient-to-b from-transparent to-background/20">
                            {/* Chat Area */}
                            <ScrollArea className="flex-1">
                                <div className="px-5 py-4 space-y-5">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[380px] text-muted-foreground/30 gap-8">
                                            <div className="relative size-24 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-foreground/5 rounded-full animate-ping opacity-20 duration-3000" />
                                                <div className="size-24 rounded-full border border-foreground/10 flex items-center justify-center bg-foreground/5 backdrop-blur-sm">
                                                    <IoMicOutline className="size-8 opacity-40" />
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <span className="text-micro block opacity-60">Awaiting Input</span>
                                                <p className="text-xs text-muted-foreground/50 max-w-[200px] leading-relaxed">
                                                    Start a conversation with Dot. Voice mode active.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 relative">
                                            {history.map((msg, idx) => {
                                                // Simulation Logic: 
                                                // Longer responses get "Voice Note" treatment
                                                const isVoiceNote = msg.content.length > 60 || idx === 0;

                                                return (
                                                    <motion.div 
                                                        key={idx} 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                                        className={cn(
                                                            "flex flex-col max-w-[90%]",
                                                            msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                                                        )}
                                                    >
                                                        {isVoiceNote ? (
                                                            // Voice Note Style
                                                            <div className="flex flex-col gap-1.5 group">
                                                                <div className={cn(
                                                                    "flex items-center gap-3 pl-2.5 pr-4 py-2 rounded-[24px] shadow-sm backdrop-blur-md transition-all hover:shadow-md cursor-pointer border",
                                                                    msg.role === 'user' 
                                                                        ? "bg-foreground text-background border-transparent" 
                                                                        : "bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground"
                                                                )}>
                                                                    <button className={cn(
                                                                        "size-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm",
                                                                        msg.role === 'user'
                                                                            ? "bg-white text-black"
                                                                            : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                                                                    )}>
                                                                        <IoPlay className="size-3 ml-0.5" />
                                                                    </button>

                                                                    {/* Static Waveform (Refined) */}
                                                                    <div className="flex items-center gap-[3px] h-5 opacity-80">
                                                                        {[0.3, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7].map((h, i) => (
                                                                            <div
                                                                                key={i}
                                                                                className={cn(
                                                                                    "w-[3px] rounded-full transition-all group-hover:h-full",
                                                                                    msg.role === 'user' ? "bg-background/80" : "bg-foreground/60"
                                                                                )}
                                                                                style={{ height: `${h * 100}%` }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    
                                                                    <span className={cn(
                                                                        "text-[10px] font-mono opacity-50 ml-2 tracking-wide",
                                                                        msg.role === 'user' ? "text-background" : "text-foreground"
                                                                    )}>
                                                                        0:{Math.min(59, Math.floor(msg.content.length / 5)).toString().padStart(2, '0')}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Transcript */}
                                                                <div className="px-3 text-[13px] leading-relaxed text-foreground/80 font-medium tracking-tight">
                                                                    {msg.content}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // Standard Text Bubble (Compact & Premium)
                                                            <div className={cn(
                                                                "px-5 py-2.5 text-[13px] font-medium leading-relaxed shadow-sm backdrop-blur-md border",
                                                                msg.role === 'user' 
                                                                    ? "bg-foreground text-background rounded-[24px] rounded-tr-sm border-transparent" 
                                                                    : "bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground rounded-[24px] rounded-tl-sm"
                                                            )}>
                                                                {msg.content}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div ref={scrollRef} className="h-6" />
                                </div>
                            </ScrollArea>

                            {/* Input Area - Floated & Detached */}
                            <div className="p-6 pt-4 relative z-20">
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (inputValue.trim()) {
                                            onSendMessage(inputValue);
                                            setInputValue("");
                                        }
                                    }}
                                    className="relative group"
                                >
                                    {/* Ambient Glow */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                                    
                                    <div className="relative bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-lg rounded-full px-2 py-1.5 flex items-center gap-2 transition-all hover:bg-white/80 dark:hover:bg-black/60 focus-within:ring-1 focus-within:ring-white/20">
                                        {/* Mic Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsRecording(!isRecording)}
                                            className={cn(
                                                "size-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95",
                                                isRecording 
                                                    ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30" 
                                                    : "bg-transparent text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground"
                                            )}
                                        >
                                            <IoMicOutline className="size-5" />
                                        </button>

                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={isRecording ? "Listening..." : "Message Dot..."}
                                            className="flex-1 bg-transparent border-none outline-none text-[14px] placeholder:text-muted-foreground/50 text-foreground h-10 font-medium px-2 tracking-tight"
                                            autoFocus
                                            disabled={isRecording}
                                        />
                                        
                                        <button 
                                            type="submit"
                                            disabled={!inputValue.trim()}
                                            className="size-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-0 disabled:scale-75 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                                        >
                                            <IoArrowUpOutline className="size-5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
