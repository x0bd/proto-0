import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Audio frequency bands mapped to avatar features.
 */
export interface AudioLevels {
	/** 60–250 Hz — container breathing / scale */
	bass: number;
	/** 250–500 Hz — mouth opening (primary) */
	lowMid: number;
	/** 500–2000 Hz — mouth width variation */
	mid: number;
	/** 2000–4000 Hz — eye subtle pulse */
	highMid: number;
	/** 4000–8000 Hz — micro glances / blinks */
	presence: number;
	/** Overall RMS level (0–1) */
	overall: number;
	/** Raw frequency data for spectrum visualiser */
	frequencyData: Uint8Array | null;
}

export type AudioSourceType = "microphone" | "element" | "file";

interface UseAudioAnalysisOptions {
	/** FFT size (power of 2, 32–32768). Higher = more precision, more latency. @default 256 */
	fftSize?: number;
	/** Smoothing time constant (0–1). Higher = smoother, less responsive. @default 0.6 */
	smoothingTimeConstant?: number;
	/** Start analysis automatically when source is connected. @default true */
	autoStart?: boolean;
}

const DEFAULT_OPTIONS: Required<UseAudioAnalysisOptions> = {
	fftSize: 256,
	smoothingTimeConstant: 0.6,
	autoStart: true,
};

const ZERO_LEVELS: AudioLevels = {
	bass: 0,
	lowMid: 0,
	mid: 0,
	highMid: 0,
	presence: 0,
	overall: 0,
	frequencyData: null,
};

/**
 * Analyse audio and extract per-band levels for avatar reactivity.
 * Supports microphone, `<audio>/<video>` elements, File/Blob, and external AnalyserNodes.
 */
