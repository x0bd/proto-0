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
	const [currentEmotion] = useState<EmotionState>({
		joy: 0.3,
		sadness: 0,
		surprise: 0,
		anger: 0,
		curiosity: 0.2,
	});

	return (
		<div className="h-screen w-screen bg-white dark:bg-black flex items-center justify-center overflow-hidden">
			<Avatar emotion={currentEmotion} />
		</div>
	);
}
