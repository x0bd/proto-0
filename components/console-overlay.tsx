"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, X, Activity, Minimize2, Maximize2, Trash2, Send } from "lucide-react";
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
					className="fixed top-6 right-6 z-50 w-[360px] bg-background/80 backdrop-blur-xl rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 dark:border-white/5"
				>
					{/* Header: Clean & Minimal */}
					<div className="flex items-center justify-between p-6 pb-2 cursor-grab active:cursor-grabbing">
						<div>
							<h2 className="text-xl font-medium tracking-tight text-foreground">Conversation</h2>
							<p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase opacity-60">
								INTERACTION_LOG
							</p>
						</div>
						<div className="flex items-center gap-2">
							<button 
								onClick={() => setIsMinimized(!isMinimized)}
								className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
							>
								{isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
							</button>
                            <button 
								onClick={onClear}
								className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
                                title="Clear Chat"
							>
								<Trash2 className="size-4" />
							</button>
							<button 
								onClick={onClose}
								className="size-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
							>
								<X className="size-4" />
							</button>
						</div>
					</div>

					{/* Content: Clean */}
					{!isMinimized && (
						<div className="flex-1 w-full flex flex-col min-h-0 bg-transparent">
							<ScrollArea className="flex-1">
								<div className="p-6 space-y-6">
									{history.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 gap-3">
											<div className="size-12 rounded-full bg-foreground/5 flex items-center justify-center">
                                                <Activity className="size-5 opacity-40" />
                                            </div>
											<span className="text-[10px] tracking-widest uppercase opacity-50">No Messages</span>
										</div>
									) : (
										history.map((msg, idx) => (
											<div key={idx} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/40 pl-1">
                                                    {msg.role === 'user' ? 'YOU' : 'KOKORO'}
                                                </span>
												<div className={cn(
                                                    "p-3 rounded-2xl text-sm leading-relaxed max-w-[90%]",
                                                    msg.role === 'user' 
                                                        ? "bg-foreground/5 text-foreground self-end rounded-tr-sm" 
                                                        : "bg-transparent border border-foreground/10 text-muted-foreground self-start rounded-tl-sm"
                                                )}>
													{msg.content}
												</div>
											</div>
										))
									)}
                                    <div ref={scrollRef} />
								</div>
							</ScrollArea>

                            {/* Input Area */}
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
                                <div className="bg-foreground/5 rounded-[1.5rem] p-1.5 flex items-center gap-2 border border-transparent focus-within:border-foreground/10 transition-colors">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm px-4 placeholder:text-muted-foreground/40 text-foreground h-9"
                                        autoFocus
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className="size-9 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-0 disabled:scale-75 transition-all shadow-sm"
                                    >
                                        <Send className="size-4 ml-0.5" />
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
