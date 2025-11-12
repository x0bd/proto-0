"use client";

import { useEffect, useState } from "react";
import Avatar from "./components/Avatar";

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

	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const root = document.documentElement;
		const prefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		return root.classList.contains("dark") || prefersDark;
	});

	const [voiceEnabled, setVoiceEnabled] = useState(false);

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
			<Avatar emotion={currentEmotion} voiceEnabled={voiceEnabled} />

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
					{/* Voice toggle */}
					<button
						onClick={() => setVoiceEnabled((v) => !v)}
						className={`px-3 py-2 rounded-full text-xs font-mono tracking-widest transition-colors border ${
							voiceEnabled
								? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
								: "text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border-transparent hover:border-black/20 dark:hover:border-white/20"
						}`}
					>
						VOICE
					</button>
				</div>
			</div>
		</div>
	);
}
