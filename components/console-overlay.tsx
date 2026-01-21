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
    IoMicOutline 
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
                        height: isMinimized ? "auto" : "600px"
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 40, stiffness: 300, mass: 0.8 }}
                    drag
                    dragMomentum={false}
                    className="fixed top-8 right-8 z-50 w-[400px] bg-background/60 backdrop-blur-3xl rounded-[32px] overflow-hidden flex flex-col shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5"
                >
                    {/* Header: Audio Spectrum & Controls */}
                    <div className="flex items-center justify-between px-6 py-5 cursor-grab active:cursor-grabbing select-none relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Organic Voice Spectrum */}
                            <div className="flex items-center gap-1 h-8 w-24 mask-linear-fade">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ 
                                            height: [6, Math.random() * 24 + 4, 6],
                                            opacity: [0.3, 0.8, 0.3] 
                                        }}
                                        transition={{ 
                                            duration: 0.8 + Math.random() * 0.5, 
                                            repeat: Infinity, 
                                            delay: i * 0.05,
                                            ease: "easeInOut" 
                                        }}
                                        className="w-1 bg-foreground rounded-full origin-center"
                                        style={{ 
                                            backgroundColor: i % 2 === 0 ? 'var(--foreground)' : 'var(--muted-foreground)' 
                                        }}
                                    />
                                ))}
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium tracking-[0.2em] text-foreground uppercase">
                                    Dot
                                </span>
                                <span className="text-[9px] text-muted-foreground tracking-wide font-light">
                                    Online
                                </span>
                            </div>
                        </div>
                        
                        {/* Refined Window Controls */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300">
                             <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="size-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-foreground/10 text-muted-foreground transition-all active:scale-95"
                                title={isMinimized ? "Expand" : "Minimize"}
                            >
                                {isMinimized ? <IoExpandOutline className="size-3.5" /> : <IoRemoveOutline className="size-3.5" />}
                            </button>
                            <button 
                                onClick={onClear}
                                className="size-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-foreground/10 text-muted-foreground transition-all active:scale-95"
                                title="Clear History"
                            >
                                <IoTrashOutline className="size-3.5" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="size-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-95"
                                title="Close"
                            >
                                <IoCloseOutline className="size-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <div className="flex-1 w-full flex flex-col min-h-0 relative">
                            {/* Chat Area */}
                            <ScrollArea className="flex-1">
                                <div className="px-6 py-2 space-y-6">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground/30 gap-6">
                                            <div className="relative size-20 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-foreground/5 rounded-full animate-ping opacity-20 duration-3000" />
                                                <div className="size-20 rounded-full border border-current flex items-center justify-center opacity-20">
                                                    <div className="size-2 bg-current rounded-full" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">
                                                Listening
                                            </span>
                                        </div>
                                    ) : (
                                        history.map((msg, idx) => (
                                            <motion.div 
                                                key={idx} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                className={cn(
                                                    "flex flex-col gap-1.5 max-w-[85%]",
                                                    msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                                                )}
                                            >
                                                {/* Role Label */}
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40 px-1">
                                                    {msg.role === 'user' ? 'You' : 'Dot'}
                                                </span>

                                                {/* Message Bubble - True Voice Note Style */}
                                                <div className={cn(
                                                    "flex flex-col gap-2 p-1.5",
                                                    msg.role === 'user' ? "items-end" : "items-start"
                                                )}>
                                                    
                                                    {/* Voice Player Bubble */}
                                                    <div className={cn(
                                                        "flex items-center gap-3 pl-2 pr-4 py-2 rounded-[24px] shadow-sm backdrop-blur-md transition-all hover:scale-[1.02]",
                                                        msg.role === 'user' 
                                                            ? "bg-foreground text-background" 
                                                            : "bg-white/60 dark:bg-white/10 border border-white/20 text-foreground"
                                                    )}>
                                                        {/* Play Button */}
                                                        <button className={cn(
                                                            "size-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                                            msg.role === 'user'
                                                                ? "bg-white/20 hover:bg-white/30 text-background"
                                                                : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                                                        )}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </button>

                                                        {/* Waveform Visualization */}
                                                        <div className="flex items-center gap-0.5 h-6">
                                                            {[...Array(16)].map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        "w-1 rounded-full",
                                                                        msg.role === 'user' ? "bg-background/80" : "bg-foreground/80"
                                                                    )}
                                                                    style={{
                                                                        height: `${Math.max(20, Math.random() * 100)}%`,
                                                                        opacity: Math.random() * 0.5 + 0.5
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Duration */}
                                                        <span className={cn(
                                                            "text-[10px] font-mono opacity-60 ml-1",
                                                            msg.role === 'user' ? "text-background" : "text-foreground"
                                                        )}>
                                                            0:0{Math.floor(Math.random() * 5) + 1}
                                                        </span>
                                                    </div>

                                                    {/* Transcription */}
                                                    <div className={cn(
                                                        "text-[13px] leading-relaxed max-w-[95%] opacity-90 px-2",
                                                        msg.role === 'user' ? "text-right" : "text-left"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                    <div ref={scrollRef} className="h-4" />
                                </div>
                            </ScrollArea>

                            {/* Input Area - Voice Interface */}
                            <div className="p-6 pt-2">
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
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                    <div className="relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-full p-1.5 pl-2 flex items-center gap-2 transition-colors hover:bg-white/50 dark:hover:bg-zinc-900/50">
                                        {/* Mic Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsRecording(!isRecording)}
                                            className={cn(
                                                "size-9 rounded-full flex items-center justify-center transition-all duration-300",
                                                isRecording 
                                                    ? "bg-rose-500 text-white animate-pulse" 
                                                    : "bg-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                            )}
                                        >
                                            <IoMicOutline className="size-4" />
                                        </button>

                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={isRecording ? "Listening..." : "Message Dot..."}
                                            className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground/50 text-foreground h-9 font-medium px-2"
                                            autoFocus
                                            disabled={isRecording}
                                        />
                                        
                                        <button 
                                            type="submit"
                                            disabled={!inputValue.trim()}
                                            className="size-9 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-0 disabled:scale-75 transition-all duration-300 hover:scale-105 active:scale-95"
                                        >
                                            <IoArrowUpOutline className="size-4" />
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
