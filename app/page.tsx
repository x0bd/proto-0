"use client";

import { useEffect, useState } from "react";
import Avatar from "./components/Avatar";
import { Mic, SlidersHorizontal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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
	const [currentEmotion, setCurrentEmotion] = useState<EmotionState>({
		joy: 0.3,
		sadness: 0,
		surprise: 0,
		anger: 0,
		curiosity: 0.2,
	});

	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const root = document.documentElement;
		const prefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		return root.classList.contains("dark") || prefersDark;
	});

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
		<div className="min-h-dvh w-screen bg-white dark:bg-black flex items-center justify-center overflow-hidden relative">
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
			{/* Centered face */}
			<div className="absolute inset-0 z-0 flex items-center justify-center">
				<Avatar emotion={currentEmotion} voiceEnabled={voiceEnabled} />
			</div>

			{/* Voice toggle */}
			<div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40">
				<Button
					variant="ghost"
					className={`h-12 w-12 rounded-full p-0 flex items-center justify-center border border-black/10 dark:border-white/15 ${
						voiceEnabled
							? "voice-toggle-active"
							: "bg-white/70 dark:bg-black/70 text-black/70 dark:text-white/70"
					}`}
					onClick={() => setVoiceEnabled((v) => !v)}
					aria-label="Toggle voice mode"
					title="Toggle voice mode"
				>
					<Mic className="h-5 w-5" />
				</Button>
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
