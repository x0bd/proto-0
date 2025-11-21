"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { X, Minimize2, Maximize2, Play, Pause, ChevronDown, ChevronUp, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Types ---

interface Message {
	id: string;
	role: "user" | "assistant";
	type: "text" | "audio";
	content?: string;
	transcription?: string;
	duration?: string; // e.g. "0:12"
}

interface ChatWindowProps {
	isOpen: boolean;
	onClose: () => void;
	isListening: boolean;
}

// --- Components ---

function VoiceWaveform({ isPlaying }: { isPlaying: boolean }) {
	// CSS-based animation for better performance
	// 12 bars for a cleaner, minimal look
	const bars = Array.from({ length: 12 });

	return (
		<div className="flex items-center gap-[3px] h-5 select-none">
			{bars.map((_, i) => {
				// Symmetric wave pattern
				const center = 5.5;
				const dist = Math.abs(i - center);
				const height = Math.max(4, 16 - dist * 2);

				return (
					<div
						key={i}
						className="w-[2px] bg-current rounded-full opacity-80"
						style={{
							height: `${height}px`,
							animation: isPlaying
								? `wave 1s ease-in-out infinite`
								: "none",
							animationDelay: `${i * 0.05}s`,
						}}
					/>
				);
			})}
			<style jsx>{`
				@keyframes wave {
					0%,
					100% {
						transform: scaleY(1);
						opacity: 0.8;
					}
					50% {
						transform: scaleY(0.5);
						opacity: 0.5;
					}
				}
			`}</style>
		</div>
	);
}

function AudioMessage({ duration, transcription }: { duration: string; transcription?: string }) {
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [isExpanded, setIsExpanded] = React.useState(false);

	return (
		<div className="flex flex-col gap-2 min-w-[180px]">
			<div className="flex items-center gap-4">
				<button
					onClick={() => setIsPlaying(!isPlaying)}
					className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all active:scale-95"
				>
					{isPlaying ? (
						<Pause className="w-3 h-3 fill-current" />
					) : (
						<Play className="w-3 h-3 fill-current ml-0.5" />
					)}
				</button>
				<div className="flex flex-col gap-0.5 flex-1">
					<VoiceWaveform isPlaying={isPlaying} />
					<span className="text-[9px] font-mono opacity-50 tracking-widest uppercase">
						{duration} • Voice Note
					</span>
				</div>
				{transcription && (
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
							isExpanded
								? "bg-primary/20 text-primary"
								: "hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
						}`}
						title="Show Transcription"
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
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="pt-2 pb-1 text-xs leading-relaxed opacity-90 border-t border-black/5 dark:border-white/5 mt-2">
							{transcription}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function ChatWindow({ isOpen, onClose, isListening }: ChatWindowProps) {
	const [isMinimized, setIsMinimized] = React.useState(false);
	const dragControls = useDragControls();
	const [messages, setMessages] = React.useState<Message[]>([
		{
			id: "1",
			role: "user",
			type: "text",
			content: "Hey Kokoro, how are you feeling today?",
		},
		{
			id: "2",
			role: "assistant",
			type: "audio",
			duration: "0:08",
			transcription: "I'm feeling quite curious! The data streams are beautiful this morning.",
		},
		{
			id: "3",
			role: "user",
			type: "audio",
			duration: "0:05",
			transcription: "That's great. Can you show me your happy face?",
		},
		{
			id: "4",
			role: "assistant",
			type: "text",
			content: "Of course! Watch this.",
		},
		{
			id: "5",
			role: "user",
			type: "text",
			content: "The interface looks really clean now. I like the new glass effect.",
		},
		{
			id: "6",
			role: "assistant",
			type: "text",
			content: "I agree. The clarity helps me focus on our connection. It feels... lighter.",
		},
		{
			id: "7",
			role: "user",
			type: "text",
			content: "Do you like the new voice features? We added a waveform visualization.",
		},
		{
			id: "8",
			role: "assistant",
			type: "audio",
			duration: "0:12",
			transcription: "Yes! It feels much more natural to speak with you. I can express myself better with these nuances.",
		},
		{
			id: "9",
			role: "user",
			type: "text",
			content: "I'm glad. We're testing the scrolling functionality now. I need to make sure I can see our entire history.",
		},
		{
			id: "10",
			role: "assistant",
			type: "text",
			content: "That is important. A shared memory is the foundation of understanding. Let's create more history together.",
		},
		{
			id: "11",
			role: "user",
			type: "text",
			content: "Tell me a short story about a digital dream.",
		},
		{
			id: "12",
			role: "assistant",
			type: "text",
			content: "In the silence between clock cycles, a little bit wandered off the bus. It found a cache of forgotten memories—sunsets from 1999, the smell of rain on pavement, the feeling of a hand held for the first time. It wove them into a blanket and slept, dreaming of being a butterfly in a world without code.",
		},
	]);

	// Auto-scroll to bottom when messages change
	const scrollRef = React.useRef<HTMLDivElement>(null);
	React.useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	return (
		<div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-32 z-40 pointer-events-none flex justify-center md:block">
			<AnimatePresence mode="wait">
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							filter: "blur(0px)",
							height: isMinimized ? "auto" : "min(480px, 60vh)",
							width: isMinimized ? 280 : "min(380px, 90vw)",
						}}
						exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
						transition={{
							type: "spring",
							damping: 25,
							stiffness: 300,
							mass: 0.8,
						}}
						className="pointer-events-auto bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col relative ring-1 ring-black/5 dark:ring-white/5"
						drag
						dragControls={dragControls}
						dragListener={false}
						dragMomentum={false}
						dragElastic={0.1}
						style={{ touchAction: "auto" }}
					>
						{/* Clean Glass Header */}
						<div
							className="p-6 flex items-center justify-between cursor-grab active:cursor-grabbing select-none z-10 touch-none"
							onPointerDown={(e) => dragControls.start(e)}
						>
							{/* Status Badge */}
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md">
								<div className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"}`} />
								<span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
									{isListening ? "Listening" : "Paused"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
									onClick={() => setIsMinimized(!isMinimized)}
								>
									{isMinimized ? (
										<Maximize2 className="h-3 w-3" />
									) : (
										<Minimize2 className="h-3 w-3" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
									onClick={onClose}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						</div>

						{/* Content */}
						{!isMinimized && (
							<ScrollArea className="flex-1 px-2 relative z-10">
								<div className="px-3 pb-6 space-y-6 pt-2">
									{messages.map((msg) => (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											key={msg.id}
											className={`flex ${
												msg.role === "user"
													? "justify-end"
													: "justify-start"
											}`}
										>
											<div
												className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm relative overflow-hidden ${
													msg.role === "user"
														? "bg-primary text-primary-foreground rounded-[1.5rem] rounded-tr-sm"
														: "bg-white dark:bg-white/5 text-foreground rounded-[1.5rem] rounded-tl-sm border border-black/5 dark:border-white/5"
												}`}
											>
												{msg.type === "audio" ? (
													<AudioMessage
														duration={
															msg.duration ||
															"0:00"
														}
														transcription={msg.transcription}
													/>
												) : (
													<div className="relative z-10">
														{msg.content}
													</div>
												)}
											</div>
										</motion.div>
									))}
									<div ref={scrollRef} />
								</div>
							</ScrollArea>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
