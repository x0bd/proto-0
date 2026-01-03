"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaceVariant } from "./types";

interface EarsProps {
	variant: FaceVariant;
	emotion: {
		joy: number;
		sadness: number;
		anger: number;
		surprise: number;
		curiosity: number;
	};
}

export function Ears({ variant, emotion }: EarsProps) {
	const leftEarRef = useRef<SVGPathElement>(null);
	const rightEarRef = useRef<SVGPathElement>(null);

	// Call ALL hooks first, BEFORE any early return
	useEffect(() => {
		if (variant !== "neko") return; // Guard inside effect
		
		const { joy, sadness, anger, curiosity, surprise } = emotion;

		const flattenFactor = (anger * 45) + (sadness * 20);
		const perkFactor = (curiosity * 15) + (surprise * 20) + (joy * 10);
        
		const leftRot = -10 - flattenFactor + perkFactor;
		const rightRot = 10 + flattenFactor - perkFactor;

		if (leftEarRef.current && rightEarRef.current) {
			gsap.to(leftEarRef.current, {
				rotation: leftRot,
				transformOrigin: "80% 100%",
				y: -perkFactor * 0.5,
				duration: 0.6,
				ease: "elastic.out(1, 0.7)",
			});

			gsap.to(rightEarRef.current, {
				rotation: rightRot,
				transformOrigin: "20% 100%",
				y: -perkFactor * 0.5,
				duration: 0.6,
				ease: "elastic.out(1, 0.7)",
			});
		}
	}, [emotion, variant]);
    
	// Random twitch effect
	useEffect(() => {
		if (variant !== "neko") return;
		
		let twitchDelay: gsap.core.Tween | null = null;
		
		const twitch = () => {
			if (Math.random() > 0.7) {
				const target = Math.random() > 0.5 ? leftEarRef.current : rightEarRef.current;
				if (target) {
					gsap.to(target, {
						scaleY: 0.9,
						duration: 0.05,
						yoyo: true,
						repeat: 1,
					});
				}
			}
			twitchDelay = gsap.delayedCall(2 + Math.random() * 4, twitch);
		};
		twitch();
		
		return () => {
			twitchDelay?.kill();
		};
	}, [variant]);

	// Conditional render AFTER hooks
	if (variant !== "neko") return null;

	return (
		<g className="text-black dark:text-white stroke-current fill-none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
			<path
				ref={leftEarRef}
				d="M 145 75 L 165 35 L 185 75"
			/>
			<path
				ref={rightEarRef}
				d="M 335 75 L 355 35 L 375 75"
			/>
		</g>
	);
}