export function useAudioAnalysis(options: UseAudioAnalysisOptions = {}) {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceNodeRef = useRef<
		MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
	>(null);
	const animationFrameRef = useRef<number | null>(null);
	const frequencyDataRef = useRef<Uint8Array | null>(null);

	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [levels, setLevels] = useState<AudioLevels>(ZERO_LEVELS);
	const [error, setError] = useState<string | null>(null);

	const initializeContext = useCallback(() => {
		if (audioContextRef.current) return audioContextRef.current;

		try {
			const AudioContextClass =
				window.AudioContext ||
				(
					window as unknown as {
						webkitAudioContext: typeof AudioContext;
					}
				).webkitAudioContext;
			const ctx = new AudioContextClass();
			audioContextRef.current = ctx;

			const analyser = ctx.createAnalyser();
			analyser.fftSize = opts.fftSize;
			analyser.smoothingTimeConstant = opts.smoothingTimeConstant;
			analyserRef.current = analyser;

			frequencyDataRef.current = new Uint8Array(
				analyser.frequencyBinCount,
			);
			return ctx;
		} catch {
			setError("Web Audio API not supported");
			return null;
		}
	}, [opts.fftSize, opts.smoothingTimeConstant]);

	const extractBands = useCallback((): AudioLevels => {
		const analyser = analyserRef.current;
		const frequencyData = frequencyDataRef.current;
		if (!analyser || !frequencyData) return ZERO_LEVELS;

		analyser.getByteFrequencyData(
			frequencyData as unknown as Uint8Array<ArrayBuffer>,
		);

		const binCount = analyser.frequencyBinCount;
		const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
		const binWidth = sampleRate / opts.fftSize;

		const getAvg = (minHz: number, maxHz: number): number => {
			const minBin = Math.floor(minHz / binWidth);
			const maxBin = Math.min(Math.ceil(maxHz / binWidth), binCount - 1);
			if (minBin >= maxBin) return 0;
			let sum = 0;
			for (let i = minBin; i <= maxBin; i++) sum += frequencyData[i];
			return sum / ((maxBin - minBin + 1) * 255);
		};

		let rmsSum = 0;
		for (let i = 0; i < binCount; i++) {
			const n = frequencyData[i] / 255;
			rmsSum += n * n;
		}
		const overall = Math.sqrt(rmsSum / binCount);

		return {
			bass: getAvg(60, 250),
			lowMid: getAvg(250, 500),
			mid: getAvg(500, 2000),
			highMid: getAvg(2000, 4000),
			presence: getAvg(4000, 8000),
			overall,
			frequencyData: new Uint8Array(frequencyData),
		};
	}, [opts.fftSize]);

	const startAnalysis = useCallback(() => {
		setIsAnalyzing(true);
	}, []);

	const stopAnalysis = useCallback(() => {
		setIsAnalyzing(false);
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
		setLevels(ZERO_LEVELS);
	}, []);

	const analysisLoop = useCallback(() => {
		setLevels(extractBands());
		animationFrameRef.current = requestAnimationFrame(analysisLoop);
	}, [extractBands]);

	const connectMicrophone = useCallback(async () => {
		const ctx = initializeContext();
		if (!ctx) return false;
		try {
			if (ctx.state === "suspended") await ctx.resume();
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			const source = ctx.createMediaStreamSource(stream);
			source.connect(analyserRef.current!);
			sourceNodeRef.current = source;
			if (opts.autoStart) startAnalysis();
			return true;
		} catch {
			setError("Microphone access denied or unavailable");
			return false;
		}
	}, [initializeContext, opts.autoStart, startAnalysis]);

	const connectElement = useCallback(
		(element: HTMLAudioElement | HTMLVideoElement) => {
			const ctx = initializeContext();
			if (!ctx) return false;
			try {
				if (ctx.state === "suspended") ctx.resume();
				const source = ctx.createMediaElementSource(element);
				source.connect(analyserRef.current!);
				analyserRef.current!.connect(ctx.destination);
				sourceNodeRef.current = source;
				if (opts.autoStart) startAnalysis();
				return true;
			} catch {
				setError("Failed to connect audio element");
				return false;
			}
		},
		[initializeContext, opts.autoStart, startAnalysis],
	);

	const connectFile = useCallback(
		async (file: File | Blob) => {
			const ctx = initializeContext();
			if (!ctx) return null;
			try {
				if (ctx.state === "suspended") await ctx.resume();
				const arrayBuffer = await file.arrayBuffer();
				const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
				const bufferSource = ctx.createBufferSource();
				bufferSource.buffer = audioBuffer;
				bufferSource.connect(analyserRef.current!);
				analyserRef.current!.connect(ctx.destination);
				if (opts.autoStart) startAnalysis();
				return bufferSource;
			} catch {
				setError("Failed to decode audio file");
				return null;
			}
		},
		[initializeContext, opts.autoStart, startAnalysis],
	);

	const connectExternalAnalyser = useCallback(
		(externalAnalyser: AnalyserNode) => {
			analyserRef.current = externalAnalyser;
			audioContextRef.current = externalAnalyser.context as AudioContext;
			frequencyDataRef.current = new Uint8Array(
				externalAnalyser.frequencyBinCount,
			);
			if (opts.autoStart) startAnalysis();
			return true;
		},
		[opts.autoStart, startAnalysis],
	);

	const disconnect = useCallback(() => {
		stopAnalysis();
		if (sourceNodeRef.current) {
			sourceNodeRef.current.disconnect();
			sourceNodeRef.current = null;
		}
	}, [stopAnalysis]);

	useEffect(() => {
		if (isAnalyzing) {
			animationFrameRef.current = requestAnimationFrame(analysisLoop);
		}
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isAnalyzing, analysisLoop]);

	useEffect(() => {
		return () => {
			disconnect();
			audioContextRef.current?.close();
			audioContextRef.current = null;
		};
	}, [disconnect]);

	return {
		levels,
		isAnalyzing,
		error,
		connectMicrophone,
		connectElement,
		connectFile,
		connectExternalAnalyser,
		disconnect,
		startAnalysis,
		stopAnalysis,
	};
}
