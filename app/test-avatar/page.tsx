"use client";

import { useRef, useEffect } from "react";
import {
	Avatar,
	useAudioAnalysis,
	applyAgentTheme,
	type AvatarHandle,
} from "@xoboid/avatar";
import "@xoboid/avatar/avatar.css";

export default function TestAvatarPage() {
	const avatarRef = useRef<AvatarHandle>(null);

	const { levels, isAnalyzing, connectMicrophone } = useAudioAnalysis();

	// ── Configure these to test different states ──
	const variant = "minimal" as const;
	const color = "#FF6B6B";
	const size = 280;
	const emotion = { joy: 0.3, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.2 };

	useEffect(() => {
		applyAgentTheme(variant, color);
	}, []);

	// Uncomment to test imperative API:
	// useEffect(() => { avatarRef.current?.wink("left") }, []);
	// useEffect(() => { avatarRef.current?.surprise() }, []);
	// useEffect(() => { avatarRef.current?.boop() }, []);

	// Uncomment to test mic:
	// useEffect(() => { connectMicrophone() }, []);

	return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0a0a" }}>
			<Avatar
				ref={avatarRef}
				emotion={emotion}
				variant={variant}
				color={color}
				size={size}
				interactive
				audioLevels={isAnalyzing ? levels : undefined}
				speaking={isAnalyzing}
			/>
		</div>
	);
}
