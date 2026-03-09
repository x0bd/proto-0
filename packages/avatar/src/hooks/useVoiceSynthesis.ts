import { useState, useRef, useCallback } from "react";

interface UseVoiceSynthesisOptions {
	/**
	 * URL of your TTS endpoint.
	 * Expects POST with `{ text: string; voiceId?: string }` JSON body
	 * and returns raw audio bytes.
	 * @default "/api/tts"
	 */
	ttsEndpoint?: string;
	onAudioStart?: () => void;
	onAudioEnd?: () => void;
}

/**
 * Fetches synthesised speech from a configurable TTS endpoint, plays it
 * through the Web Audio API, and exposes an AnalyserNode for hooking into
 * `useAudioAnalysis`.
 */
export function useVoiceSynthesis(options: UseVoiceSynthesisOptions = {}) {
	const { ttsEndpoint = "/api/tts", onAudioStart, onAudioEnd } = options;

	const [isSpeaking, setIsSpeaking] = useState(false);
	const audioContextRef = useRef<AudioContext | null>(null);
	const sourceRef = useRef<AudioBufferSourceNode | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const speak = useCallback(
		async (text: string, voiceId?: string) => {
			// Cancel any in-flight request and stop current playback
			abortControllerRef.current?.abort();
			sourceRef.current?.stop();

			const abortController = new AbortController();
			abortControllerRef.current = abortController;

			try {
				setIsSpeaking(true);
				onAudioStart?.();

				const response = await fetch(ttsEndpoint, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text, voiceId }),
					signal: abortController.signal,
				});

				if (!response.ok) throw new Error("TTS request failed");

				const arrayBuffer = await response.arrayBuffer();

				if (!audioContextRef.current) {
					audioContextRef.current = new (
						window.AudioContext ||
						(
							window as unknown as {
								webkitAudioContext: typeof AudioContext;
							}
						).webkitAudioContext
					)();
				}

				const ctx = audioContextRef.current;
				const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

				// Stop any currently playing source
				sourceRef.current?.stop();

				const source = ctx.createBufferSource();
				source.buffer = audioBuffer;

				if (
					!analyserRef.current ||
					analyserRef.current.context !== ctx
				) {
					analyserRef.current = ctx.createAnalyser();
					analyserRef.current.fftSize = 2048;
				}

				const analyser = analyserRef.current;
				source.connect(analyser);
				analyser.connect(ctx.destination);

				sourceRef.current = source;
				source.start(0);

				source.onended = () => {
					setIsSpeaking(false);
					onAudioEnd?.();
				};

				return analyser;
			} catch (err) {
				if (err instanceof Error && err.name === "AbortError") {
					// Expected — speak() was interrupted by a newer call or stop()
					return null;
				}
				console.error("[useVoiceSynthesis]", err);
				setIsSpeaking(false);
				onAudioEnd?.();
				return null;
			}
		},
		[ttsEndpoint, onAudioStart, onAudioEnd],
	);

	const stop = useCallback(() => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		if (sourceRef.current) {
			sourceRef.current.stop();
			sourceRef.current = null;
		}
		setIsSpeaking(false);
	}, []);

	return {
		speak,
		stop,
		isSpeaking,
		/** Expose analyser so callers can wire it into `useAudioAnalysis.connectExternalAnalyser` */
		analyserRef,
	};
}
