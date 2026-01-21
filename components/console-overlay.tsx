"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    IoCloseOutline, 
    IoRemoveOutline, 
    IoExpandOutline, 
    IoTrashOutline, 
    IoArrowUpOutline 
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
                        height: isMinimized ? "auto" : "600px" // Slightly taller, elegant proportion
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 40, stiffness: 300, mass: 0.8 }}
                    drag
                    dragMomentum={false}
                    className="fixed top-8 right-8 z-50 w-[400px] bg-background/60 backdrop-blur-3xl rounded-[32px] overflow-hidden flex flex-col shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5"
                >
                    {/* Header: Pure Minimal */}
                    <div className="flex items-center justify-between px-6 py-5 cursor-grab active:cursor-grabbing select-none">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                            <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                                Dot Connection
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                             <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="size-6 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-colors"
                            >
                                {isMinimized ? <IoExpandOutline className="size-3" /> : <IoRemoveOutline className="size-3" />}
                            </button>
                            <button 
                                onClick={onClear}
                                className="size-6 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-colors"
                            >
                                <IoTrashOutline className="size-3" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="size-6 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-colors"
                            >
                                <IoCloseOutline className="size-3.5" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <div className="flex-1 w-full flex flex-col min-h-0 relative">
                            {/* Chat Area */}
                            <ScrollArea className="flex-1">
                                <div className="px-6 py-2 space-y-6">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/30 gap-6">
                                            <div className="size-16 rounded-full border border-current flex items-center justify-center opacity-20">
                                                <div className="size-2 bg-current rounded-full" />
                                            </div>
                                            <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">
                                                Ready to Listen
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
                                                {/* Role Label (Very Subtle) */}
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40 px-1">
                                                    {msg.role === 'user' ? 'You' : 'Dot'}
                                                </span>

                                                {/* Message Bubble - Apple Style: Minimal, no hard borders, soft fills */}
                                                <div className={cn(
                                                    "px-5 py-3 text-[13px] leading-relaxed shadow-sm backdrop-blur-sm selection:bg-white/20",
                                                    msg.role === 'user' 
                                                        ? "bg-foreground text-background rounded-[20px] rounded-tr-md" 
                                                        : "bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-foreground rounded-[20px] rounded-tl-md"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                    <div ref={scrollRef} className="h-4" />
                                </div>
                            </ScrollArea>

                            {/* Input Area - Floated & Detached */}
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
                                    <div className="relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-full p-1.5 pl-5 flex items-center gap-3 transition-colors hover:bg-white/50 dark:hover:bg-zinc-900/50">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground/50 text-foreground h-9 font-medium"
                                            autoFocus
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
