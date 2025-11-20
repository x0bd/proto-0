"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

interface ChatWindowProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
	const [isMinimized, setIsMinimized] = React.useState(false);
	const [messages, setMessages] = React.useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content: "Voice transcription history active.",
		},
	]);
	const [inputValue, setInputValue] = React.useState("");

	// Auto-scroll to bottom when messages change
	const scrollRef = React.useRef<HTMLDivElement>(null);
	React.useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	return (
		<div className="fixed bottom-32 right-8 z-40 pointer-events-none">
			<AnimatePresence mode="wait">
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							height: isMinimized ? "auto" : 480,
							width: isMinimized ? 280 : 380,
						}}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="pointer-events-auto bg-background/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col"
						drag={!isMinimized}
						dragMomentum={false}
					>
						{/* Header */}
						<div
							className="h-14 px-5 flex items-center justify-between border-b border-border/50 bg-secondary/30 cursor-grab active:cursor-grabbing select-none"
							onPointerDown={(e) => e.preventDefault()}
						>
							<div className="flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
									VOICE HISTORY
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
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
									className="h-7 w-7 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
									onClick={onClose}
								>
									<X className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>

						{/* Content */}
						{!isMinimized && (
							<>
								<ScrollArea className="flex-1 p-5">
									<div className="space-y-3">
										{messages.map((msg) => (
											<div
												key={msg.id}
												className={`flex ${
													msg.role === "user"
														? "justify-end"
														: "justify-start"
												}`}
											>
												<div
													className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
														msg.role === "user"
															? "bg-primary/10 text-foreground rounded-[1.25rem] rounded-tr-sm border border-primary/20"
															: "bg-secondary/50 text-foreground rounded-[1.25rem] rounded-tl-sm border border-border/30 backdrop-blur-sm"
													}`}
												>
													{msg.content}
												</div>
											</div>
										))}
										<div ref={scrollRef} />
									</div>
								</ScrollArea>
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
