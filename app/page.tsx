"use client";

import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import { EmotionState } from "./components/face/types";
import Link from "next/link";

const NEUTRAL_EMOTION: EmotionState = {
	joy: 0.3,
	sadness: 0,
	surprise: 0,
	anger: 0,
	curiosity: 0.2,
};

export default function LandingPage() {
	const [emotion, setEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (typeof window === "undefined") return;
		const { innerWidth, innerHeight } = window;

		const nx = (e.clientX - innerWidth / 2) / (innerWidth / 2);
		const ny = (e.clientY - innerHeight / 2) / (innerHeight / 2);

		setEmotion({
			joy: Math.max(0, -ny),
			sadness: Math.max(0, ny),
			surprise: Math.max(0, -ny) * 0.5,
			anger: Math.max(0, nx),
			curiosity: Math.max(0, -nx),
		});
	};

	const handleMouseLeave = () => {
		setEmotion(NEUTRAL_EMOTION);
	};

	if (!mounted) return null;

	return (
		<div
			className="dark flex flex-col items-center justify-center w-screen h-screen bg-background text-foreground font-sans overflow-hidden bg-washi"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{/* Card Container simulating a terminal/app window, using TE module style */}
			<div className="te-module w-[90vw] max-w-[900px] aspect-[16/10] sm:aspect-[21/10] mb-8 sm:mb-12 shadow-2xl">
				{/* Header */}
				<div className="te-module-header px-4 py-3 h-12 flex items-center justify-between">
					<div className="flex items-center gap-4">
						{/* macOS window controls */}
						<div className="flex gap-2">
							<div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
							<div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
							<div className="w-3 h-3 rounded-full bg-[#27c93f]" />
						</div>
					</div>

					{/* Title */}
					<div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
						<span className="text-sm">👻</span>
						<span className="font-mono text-[11px] font-bold tracking-widest text-foreground/70 uppercase">
							DOT_AVATAR
						</span>
					</div>

					{/* TE Grip pattern */}
					<div className="w-16 h-2 te-grip opacity-50 hidden sm:block" />
				</div>

				{/* Avatar Display Area */}
				<div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#000000] w-full h-full">
					<div className="w-[70%] max-w-[450px] aspect-square relative z-10 flex items-center justify-center">
						<Avatar
							emotion={emotion}
							variant="tron"
							accentColor="#0a84ff"
						/>
					</div>
				</div>
			</div>

			{/* Bottom Content */}
			<div className="flex flex-col items-center max-w-[750px] text-center px-6 gap-8 z-10">
				<p className="text-foreground/70 text-[15px] sm:text-[17px] leading-relaxed font-medium">
					DOT is an expressive, real-time AI companion that uses procedural geometry to express emotions. Built with platform-native UI and sub-frame precision.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/companion"
						className="px-8 py-3 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] hover:bg-[var(--key-bg)] text-foreground text-sm font-medium transition-all shadow-sm"
					>
						Launch App
					</Link>
					<a
						href="https://github.com/x0bd/proto-0"
						target="_blank"
						rel="noreferrer"
						className="px-8 py-3 rounded-lg border border-transparent hover:border-[var(--panel-border)] bg-transparent hover:bg-[var(--panel-bg)] text-foreground/70 hover:text-foreground text-sm font-medium transition-all"
					>
						Documentation
					</a>
				</div>
			</div>
		</div>
	);
}
