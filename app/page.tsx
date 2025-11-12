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
		neutral: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
		happy: { joy: 0.9, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.3 },
		sad: { joy: 0, sadness: 0.8, surprise: 0, anger: 0, curiosity: 0 },
		surprised: { joy: 0.2, sadness: 0, surprise: 0.9, anger: 0, curiosity: 0.4 },
		angry: { joy: 0, sadness: 0.1, surprise: 0, anger: 0.8, curiosity: 0 },
		curious: { joy: 0.3, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.9 },
	};

	const handleEmotionChange = (preset: keyof typeof emotionPresets) => {
		setCurrentEmotion(emotionPresets[preset]);
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			{/* Grid Pattern Background */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-40" />
			
			<main className="relative px-6 py-12">
				{/* Header */}
				<div className="max-w-4xl mx-auto text-center mb-16">
					<div className="inline-flex items-center gap-2 mb-6">
						<div className="w-2 h-2 bg-black dark:bg-white rounded-full" />
						<span className="text-sm font-mono text-black/60 dark:text-white/60 tracking-wider">
							PROTO-0
						</span>
					</div>
					<h1 className="text-6xl md:text-7xl font-light text-black dark:text-white mb-4 tracking-tight">
						夢見るアバター
					</h1>
					<p className="text-lg text-black/60 dark:text-white/60 font-mono tracking-wide">
						Interactive emotional avatar / 感情表現システム
					</p>
				</div>

				{/* Avatar Section */}
				<div className="max-w-4xl mx-auto mb-16">
					<Avatar emotion={currentEmotion} />
				</div>

				{/* Control Panel */}
				<div className="max-w-2xl mx-auto space-y-8">
					{/* Emotion Control */}
					<div className="border border-black/10 dark:border-white/10 rounded-lg p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-1 h-1 bg-black dark:bg-white rounded-full" />
							<span className="text-sm font-mono text-black/60 dark:text-white/60 tracking-wider">
								EMOTION_CONTROL
							</span>
						</div>
						
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{Object.entries(emotionPresets).map(([key, _]) => (
								<button
									key={key}
									onClick={() => handleEmotionChange(key as keyof typeof emotionPresets)}
									className="group relative px-4 py-3 border border-black/10 dark:border-white/10 rounded-md bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 text-sm font-mono tracking-wide"
								>
									<span className="relative z-10">
										{key === "neutral" && "中立"}
										{key === "happy" && "嬉しい"}
										{key === "sad" && "悲しい"}
										{key === "surprised" && "驚いた"}
										{key === "angry" && "怒り"}
										{key === "curious" && "好奇心"}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Text Input */}
					<div className="border border-black/10 dark:border-white/10 rounded-lg p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-1 h-1 bg-black dark:bg-white rounded-full" />
							<span className="text-sm font-mono text-black/60 dark:text-white/60 tracking-wider">
								MESSAGE_INPUT
							</span>
						</div>
						
						<textarea
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							placeholder="Enter your message here..."
							className="w-full h-32 px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 rounded-md resize-none text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-200 font-mono text-sm"
							rows={4}
						/>
					</div>

					{/* Action Button */}
					<div className="text-center">
						<button className="group relative px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-md font-mono text-sm tracking-wider hover:bg-black/80 dark:hover:bg-white/80 transition-all duration-200 border border-black dark:border-white">
							<span className="relative z-10">ANALYZE_EMOTION</span>
						</button>
					</div>
				</div>

				{/* Footer */}
				<div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-black/10 dark:border-white/10">
					<div className="flex items-center justify-center gap-4 text-xs font-mono text-black/40 dark:text-white/40 tracking-widest">
						<span>VAPOROUS_SMILEY</span>
						<div className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full" />
						<span>夢の表現</span>
					</div>
				</div>
			</main>
		</div>
	);
}
