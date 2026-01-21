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
    IoPause,
	IoTextOutline
} from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";

interface ConsoleOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    history: { role: string; content: string }[];
	isThinking?: boolean;
    onSendMessage: (message: string) => void;
    onClear: () => void;
}

type ChatRole = "user" | "dot" | "system" | "assistant";

function normalizeRole(role: string): ChatRole {
	if (role === "user" || role === "dot" || role === "system" || role === "assistant") return role;
	return "assistant";
}

function ThinkingDots() {
	return (
		<div className="flex items-center gap-1.5 h-4 select-none">
			{Array.from({ length: 3 }).map((_, i) => (
				<motion.div
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					className="size-1.5 rounded-full bg-foreground/60"
					animate={{ y: [0, -4, 0], opacity: [0.35, 0.9, 0.35] }}
					transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
				/>
			))}
		</div>
	);
}

function AudioBars({ isPlaying }: { isPlaying: boolean }) {
	const heights = [0.22, 0.45, 0.78, 0.4, 0.92, 0.58, 0.3, 0.7, 0.5, 0.88, 0.36, 0.62, 0.8, 0.28];
	return (
		<div className="flex items-center gap-[3px] h-5">
			{heights.map((h, i) => (
				<motion.div
					key={i}
					className="w-[3px] rounded-full bg-current/70 origin-bottom"
					style={{ height: `${Math.max(14, h * 100)}%` }}
					animate={
						isPlaying
							? { scaleY: [1, 1.5, 1], opacity: [0.45, 0.9, 0.45] }
							: { scaleY: 1, opacity: 0.55 }
					}
					transition={
						isPlaying
							? { duration: 1.2, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }
							: { duration: 0.2 }
					}
				/>
			))}
		</div>
	);
}

