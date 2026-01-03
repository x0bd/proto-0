"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { X, Play, Pause, AlignLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// --- Types ---
interface Message {
	id: string;
	role: "user" | "assistant";
	type: "text" | "audio";
	content?: string;
	transcription?: string;
	duration?: string;
}

interface ChatWindowProps {
	isOpen: boolean;
	onClose: () => void;
	isListening: boolean;
}

// --- Components ---

function VoiceWaveform({ isPlaying }: { isPlaying: boolean }) {
    // Soft, organic dots
	const dots = Array.from({ length: 4 });

	return (
		<div className="flex items-center gap-1.5 h-4 select-none">
			{dots.map((_, i) => (
				<motion.div
					key={i}
					className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
                    animate={isPlaying ? {
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                    } : {
                        scale: 1,
                        opacity: 0.5
                    }}
                    transition={isPlaying ? {
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                    } : {}}
				/>
			))}
		</div>
	);
}

function AudioMessage({ duration, transcription }: { duration: string; transcription?: string }) {
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [isExpanded, setIsExpanded] = React.useState(false);

	return (
		<div className="flex flex-col gap-2 min-w-[200px]">
			<div className="flex items-center gap-3">
				<button
					onClick={() => setIsPlaying(!isPlaying)}
					className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors active:scale-95"
				>
					{isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
				</button>
				<div className="flex flex-col flex-1 pl-1">
					<VoiceWaveform isPlaying={isPlaying} />
					<span className="text-[10px] font-medium text-muted-foreground mt-1">
						{duration}
					</span>
				</div>
                {transcription && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                         <AlignLeft className="w-3 h-3" />
                    </button>
                )}
			</div>
            <AnimatePresence>
				{isExpanded && transcription && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
					>
                        <p className="text-xs text-muted-foreground pt-2 pl-1 leading-relaxed">
                            {transcription}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
		</div>
	);
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
	const dragControls = useDragControls();
	const [messages, setMessages] = React.useState<Message[]>([
		{ id: "1", role: "user", type: "text", content: "Good morning." },
		{ id: "2", role: "assistant", type: "audio", duration: "0:04", transcription: "Good morning. The light is beautiful today." },
        { id: "3", role: "user", type: "text", content: "Play something for focus." },
        { id: "4", role: "assistant", type: "text", content: "Playing 'Ambient 1: Music for Airports'." },
	]);

	const scrollRef = React.useRef<HTMLDivElement>(null);
	React.useEffect(() => {
		if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center sm:items-center">
			<AnimatePresence mode="wait">
				{isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/20 backdrop-blur-sm pointer-events-auto"
                            onClick={onClose}
                        />
                        
					<motion.div
						initial={{ opacity: 0, y: 40, scale: 0.95 }}
						animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                        }}
						exit={{ opacity: 0, y: 40, scale: 0.95 }}
						transition={{ 
                            type: "spring", 
                            damping: 24, 
                            stiffness: 300, 
                            mass: 0.8 
                        }}
						className="pointer-events-auto w-full sm:w-[400px] h-[70vh] sm:h-[600px] bg-background/80 backdrop-blur-2xl shadow-zen rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col relative border border-foreground/5 mb-0 sm:mb-8"
						drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.05}
					>
						{/* Header - Minimal Drag Handle */}
						<div 
                            className="h-14 flex items-center justify-between px-6 cursor-grab active:cursor-grabbing touch-none select-none z-10"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <span className="text-sm font-medium opacity-40">Memory</span>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors -mr-2"
                            >
                                <X className="w-4 h-4 opacity-50" />
                            </button>
						</div>

						{/* Content */}
                        <ScrollArea className="flex-1 relative">
                            <div className="px-6 pb-6 space-y-8">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] text-[15px] leading-relaxed ${
                                                msg.role === "user"
                                                    ? "text-foreground font-medium"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {msg.type === "audio" ? (
                                                <AudioMessage duration={msg.duration || "0:00"} transcription={msg.transcription} />
                                            ) : (
                                                <div>{msg.content}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
					</motion.div>
                    </>
				)}
			</AnimatePresence>
		</div>
	);
}
