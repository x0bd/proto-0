"use client";

import { FaceVariant } from "./types";

interface EarsProps {
	variant: FaceVariant;
	emotion: any;
    color?: string;
}

export function Ears({ variant, emotion, color }: EarsProps) {
    // Ears were previously for Neko variant which is removed.
    // Keeping component stub for potential future use.
	return null;
}
