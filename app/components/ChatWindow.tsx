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
							height: isMinimized ? "auto" : 500,
							width: isMinimized ? 300 : 380,
						}}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="pointer-events-auto bg-background/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
						drag={!isMinimized} // Only drag when not minimized to avoid weird layout issues, or allow both.
						dragMomentum={false}
						// Use dragConstraints to keep it on screen if needed, but for now free floating is fine or constrained to window
					>
						{/* Header */}
						<div
							className="h-14 px-6 flex items-center justify-between border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing select-none"
							onPointerDown={(e) => e.preventDefault()} // Prevent text selection during drag
						>
							<div className="flex items-center gap-3">
								<div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
								<span className="font-medium tracking-wide text-sm opacity-80">
									CHAT // 对話
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full hover:bg-white/10"
									onClick={() => setIsMinimized(!isMinimized)}
								>
									{isMinimized ? (
										<Maximize2 className="h-3.5 w-3.5" />
									) : (
										<Minimize2 className="h-3.5 w-3.5" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-400"
									onClick={() => setIsOpen(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Content */}
						{!isMinimized && (
							<>
								<ScrollArea className="flex-1 p-6">
									<div className="space-y-4">
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
													className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
														msg.role === "user"
															? "bg-primary text-primary-foreground rounded-tr-sm"
															: "bg-secondary/50 text-secondary-foreground rounded-tl-sm backdrop-blur-sm"
													}`}
												>
													{msg.content}
												</div>
											</div>
										))}
									</div>
								</ScrollArea>

								{/* Input */}
								<div className="p-4 border-t border-white/10 bg-white/5">
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
											placeholder="Type a message..."
											className="bg-black/5 border-white/10 focus-visible:ring-primary/20 rounded-xl h-11"
										/>
										<Button
											type="submit"
											size="icon"
											className="h-11 w-11 rounded-xl shrink-0"
											disabled={!inputValue.trim()}
										>
											<Send className="h-4 w-4" />
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
						className="pointer-events-auto h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
					>
						<MessageSquare className="h-6 w-6" />
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
