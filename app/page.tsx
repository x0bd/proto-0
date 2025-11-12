"use client";

import { useState } from "react";
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

	const [inputText, setInputText] = useState("");

	const emotionPresets = {
		neutral: {
			joy: 0.3,
			sadness: 0,
			surprise: 0,
			anger: 0,
			curiosity: 0.2,
		},
		happy: {
			joy: 0.9,
			sadness: 0,
			surprise: 0.1,
			anger: 0,
			curiosity: 0.3,
		},
		sad: { joy: 0, sadness: 0.8, surprise: 0, anger: 0, curiosity: 0 },
		surprised: {
			joy: 0.2,
			sadness: 0,
			surprise: 0.9,
			anger: 0,
			curiosity: 0.4,
		},
		angry: { joy: 0, sadness: 0.1, surprise: 0, anger: 0.8, curiosity: 0 },
		curious: {
			joy: 0.3,
			sadness: 0,
			surprise: 0.1,
			anger: 0,
			curiosity: 0.9,
		},
	};

	const handleEmotionChange = (preset: keyof typeof emotionPresets) => {
		setCurrentEmotion(emotionPresets[preset]);
	};

  return (
		<div className="h-screen w-screen bg-white dark:bg-black overflow-hidden">
			{/* Grid Pattern Background */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-size-[6rem_4rem] opacity-40" />

			{/* Header Bar - Apple-level Premium */}
			<header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(255,255,255,0.05)]">
				<div className="flex items-center gap-4 group">
					<div className="relative">
						<div className="w-3 h-3 bg-black dark:bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300" />
						<div className="absolute inset-0 w-3 h-3 bg-black dark:bg-white rounded-full animate-ping opacity-20" />
					</div>
					<span className="text-sm font-mono text-black/70 dark:text-white/70 tracking-[0.2em] font-medium">
						PROTO-0
					</span>
				</div>
				<div className="text-right group">
					<h1 className="text-3xl font-light text-black dark:text-white tracking-tight mb-1 font-japanese group-hover:tracking-wide transition-all duration-300">
						夢見るアバター
          </h1>
					<p className="text-xs text-black/60 dark:text-white/60 font-mono tracking-[0.15em] uppercase">
						Emotional Avatar System
          </p>
        </div>
			</header>

			{/* Main Content Grid */}
			<div className="relative h-[calc(100vh-88px)] grid grid-cols-12 gap-8 p-8">
				{/* Left Panel - Apple-level Controls */}
				<div className="col-span-4 space-y-8">
					{/* Emotion Control */}
					<div className="border border-black/5 dark:border-white/5 rounded-2xl p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_48px_rgba(255,255,255,0.08)] transition-all duration-500">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-2 h-2 bg-black dark:bg-white rounded-full shadow-sm" />
							<span className="text-sm font-mono text-black/70 dark:text-white/70 tracking-[0.1em] font-medium">
								EMOTION_CONTROL
							</span>
						</div>

						<div className="grid grid-cols-2 gap-3">
							{Object.keys(emotionPresets).map((key) => (
								<button
									key={key}
									onClick={() =>
										handleEmotionChange(
											key as keyof typeof emotionPresets
										)
									}
									className="group relative px-4 py-3 border border-black/5 dark:border-white/5 rounded-xl bg-white/60 dark:bg-black/60 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 text-sm font-japanese tracking-wide shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
								>
									<span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
										{key === "neutral" && "中立"}
										{key === "happy" && "嬉しい"}
										{key === "sad" && "悲しい"}
										{key === "surprised" && "驚いた"}
										{key === "angry" && "怒り"}
										{key === "curious" && "好奇心"}
									</span>
									{/* Subtle gradient overlay */}
									<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</button>
							))}
						</div>
					</div>

					{/* Text Input - Premium */}
					<div className="border border-black/5 dark:border-white/5 rounded-2xl p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_48px_rgba(255,255,255,0.08)] transition-all duration-500 flex-1">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-2 h-2 bg-black dark:bg-white rounded-full shadow-sm" />
							<span className="text-sm font-mono text-black/70 dark:text-white/70 tracking-[0.1em] font-medium">
								MESSAGE_INPUT
							</span>
						</div>

						<div className="relative">
							<textarea
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder="Tell me how you feel..."
								className="w-full h-44 px-6 py-4 bg-white/60 dark:bg-black/60 border border-black/5 dark:border-white/5 rounded-xl resize-none text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-white/80 dark:focus:bg-black/80 transition-all duration-300 font-mono text-sm leading-relaxed shadow-inner"
								style={{ 
									boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
								}}
							/>
							{/* Character count */}
							<div className="absolute bottom-4 right-4 text-xs font-mono text-black/30 dark:text-white/30 tabular-nums">
								{inputText.length}/500
							</div>
						</div>

						<button className="group relative w-full mt-6 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-mono text-sm tracking-[0.1em] hover:bg-black/90 dark:hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 overflow-hidden">
							<span className="relative z-10 font-medium">ANALYZE_EMOTION</span>
							{/* Subtle shine effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
						</button>
					</div>
				</div>

				{/* Center - Avatar */}
				<div className="col-span-8 flex items-center justify-center">
					<Avatar emotion={currentEmotion} />
				</div>
			</div>

			{/* Footer - Apple-level Refinement */}
			<div className="absolute bottom-0 left-0 right-0 px-8 py-6 border-t border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-xl shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_3px_rgba(255,255,255,0.05)]">
				<div className="flex items-center justify-center gap-6 text-xs font-mono text-black/50 dark:text-white/50 tracking-[0.15em]">
					<span className="font-medium">VAPOROUS_SMILEY</span>
					<div className="flex items-center gap-2">
						<div className="w-1 h-1 bg-black/30 dark:bg-white/30 rounded-full" />
						<div className="w-2 h-2 bg-black/20 dark:bg-white/20 rounded-full" />
						<div className="w-1 h-1 bg-black/30 dark:bg-white/30 rounded-full" />
					</div>
					<span className="font-japanese font-medium">夢の表現</span>
				</div>
        </div>
    </div>
  );
}
