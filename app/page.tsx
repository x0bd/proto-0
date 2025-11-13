"use client";

import { useEffect, useState } from "react";
import Avatar from "./components/Avatar";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface EmotionState {
	joy: number;
	sadness: number;
	surprise: number;
	anger: number;
	curiosity: number;
}

export default function Home() {
	type ChatMode = "none" | "text" | "voice";
	const [currentEmotion, setCurrentEmotion] = useState<EmotionState>({
		joy: 0.3,
		sadness: 0,
		surprise: 0,
		anger: 0,
		curiosity: 0.2,
	});

	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const root = document.documentElement;
		const prefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		return root.classList.contains("dark") || prefersDark;
	});

	const [chatMode, setChatMode] = useState<ChatMode>("none");
	const voiceEnabled = chatMode === "voice";

	useEffect(() => {
		// Sync class with state on mount and whenever it changes
		const root = document.documentElement;
		root.classList.toggle("dark", isDark);
	}, [isDark]);

	const toggleTheme = () => {
		const root = document.documentElement;
		const next = !isDark;
		root.classList.toggle("dark", next);
		setIsDark(next);
	};

	const presets: Record<string, EmotionState> = {
		neutral: {
			joy: 0.3,
			sadness: 0,
			surprise: 0,
			anger: 0,
			curiosity: 0.2,
		},
		joy: { joy: 1, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.2 },
		sad: { joy: 0, sadness: 1, surprise: 0, anger: 0, curiosity: 0.1 },
		surprised: {
			joy: 0.2,
			sadness: 0,
			surprise: 1,
			anger: 0,
			curiosity: 0.3,
		},
		angry: { joy: 0, sadness: 0.1, surprise: 0.1, anger: 1, curiosity: 0 },
		curious: {
			joy: 0.2,
			sadness: 0,
			surprise: 0.2,
			anger: 0,
			curiosity: 1,
		},
	};

	const applyPreset = (key: keyof typeof presets) => {
		setCurrentEmotion(presets[key]);
	};

	return (
		<div className="h-screen w-screen bg-white dark:bg-black flex items-center justify-center overflow-hidden relative">
			{/* Top-left label */}
			<div className="absolute top-6 left-6 select-none">
				<span className="text-2xl cherry-bomb-one-regular text-black/70 dark:text-white/70">
					kokoro
				</span>
			</div>

			{/* Top-right theme toggle dot */}
			<button
				onClick={toggleTheme}
				aria-label="Toggle theme"
				className="absolute top-6 right-6 h-5 w-5 rounded-full border border-black/15 dark:border-white/20 shadow-sm transition-colors"
				style={{ backgroundColor: isDark ? "#ffffff" : "#000000" }}
			/>
			<motion.div
				initial={false}
				animate={{
					x: chatMode === "text" ? -180 : 0,
					scale: chatMode === "text" ? 0.98 : 1,
				}}
				transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
			>
				<Avatar emotion={currentEmotion} voiceEnabled={voiceEnabled} />
			</motion.div>

			{/* Right-side Text Chat Panel */}
			<AnimatePresence>
				{chatMode === "text" ? (
					<motion.aside
						key="chat-panel"
						initial={{ opacity: 0, x: 240 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 240 }}
						transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
						className="absolute right-6 top-24"
					>
						<Card className="w-[380px] max-w-[min(90vw,420px)] h-[70vh] bg-white/70 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm rounded-xl flex flex-col">
							<div className="px-4 py-3 border-b border-black/5 dark:border-white/10 text-xs uppercase tracking-widest text-black/60 dark:text-white/60">
								Text Chat
							</div>
							<ScrollArea className="flex-1 px-4 py-3">
								<div className="space-y-3">
									{/* Placeholder messages */}
									<div className="text-xs text-black/50 dark:text-white/50">
										Start a conversation with kokoro.
									</div>
								</div>
							</ScrollArea>
							<form
								className="p-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2"
								onSubmit={(e) => {
									e.preventDefault();
								}}
							>
								<Input
									placeholder="Type a message..."
									className="flex-1 bg-transparent"
								/>
								<Button
									type="submit"
									variant="default"
									className="rounded-full"
								>
									Send
								</Button>
							</form>
						</Card>
					</motion.aside>
				) : null}
			</AnimatePresence>

			{/* Minimal control bar */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
				<div className="flex items-center gap-2 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full px-3 py-2 shadow-sm">
					{(
						[
							"neutral",
							"joy",
							"sad",
							"surprised",
							"angry",
							"curious",
						] as const
					).map((k) => (
						<button
							key={k}
							onClick={() => applyPreset(k)}
							className="px-3 py-2 rounded-full text-xs font-mono tracking-widest text-black dark:text-white border border-transparent hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
						>
							{k.toUpperCase()}
						</button>
					))}
					{/* Mode toggles */}
					<Button
						variant={chatMode === "text" ? "default" : "ghost"}
						className={`h-8 w-8 rounded-full p-0 ${
							chatMode === "text"
								? "bg-black text-white dark:bg-white dark:text-black"
								: "text-black/70 dark:text-white/70"
						}`}
						onClick={() =>
							setChatMode((m) => (m === "text" ? "none" : "text"))
						}
						aria-label="Text chat"
						title="Text chat"
					>
						<MessageSquare className="h-4 w-4" />
					</Button>
					<Button
						variant={chatMode === "voice" ? "default" : "ghost"}
						className={`h-8 w-8 rounded-full p-0 ${
							chatMode === "voice"
								? "bg-black text-white dark:bg-white dark:text-black"
								: "text-black/70 dark:text-white/70"
						}`}
						onClick={() =>
							setChatMode((m) =>
								m === "voice" ? "none" : "voice"
							)
						}
						aria-label="Voice chat"
						title="Voice chat"
					>
						<Mic className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
