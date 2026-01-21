"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
// Lucide icons replaced by React Icons
import { 
    IoTerminalOutline, 
    IoCloseOutline, 
    IoPulseOutline, 
    IoRemoveOutline, 
    IoExpandOutline, 
    IoTrashOutline, 
    IoSendOutline 
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
					initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
					animate={{ 
						opacity: 1, 
						x: 0, 
						filter: "blur(0px)",
						height: isMinimized ? "auto" : "500px"
					}}
					exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
					transition={{ type: "spring", damping: 30, stiffness: 350 }}
					drag
					dragMomentum={false}
					className="fixed top-6 right-6 z-50 w-[360px] bg-background/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 dark:border-white/5"
				>
					{/* Header: Voice Visualizer */}
					<div className="flex items-center justify-between p-6 pb-4 cursor-grab active:cursor-grabbing border-b border-white/5">
						<div className="flex items-center gap-4">
                            {/* Animated Spectrum */}
                            <div className="flex items-center gap-0.5 h-6">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ 
                                            height: [4, Math.random() * 16 + 8, 4],
                                            opacity: [0.5, 1, 0.5] 
                                        }}
                                        transition={{ 
                                            duration: 1.2, 
                                            repeat: Infinity, 
                                            delay: i * 0.1,
                                            ease: "easeInOut" 
                                        }}
                                        className="w-1 bg-foreground/80 rounded-full"
                                    />
                                ))}
                            </div>
							<div>
								<h2 className="text-sm font-medium tracking-tight text-foreground">Dot</h2>
								<p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Listening
                                </p>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<button 
								onClick={() => setIsMinimized(!isMinimized)}
								className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
							>
								{isMinimized ? <IoExpandOutline className="size-3" /> : <IoRemoveOutline className="size-3" />}
							</button>
                            <button 
								onClick={onClear}
								className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
                                title="Clear Chat"
							>
								<IoTrashOutline className="size-3" />
							</button>
							<button 
								onClick={onClose}
								className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
							>
								<IoCloseOutline className="size-3" />
							</button>
						</div>
					</div>

					{/* Content: Voice Note Style */}
					{!isMinimized && (
						<div className="flex-1 w-full flex flex-col min-h-0 bg-transparent relative">
							<ScrollArea className="flex-1">
								<div className="p-4 space-y-4">
									{history.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 gap-4">
                                            <div className="flex items-center gap-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                        className="size-2 rounded-full bg-current"
                                                    />
                                                ))}
                                            </div>
											<span className="text-[10px] tracking-widest uppercase opacity-50">Say Something</span>
										</div>
									) : (
										history.map((msg, idx) => (
											<motion.div 
                                                key={idx} 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={cn(
                                                    "flex flex-col max-w-[85%]",
                                                    msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                                                )}
                                            >
												<div className={cn(
                                                    "px-4 py-2.5 text-sm shadow-sm",
                                                    msg.role === 'user' 
                                                        ? "bg-foreground text-background rounded-[1.2rem] rounded-tr-sm" 
                                                        : "bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-foreground rounded-[1.2rem] rounded-tl-sm"
                                                )}>
													{msg.content}
												</div>
                                                <span className="text-[9px] text-muted-foreground/40 mt-1 px-2">
                                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
											</motion.div>
										))
									)}
                                    <div ref={scrollRef} />
								</div>
							</ScrollArea>

                            {/* Input Area: Minimal Pill */}
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (inputValue.trim()) {
                                        onSendMessage(inputValue);
                                        setInputValue("");
                                    }
                                }}
                                className="p-4 pt-2"
                            >
                                <div className="bg-white dark:bg-zinc-900 shadow-lg border border-black/5 dark:border-white/5 rounded-full p-1 pl-4 flex items-center gap-2 transition-all hover:border-black/10 dark:hover:border-white/10 focus-within:ring-1 ring-emerald-500/20">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/40 text-foreground h-10"
                                        autoFocus
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className="size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
                                    >
                                        <IoSendOutline className="size-4 ml-0.5" />
                                    </button>
                                </div>
                            </form>
						</div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
