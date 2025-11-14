"use client";

import { useEffect, useState } from "react";
import Avatar from "./components/Avatar";
import { motion, AnimatePresence } from "motion/react";
import {
	MessageSquare,
	Mic,
	SlidersHorizontal,
	Settings,
	Paperclip,
	ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

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

	// Responsive breakpoint state for md (>=768px)
	const [isMdUp, setIsMdUp] = useState<boolean>(() => {
		if (typeof window === "undefined") return true;
		return window.matchMedia("(min-width: 768px)").matches;
	});
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(min-width: 768px)");
		const onChange = (ev: MediaQueryListEvent) => setIsMdUp(ev.matches);
		// Support older browsers
		if (mq.addEventListener) {
			mq.addEventListener("change", onChange);
		} else {
			// @ts-expect-error - legacy API
			mq.addListener(onChange);
		}
		setIsMdUp(mq.matches);
		return () => {
			if (mq.removeEventListener) {
				mq.removeEventListener("change", onChange);
			} else {
				// @ts-expect-error - legacy API
				mq.removeListener(onChange);
			}
		};
	}, []);

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
				className="absolute top-6 right-6 h-5 w-5 rounded-full border border-black/15 dark:border-white/20 shadow-sm transition-colors z-50"
				style={{ backgroundColor: isDark ? "#ffffff" : "#000000" }}
			/>
			{/* Split layout: face and chat share full width when in text mode */}
			<div className="absolute inset-0 z-0">
				<div className="flex flex-col md:flex-row h-full w-full">
					<motion.div
						className="h-1/2 md:h-full w-full"
						initial={false}
						animate={
							isMdUp
								? {
										width:
											chatMode === "text"
												? "50%"
												: "100%",
								  }
								: undefined
						}
						transition={{
							duration: 0.45,
							ease: [0.2, 0.8, 0.2, 1],
						}}
					>
						<div className="h-full w-full flex items-center justify-center md:scale-100 scale-[0.82]">
							<Avatar
								emotion={currentEmotion}
								voiceEnabled={voiceEnabled}
							/>
						</div>
					</motion.div>
					<AnimatePresence initial={false}>
						{chatMode === "text" ? (
							<motion.div
								key="chat-panel"
								className="h-1/2 md:h-full w-full"
								initial={
									isMdUp
										? { width: 0, opacity: 0 }
										: { opacity: 0 }
								}
								animate={
									isMdUp
										? { width: "50%", opacity: 1 }
										: { opacity: 1 }
								}
								exit={
									isMdUp
										? { width: 0, opacity: 0 }
										: { opacity: 0 }
								}
								transition={{
									duration: 0.45,
									ease: [0.2, 0.8, 0.2, 1],
								}}
							>
								<div className="h-full w-full pl-4 pr-4 pt-12 pb-20 md:pl-6 md:pr-14 md:pt-16 md:pb-24">
									<Card className="relative overflow-hidden h-full w-full bg-white/70 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm rounded-xl flex flex-col">
										<div className="pointer-events-none absolute inset-0 surface-grid opacity-[0.35] dark:opacity-[0.25]" />
										<div className="shine-bar" />
										<div className="px-3 py-2 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
											<div className="flex items-baseline gap-2">
												<span className="cherry-bomb-one-regular text-[13px] tracking-[0.02em] leading-none text-black/80 dark:text-white/80">
													Text Chat
												</span>
												<Badge
													variant="outline"
													className="h-5 text-[10px] px-2 rounded-full font-mono tracking-wide text-black/60 dark:text-white/60"
												>
													BETA
												</Badge>
											</div>
											<div className="flex items-center gap-2">
												<motion.span
													className="h-1.5 w-1.5 rounded-full bg-black/60 dark:bg-white/60"
													animate={{
														opacity: [0.5, 1, 0.5],
													}}
													transition={{
														duration: 1.6,
														repeat: Infinity,
														ease: "easeInOut",
													}}
												/>
												<span className="font-mono text-[10px] tracking-[0.22em] uppercase text-black/55 dark:text-white/55">
													LIVE
												</span>
											</div>
										</div>
										<ScrollArea className="flex-1 px-4 py-4 mask-fade-y">
											<div className="flex items-center justify-center mb-3">
												<span className="font-mono text-[10px] tracking-[0.18em] uppercase text-black/40 dark:text-white/40">
													Kokoro ・ 心
												</span>
											</div>
											<motion.div
												initial="hidden"
												animate="show"
												variants={{
													hidden: { opacity: 1 },
													show: {
														opacity: 1,
														transition: {
															staggerChildren: 0.06,
														},
													},
												}}
												className="space-y-4"
											>
												{/* Assistant message */}
												<motion.div
													variants={{
														hidden: {
															opacity: 0,
															y: 6,
															rotate: -0.3,
														},
														show: {
															opacity: 1,
															y: 0,
															rotate: 0,
															transition: {
																type: "spring",
																stiffness: 420,
																damping: 32,
																mass: 0.6,
															},
														},
													}}
													className="flex items-start gap-3 pr-6"
												>
													<div className="mt-1 h-2 w-2 rounded-full bg-black/40 dark:bg-white/40" />
													<div className="max-w-[75%]">
														<div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3">
															<p className="text-[13px] leading-[1.6] tracking-[0.01em] text-black/80 dark:text-white/80">
																こんにちは。I’m
																Kokoro — a
																minimal,
																expressive
																interface. How
																would you like
																to feel today?
															</p>
														</div>
														<div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40 dark:text-white/40 mt-1">
															just now
														</div>
													</div>
												</motion.div>
												{/* User message */}
												<motion.div
													variants={{
														hidden: {
															opacity: 0,
															y: 6,
															rotate: 0.3,
														},
														show: {
															opacity: 1,
															y: 0,
															rotate: 0,
															transition: {
																type: "spring",
																stiffness: 420,
																damping: 32,
																mass: 0.6,
															},
														},
													}}
													className="flex items-start gap-3 justify-end pl-6"
												>
													<div className="max-w-[75%] text-right">
														<div className="inline-block rounded-2xl bg-black text-white dark:bg-white dark:text-black px-4 py-3 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-none">
															<p className="text-[13px] leading-[1.6] tracking-[0.01em]">
																Show me a joyful
																expression,
																subtle and
																natural.
															</p>
														</div>
														<div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40 dark:text-white/40 mt-1 flex items-center gap-1 justify-end">
															just now
															<motion.span
																animate={{
																	opacity: [
																		0.4, 1,
																		0.4,
																	],
																	scale: [
																		1, 1.08,
																		1,
																	],
																}}
																transition={{
																	duration: 1.8,
																	repeat: Infinity,
																	ease: "easeInOut",
																}}
																className="inline-block h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50"
																title="Read"
															/>
														</div>
													</div>
													<div className="mt-1 h-2 w-2 rounded-full bg-black/40 dark:bg-white/40" />
												</motion.div>
												{/* Day divider */}
												<div className="flex items-center gap-3 opacity-70 px-1">
													<Separator className="flex-1 bg-black/10 dark:bg-white/10" />
													<span className="font-mono text-[10px] tracking-[0.18em] uppercase text-black/40 dark:text-white/40">
														Today ・ 今日
													</span>
													<Separator className="flex-1 bg-black/10 dark:bg-white/10" />
												</div>
												{/* Typing indicator */}
												<motion.div
													variants={{
														hidden: {
															opacity: 0,
															y: 6,
														},
														show: {
															opacity: 1,
															y: 0,
														},
													}}
													className="flex items-center gap-2 pl-5"
												>
													<div className="h-2 w-2 rounded-full bg-black/40 dark:bg-white/40" />
													<div className="rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2">
														<div className="flex items-center gap-1">
															<motion.span
																animate={{
																	opacity: [
																		0.2, 1,
																		0.2,
																	],
																}}
																transition={{
																	duration: 1.2,
																	repeat: Infinity,
																	ease: "easeInOut",
																}}
																className="h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50"
															/>
															<motion.span
																animate={{
																	opacity: [
																		0.2, 1,
																		0.2,
																	],
																}}
																transition={{
																	duration: 1.2,
																	repeat: Infinity,
																	ease: "easeInOut",
																	delay: 0.2,
																}}
																className="h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50"
															/>
															<motion.span
																animate={{
																	opacity: [
																		0.2, 1,
																		0.2,
																	],
																}}
																transition={{
																	duration: 1.2,
																	repeat: Infinity,
																	ease: "easeInOut",
																	delay: 0.4,
																}}
																className="h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50"
															/>
														</div>
													</div>
												</motion.div>
											</motion.div>
										</ScrollArea>
										<form
											className="p-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2"
											onSubmit={(e) => {
												e.preventDefault();
											}}
										>
											<div className="flex-1 relative">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
													<Paperclip className="h-4 w-4" />
												</span>
												<Input
													placeholder="Type a message…"
													className="flex-1 bg-transparent rounded-full font-mono text-[12px] tracking-[0.08em] pl-9 placeholder:text-black/40 dark:placeholder:text-white/40"
												/>
											</div>
											<Button
												type="submit"
												variant="default"
												className="h-9 w-9 rounded-full p-0 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black"
											>
												<ArrowUp className="h-4 w-4" />
											</Button>
										</form>
									</Card>
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			</div>

			{/* Dock: only chat and voice icons */}
			<div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2">
				<div className="flex items-center gap-2 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full px-3 py-2 shadow-sm">
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
			{/* Bottom-left Tweaks trigger (high z-index to avoid overlay issues) */}
			<div className="absolute bottom-6 md:bottom-8 left-6 z-50">
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							className="h-8 w-8 rounded-full p-0 text-black/70 dark:text-white/70"
							aria-label="Open tweaks"
							title="Open tweaks"
						>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="font-mono w-[320px] sm:w-[360px]"
					>
						<SheetHeader>
							<SheetTitle>Tweaks</SheetTitle>
							<SheetDescription>Emotion presets</SheetDescription>
						</SheetHeader>
						<div className="mt-4 grid grid-cols-2 gap-2">
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
								<Button
									key={k}
									variant="outline"
									className="justify-center"
									onClick={() =>
										setCurrentEmotion(presets[k])
									}
								>
									{k.toUpperCase()}
								</Button>
							))}
						</div>
					</SheetContent>
				</Sheet>
			</div>
			{/* Bottom-right Settings button (placeholder) */}
			<div className="absolute bottom-6 md:bottom-8 right-6 z-50">
				<Button
					variant="ghost"
					className="h-8 w-8 rounded-full p-0 text-black/70 dark:text-white/70"
					aria-label="Settings"
					title="Settings"
				>
					<Settings className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
