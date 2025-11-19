"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageSquare, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export function ChatWindow() {
	const [isOpen, setIsOpen] = React.useState(true);
	const [isMinimized, setIsMinimized] = React.useState(false);
	const [messages, setMessages] = React.useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content: "Hello. I am Kokoro. How are you feeling today?",
		},
	]);
	const [inputValue, setInputValue] = React.useState("");

	const handleSend = () => {
		if (!inputValue.trim()) return;
		const newMsg: Message = {
			id: Date.now().toString(),
			role: "user",
			content: inputValue,
		};
		setMessages((prev) => [...prev, newMsg]);
		setInputValue("");

		// Simulate response
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: "I sense a shift in your emotional state.",
				},
			]);
		}, 1000);
	};

	return (
		<div className="fixed bottom-8 right-8 z-50 pointer-events-none">
			<AnimatePresence mode="wait">
				{isOpen ? (
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
								<span className="text-lg font-medium tracking-widest font-[family-name:var(--font-cherry-bomb-one)]">
									ココロ
								</span>
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
									onClick={() => setIsOpen(false)}
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
									</div>
								</ScrollArea>

								{/* Input */}
								<div className="p-4 border-t border-border/50 bg-secondary/20">
									<form
										onSubmit={(e) => {
											e.preventDefault();
											handleSend();
										}}
										className="flex gap-2"
									>
										<Input
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											placeholder="Message Kokoro..."
											className="bg-background/50 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 rounded-xl h-10 text-foreground placeholder:text-muted-foreground"
										/>
										<Button
											type="submit"
											size="icon"
											className="h-10 w-10 rounded-xl shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
											disabled={!inputValue.trim()}
										>
											<Send className="h-3.5 w-3.5" />
										</Button>
									</form>
								</div>
							</>
						)}
					</motion.div>
				) : (
					<motion.button
						initial={{ scale: 0, rotate: -10 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, rotate: 10 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setIsOpen(true)}
						className="pointer-events-auto h-14 w-14 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center border border-primary/20"
					>
						<MessageSquare className="h-5 w-5" />
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