export function ConsoleOverlay({ isOpen, onClose, history, isThinking = false, onSendMessage, onClear }: ConsoleOverlayProps) {
    const [isMinimized, setIsMinimized] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [isRecording, setIsRecording] = React.useState(false);
	const [playingKey, setPlayingKey] = React.useState<string | null>(null);
	const [expandedKey, setExpandedKey] = React.useState<string | null>(null);
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
                    className="group fixed top-8 right-8 z-50 w-[420px] bg-background/80 backdrop-blur-3xl rounded-[32px] overflow-hidden flex flex-col shadow-premium border border-white/10 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5"
                >
                    {/* Grain Texture Overlay */}
                    <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none z-[-1]" />

                    {/* Integrated Header */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <button 
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="size-6 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-all active:scale-95"
                                title={isMinimized ? "Expand" : "Minimize"}
                            >
                                {isMinimized ? <IoExpandOutline className="size-3" /> : <IoRemoveOutline className="size-3" />}
                            </button>
                            <button 
                                onClick={onClear}
                                className="size-6 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground transition-all active:scale-95"
                                title="Clear History"
                            >
                                <IoTrashOutline className="size-3" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="size-6 rounded-full flex items-center justify-center hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-95"
                                title="Close"
                            >
                                <IoCloseOutline className="size-3.5" />
                            </button>
                    </div>

                    {!isMinimized && (
                         <div className="absolute top-5 left-6 z-10 select-none pointer-events-none flex items-center gap-2">
                            <span className="text-[10px] font-mono font-medium tracking-widest text-muted-foreground/60 uppercase">
                                Neural Link
                            </span>
                            <span className="size-1 rounded-full bg-emerald-500/80 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        </div>
                    )}

                    {!isMinimized && (
                        <div className="flex-1 w-full flex flex-col min-h-0 relative bg-gradient-to-b from-transparent to-background/20">
                            {/* Chat Area */}
                            <ScrollArea className="flex-1">
                                <div className="px-5 py-4 space-y-5">
                                    {history.length === 0 ? (
                                        <div className="h-[380px] flex items-center justify-center">
											<span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/40">
												Message Dot
											</span>
										</div>
                                    ) : (
                                        <div className="flex flex-col gap-2 relative">
                                            {history.map((msg, idx) => {
												const role = normalizeRole(msg.role);
												const isUser = role === "user";
												const isDot = role === "dot" || role === "assistant";
												const key = `${idx}-${role}`;
                                                // Longer Dot responses get "Voice Note" treatment (audio + transcript)
                                                const isVoiceNote = isDot && msg.content.length > 80;
												const isPlaying = playingKey === key;
												const isExpanded = expandedKey === key;
												const duration = `0:${Math.min(59, Math.floor(msg.content.length / 6)).toString().padStart(2, "0")}`;

                                                return (
                                                    <motion.div 
                                                        key={idx} 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                                        className={cn(
                                                            "flex flex-col max-w-[92%]",
															isUser ? "self-end items-end" : "self-start items-start"
                                                        )}
                                                    >
														{isVoiceNote ? (
                                                            // Voice Note Style
                                                            <div className="flex flex-col gap-1.5 group">
                                                                <div className={cn(
                                                                    "flex items-center gap-3 pl-2.5 pr-3 py-2 rounded-[24px] shadow-zen backdrop-blur-md transition-all cursor-pointer border",
                                                                    "bg-card/50 dark:bg-white/5 border-white/10 text-foreground"
                                                                )}>
                                                                    <button
																		type="button"
																		onClick={() => setPlayingKey((prev) => (prev === key ? null : key))}
																		className="size-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 bg-foreground/10 hover:bg-foreground/15 text-foreground"
																	>
																		{isPlaying ? <IoPause className="size-3.5" /> : <IoPlay className="size-3 ml-0.5" />}
                                                                    </button>

                                                                    {/* Audio Bars */}
																	<div className="text-foreground/80">
																		<AudioBars isPlaying={isPlaying} />
																	</div>
                                                                    
                                                                    <span className="text-[10px] font-mono opacity-45 ml-1 tracking-wide tabular-nums">
                                                                        {duration}
                                                                    </span>

																	<button
																		type="button"
																		onClick={() => setExpandedKey((prev) => (prev === key ? null : key))}
																		className="ml-1 size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
																		title={isExpanded ? "Hide transcript" : "Show transcript"}
																	>
																		<IoTextOutline className="size-4" />
																	</button>
                                                                </div>
                                                                
                                                                {/* Transcript (expand/collapse) */}
																<AnimatePresence initial={false}>
																	{isExpanded && (
																		<motion.div
																			initial={{ height: 0, opacity: 0 }}
																			animate={{ height: "auto", opacity: 1 }}
																			exit={{ height: 0, opacity: 0 }}
																			transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
																			className="overflow-hidden"
																		>
																			<div className="px-3 text-[13px] leading-relaxed text-foreground/75 font-medium tracking-tight">
																				{msg.content}
																			</div>
																		</motion.div>
																	)}
																</AnimatePresence>
                                                            </div>
                                                        ) : (
                                                            // Standard Text Bubble (Compact & Premium)
															<div className="flex flex-col gap-1">
																<div className={cn(
																	"px-5 py-3 text-[13px] font-medium leading-relaxed shadow-zen backdrop-blur-md border",
																	isUser
																		? "bg-foreground text-background rounded-[24px] rounded-tr-sm border-transparent"
																		: "bg-card/50 dark:bg-white/5 border-white/10 text-foreground rounded-[24px] rounded-tl-sm"
																)}>
																	{msg.content}
																</div>
															</div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
											{isThinking && (
												<motion.div
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													className="self-start items-start flex flex-col max-w-[92%]"
												>
													<div className="px-1">
														<span className="text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground/60">
															DOT
														</span>
													</div>
													<div className="px-5 py-3 rounded-[24px] rounded-tl-sm bg-card/50 dark:bg-white/5 border border-white/10 shadow-zen backdrop-blur-md">
														<ThinkingDots />
													</div>
												</motion.div>
											)}
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
                                        const trimmed = inputValue.trim();
                                        if (trimmed) {
                                            onSendMessage(trimmed);
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
                                            disabled={isRecording || isThinking}
                                        />
                                        
                                        <button 
                                            type="submit"
                                            disabled={!inputValue.trim() || isThinking}
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
