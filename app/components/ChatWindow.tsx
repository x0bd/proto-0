"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minimize2, Maximize2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Types ---

interface Message {
	id: string;
	role: "user" | "assistant";
	type: "text" | "audio";
	content?: string;
	duration?: string; // e.g. "0:12"
}

interface ChatWindowProps {
	isOpen: boolean;
	onClose: () => void;
}

// --- Components ---

function VoiceWaveform({ isPlaying }: { isPlaying: boolean }) {
	// Generate a static-looking waveform that animates when playing
	// 24 bars to look like a dense voice note
	const bars = Array.from({ length: 24 });

	return (
		<div className="flex items-center gap-[2px] h-6 select-none">
			{bars.map((_, i) => {
				// Create a "natural" looking waveform pattern
				// Higher in the middle, lower at edges
				const center = 12;
				const dist = Math.abs(i - center);
				const baseHeight = Math.max(4, 24 - dist * 1.8);
				// Add some randomness so it's not perfectly symmetrical
				const randomOffset = Math.sin(i * 0.8) * 4;
				const height = Math.max(4, baseHeight + randomOffset);

				return (
					<motion.div
						key={i}
						className="w-[3px] bg-current rounded-full opacity-80"
						initial={{ height }}
						animate={
							isPlaying
								? {
										height: [
											height,
											height * 0.6,
											height * 1.2,
											height,
										],
								  }
								: { height }
						}
						transition={{
							duration: 0.4,
							repeat: Infinity,
							repeatType: "reverse",
							delay: i * 0.05, // Stagger effect
							ease: "easeInOut",
						}}
					/>
				);
			})}
		</div>
	);
}

function AudioMessage({ duration }: { duration: string }) {
	const [isPlaying, setIsPlaying] = React.useState(false);

	return (
		<div className="flex items-center gap-3 min-w-[180px]">
			<button
				onClick={() => setIsPlaying(!isPlaying)}
				className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
			>
				{isPlaying ? (
					<Pause className="w-3.5 h-3.5 fill-current" />
				) : (
					<Play className="w-3.5 h-3.5 fill-current ml-0.5" />
				)}
			</button>
			<div className="flex flex-col gap-1">
				<VoiceWaveform isPlaying={isPlaying} />
				<span className="text-[10px] font-mono opacity-60 tracking-wider">
					{duration}
				</span>
			</div>
		</div>
	);
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
	const [isMinimized, setIsMinimized] = React.useState(false);
	const [messages, setMessages] = React.useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			type: "audio",
			duration: "0:04",
		},
		{
			id: "2",
			role: "assistant",
			type: "text",
			content: "Voice transcription active. System normal.",
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
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							height: isMinimized ? "auto" : "min(480px, 60vh)",
							width: isMinimized ? 280 : "min(380px, 90vw)",
						}}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{
							type: "spring",
							damping: 30,
							stiffness: 400,
							mass: 0.8,
						}}
						className="pointer-events-auto bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[1.5rem] overflow-hidden flex flex-col relative"
						drag={!isMinimized}
						dragMomentum={false}
					>
						{/* Lumon / Fukasawa Texture & Grid */}
						<div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
						<div className="absolute inset-0 pointer-events-none surface-grid opacity-30" />
						<div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

						{/* Header: Minimalist & Functional */}
						<div
							className="h-12 px-4 flex items-center justify-between bg-secondary/10 border-b border-border/40 cursor-grab active:cursor-grabbing select-none backdrop-blur-md z-10"
							onPointerDown={(e) => e.preventDefault()}
						>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 rounded-sm bg-primary/80 shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-pulse" />
								<span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/80 font-medium">
									Transcript // 001
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 rounded-md hover:bg-secondary/20 text-muted-foreground/70 hover:text-foreground transition-colors"
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
									className="h-6 w-6 rounded-md hover:bg-red-500/10 text-muted-foreground/70 hover:text-red-400 transition-colors"
									onClick={onClose}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						</div>

						{/* Content */}
						{!isMinimized && (
							<>
								<ScrollArea className="flex-1 px-4 py-6 relative z-10">
									<div className="space-y-6">
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
													className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm relative overflow-hidden group ${
														msg.role === "user"
															? "bg-primary text-primary-foreground rounded-[1.25rem] rounded-tr-sm"
															: "bg-white/60 dark:bg-white/5 text-foreground rounded-[1.25rem] rounded-tl-sm border border-black/5 dark:border-white/10 backdrop-blur-md"
													}`}
												>
													{/* Subtle inner highlight for "plastic" feel */}
													<div className="absolute inset-0 rounded-[inherit] border border-white/20 pointer-events-none" />

													{msg.type === "audio" ? (
														<AudioMessage
															duration={
																msg.duration ||
																"0:00"
															}
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

								{/* Footer / Input Area Hint */}
								<div className="p-3 border-t border-border/30 bg-background/30 backdrop-blur-md">
									<div className="h-10 rounded-xl bg-secondary/30 border border-border/30 flex items-center px-3 gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-text">
										<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
										<span className="text-xs text-muted-foreground font-mono tracking-wide">
											Awaiting input...
										</span>
									</div>
								</div>
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
