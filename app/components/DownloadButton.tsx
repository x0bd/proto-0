"use client";

import * as React from "react";
import {
	RiShareForwardFill,
	RiImageFill,
	RiFilmFill,
	RiCheckFill,
	RiCloseFill,
	RiGalleryFill,
} from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import GIF from "gif.js";

interface DownloadButtonProps {
	targetRef: React.RefObject<HTMLDivElement | null>;
	accentColor?: string;
	companionName?: string;
	emotion?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Parse a 6-digit hex color into an "r,g,b" string for rgba() usage. */
function hexToRgb(hex: string): string {
	const clean = hex.replace("#", "");
	const r = parseInt(clean.slice(0, 2), 16);
	const g = parseInt(clean.slice(2, 4), 16);
	const b = parseInt(clean.slice(4, 6), 16);
	if (isNaN(r) || isNaN(g) || isNaN(b)) return "139,92,246";
	return `${r},${g},${b}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

// ─── PNG Capture ───────────────────────────────────────────────────────────

/**
 * Captures the avatar SVG as a PNG data URL using native SVG serialization.
 * Forces a perfect 1:1 square output by centering the SVG's viewBox.
 */
async function captureAvatarPNG(
	container: HTMLDivElement,
	outputSize: number = 1024,
): Promise<{ dataUrl: string; size: number }> {
	const svg = container.querySelector("svg");
	if (!svg) throw new Error("No SVG element found in avatar container");

	// Read the original viewBox (e.g. "0 -35 520 350")
	const vb = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [
		0, 0, 520, 350,
	];
	const [vbX, vbY, vbW, vbH] = vb;

	// Make the viewBox square by expanding the shorter axis, centered
	const vbSide = Math.max(vbW, vbH);
	const squareVBX = vbX - (vbSide - vbW) / 2;
	const squareVBY = vbY - (vbSide - vbH) / 2;

	// Theme colors
	const isDark = document.documentElement.classList.contains("dark");
	const fg = isDark ? "#fafafa" : "#09090b";
	const bg = isDark ? "#09090b" : "#fafafa";

	// Read computed styles from LIVE elements BEFORE cloning so CSS classes,
	// CSS variables, and currentColor all resolve to their actual painted values.
	const liveRoot = getComputedStyle(svg);
	const accentColor = liveRoot.color || fg; // the accent color via `color: accentColor` on container

	const liveElements = Array.from(svg.querySelectorAll("*")) as SVGElement[];
	const resolvedFills: string[] = [];
	const resolvedStrokes: string[] = [];
	liveElements.forEach((el) => {
		const cs = getComputedStyle(el);
		resolvedFills.push(cs.fill || "");
		resolvedStrokes.push(cs.stroke || "");
	});

	// Clone and prepare the SVG
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute("width", String(outputSize));
	clone.setAttribute("height", String(outputSize));
	clone.setAttribute(
		"viewBox",
		`${squareVBX} ${squareVBY} ${vbSide} ${vbSide}`,
	);
	clone.style.color = accentColor;

	// Apply resolved paint values to every cloned element
	const allElements = Array.from(clone.querySelectorAll("*")) as SVGElement[];
	allElements.forEach((el, i) => {
		const attrFill = el.getAttribute("fill");
		const attrStroke = el.getAttribute("stroke");

		// Resolve fill: attribute "currentColor" → accentColor,
		// otherwise use the computed fill from the live element (handles CSS classes)
		if (attrFill === "currentColor") {
			el.setAttribute("fill", accentColor);
		} else if (attrFill === null || attrFill === "") {
			// fill came from a CSS class — bake it in
			const resolved = resolvedFills[i];
			if (
				resolved &&
				resolved !== "none" &&
				!resolved.startsWith("url(")
			) {
				el.setAttribute("fill", resolved);
			}
		}

		// Resolve stroke the same way
		if (attrStroke === "currentColor") {
			el.setAttribute("stroke", accentColor);
		} else if (attrStroke === null || attrStroke === "") {
			const resolved = resolvedStrokes[i];
			if (
				resolved &&
				resolved !== "none" &&
				!resolved.startsWith("url(")
			) {
				el.setAttribute("stroke", resolved);
			}
		}

		// Remove CSS classes (no stylesheet in serialized SVG)
		el.removeAttribute("class");

		// Remove any inline CSS vars / filter that won't survive serialization
		if (el.style.filter?.includes("drop-shadow")) el.style.filter = "";
		if (el.style.fill?.startsWith("var(")) el.style.removeProperty("fill");
		if (el.style.stroke?.startsWith("var("))
			el.style.removeProperty("stroke");
		if (el.style.color?.startsWith("var(")) el.style.color = accentColor;
	});

	// Serialize to blob
	const serializer = new XMLSerializer();
	const svgString = serializer.serializeToString(clone);
	const svgBlob = new Blob([svgString], {
		type: "image/svg+xml;charset=utf-8",
	});
	const url = URL.createObjectURL(svgBlob);

	// Draw onto a square canvas
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = outputSize;
			canvas.height = outputSize;
			const ctx = canvas.getContext("2d")!;

			// Fill background
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, outputSize, outputSize);

			// Draw the square SVG — it fills the entire canvas perfectly
			ctx.drawImage(img, 0, 0, outputSize, outputSize);
			URL.revokeObjectURL(url);

			resolve({
				dataUrl: canvas.toDataURL("image/png"),
				size: outputSize,
			});
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Failed to render SVG to canvas"));
		};
		img.src = url;
	});
}

// ─── Share Card ────────────────────────────────────────────────────────────

/**
 * Composes a branded share card: dark canvas + face + companion name +
 * emotion label + subtle branding. Returns a PNG data URL.
 */
async function captureShareCard(
	container: HTMLDivElement,
	companionName: string,
	emotion: string,
	accentColor: string,
): Promise<string> {
	const W = 1080;
	const H = 1350;
	const canvas = document.createElement("canvas");
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext("2d")!;

	// ── Dark base ──
	ctx.fillStyle = "#0c0c0e";
	ctx.fillRect(0, 0, W, H);

	// ── Accent radial glow at face center ──
	const rgb = hexToRgb(accentColor);
	const gx = W / 2;
	const gy = 430;
	const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 640);
	glow.addColorStop(0, `rgba(${rgb},0.20)`);
	glow.addColorStop(0.45, `rgba(${rgb},0.08)`);
	glow.addColorStop(1, "rgba(0,0,0,0)");
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, W, H);

	// ── Face ──
	const { dataUrl: facePng } = await captureAvatarPNG(container, 860);
	const faceImg = await loadImage(facePng);
	const faceSize = 860;
	const faceX = (W - faceSize) / 2;
	const faceY = 44;
	ctx.drawImage(faceImg, faceX, faceY, faceSize, faceSize);

	// ── Companion name ──
	ctx.textAlign = "center";
	ctx.font =
		'700 72px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
	ctx.fillStyle = "#f0f0f0";
	ctx.fillText(companionName.toUpperCase(), W / 2, 990);

	// ── Emotion label ──
	ctx.font =
		'400 32px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
	ctx.fillStyle = accentColor;
	ctx.globalAlpha = 0.75;
	ctx.fillText(emotion.toLowerCase(), W / 2, 1042);
	ctx.globalAlpha = 1;

	// ── Thin gradient rule ──
	const ruleY = 1090;
	const ruleGrad = ctx.createLinearGradient(
		W / 2 - 90,
		ruleY,
		W / 2 + 90,
		ruleY,
	);
	ruleGrad.addColorStop(0, "rgba(255,255,255,0)");
	ruleGrad.addColorStop(0.5, `rgba(${rgb},0.45)`);
	ruleGrad.addColorStop(1, "rgba(255,255,255,0)");
	ctx.strokeStyle = ruleGrad;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(W / 2 - 90, ruleY);
	ctx.lineTo(W / 2 + 90, ruleY);
	ctx.stroke();

	// ── Branding ──
	ctx.font =
		'400 22px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
	ctx.fillStyle = "rgba(255,255,255,0.20)";
	ctx.fillText("dot-0.vercel.app", W / 2, 1145);

	return canvas.toDataURL("image/png");
}

// ─── Component ─────────────────────────────────────────────────────────────

export function DownloadButton({
	targetRef,
	accentColor = "#7C3AED",
	companionName = "DOT",
	emotion = "curious",
}: DownloadButtonProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [isExporting, setIsExporting] = React.useState(false);
	const [exportStatus, setExportStatus] = React.useState<
		"idle" | "success" | "error"
	>("idle");

	const handleShareCard = async () => {
		if (!targetRef.current || isExporting) return;
		try {
			setIsExporting(true);
			const dataUrl = await captureShareCard(
				targetRef.current,
				companionName,
				emotion,
				accentColor,
			);

			const blob = await fetch(dataUrl).then((r) => r.blob());
			const file = new File([blob], `dot-${Date.now()}.png`, {
				type: "image/png",
			});

			if (
				typeof navigator !== "undefined" &&
				navigator.canShare?.({ files: [file] })
			) {
				await navigator.share({
					files: [file],
					title: `${companionName} — ${emotion}`,
				});
			} else {
				const link = document.createElement("a");
				link.download = `dot-card-${Date.now()}.png`;
				link.href = dataUrl;
				link.click();
			}

			setExportStatus("success");
			setTimeout(() => {
				setExportStatus("idle");
				setIsOpen(false);
			}, 2000);
		} catch (err) {
			// User cancelled share — not an error
			if (err instanceof Error && err.name === "AbortError") {
				setExportStatus("idle");
			} else {
				console.error("Share card failed", err);
				setExportStatus("error");
				setTimeout(() => setExportStatus("idle"), 2000);
			}
		} finally {
			setIsExporting(false);
		}
	};

	const handleDownloadPNG = async () => {
		if (!targetRef.current || isExporting) return;

		try {
			setIsExporting(true);
			const { dataUrl } = await captureAvatarPNG(targetRef.current, 1024);

			const link = document.createElement("a");
			link.download = `dot-face-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();

			setExportStatus("success");
			setTimeout(() => {
				setExportStatus("idle");
				setIsOpen(false);
			}, 2000);
		} catch (err) {
			console.error("PNG Export failed", err);
			setExportStatus("error");
			setTimeout(() => setExportStatus("idle"), 2000);
		} finally {
			setIsExporting(false);
		}
	};

	const handleDownloadGIF = async () => {
		if (!targetRef.current || isExporting) return;

		try {
			setIsExporting(true);
			const container = targetRef.current;
			const outputSize = 1024;

			const gif = new GIF({
				workers: 2,
				quality: 10,
				width: outputSize,
				height: outputSize,
				workerScript: "/gif.worker.js",
				background: "#000000",
			});

			// Capture frames
			const fps = 10;
			const duration = 4000; // 4 seconds
			const totalFrames = (duration / 1000) * fps;

			for (let i = 0; i < totalFrames; i++) {
				const { dataUrl } = await captureAvatarPNG(
					container,
					outputSize,
				);

				const img = new Image();
				img.src = dataUrl;
				await new Promise<void>((resolve) => {
					img.onload = () => resolve();
				});

				gif.addFrame(img, { delay: 1000 / fps });

				// Wait for next animation tick
				await new Promise((r) => setTimeout(r, 1000 / fps));
			}

			gif.on("finished", (blob: Blob) => {
				const link = document.createElement("a");
				link.download = `dot-face-${Date.now()}.gif`;
				link.href = URL.createObjectURL(blob);
				link.click();

				setIsExporting(false);
				setExportStatus("success");
				setTimeout(() => {
					setExportStatus("idle");
					setIsOpen(false);
				}, 2000);
			});

			gif.render();
		} catch (err) {
			console.error("GIF Export failed", err);
			setExportStatus("error");
			setIsExporting(false);
			setTimeout(() => setExportStatus("idle"), 2000);
		}
	};

	return (
		<div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] right-3 sm:bottom-10 sm:right-6 z-70 flex flex-col items-end gap-2 sm:gap-2.5 pointer-events-auto">
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 8, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8, scale: 0.96 }}
						transition={{
							type: "spring",
							damping: 30,
							stiffness: 400,
							mass: 0.8,
						}}
						className="flex flex-col gap-2 mb-1 origin-bottom-right"
					>
						{/* Share Card */}
						<button
							onClick={handleShareCard}
							disabled={isExporting}
							className={cn(
								"flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-background border transition-all font-mono font-semibold tracking-wide group w-40",
								"sm:gap-3.5 sm:px-5 sm:py-3 sm:text-[12px] sm:w-44 touch-manipulation",
								"active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
							)}
							style={{ borderColor: `${accentColor}20` }}
						>
							<div
								className="p-1.5 rounded-[6px] transition-all duration-200 group-hover:scale-110 shrink-0"
								style={{
									backgroundColor: `${accentColor}12`,
									color: accentColor,
								}}
							>
								<RiGalleryFill className="size-[14px]" />
							</div>
							<span
								className="uppercase text-[11px]"
								style={{ color: accentColor }}
							>
								Share Card
							</span>
						</button>

						{/* PNG */}
						<button
							onClick={handleDownloadPNG}
							disabled={isExporting}
							className={cn(
								"flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-background border transition-all font-mono font-semibold tracking-wide group w-40",
								"sm:gap-3.5 sm:px-5 sm:py-3 sm:text-[12px] sm:w-44 touch-manipulation",
								"active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
							)}
							style={{
								borderColor: `${accentColor}20`,
							}}
						>
							<div
								className="p-1.5 rounded-[6px] transition-all duration-200 group-hover:scale-110 shrink-0"
								style={{
									backgroundColor: `${accentColor}12`,
									color: accentColor,
								}}
							>
								<RiImageFill className="size-[14px]" />
							</div>
							<span
								className="uppercase text-[11px]"
								style={{ color: accentColor }}
							>
								Save as PNG
							</span>
						</button>

						<button
							onClick={handleDownloadGIF}
							disabled={isExporting}
							className={cn(
								"flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-background border transition-all font-mono font-semibold tracking-wide group w-40",
								"sm:gap-3.5 sm:px-5 sm:py-3 sm:text-[12px] sm:w-44 touch-manipulation",
								"active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
							)}
							style={{
								borderColor: `${accentColor}20`,
							}}
						>
							<div
								className="p-1.5 rounded-[6px] transition-all duration-200 group-hover:scale-110 shrink-0"
								style={{
									backgroundColor: `${accentColor}12`,
									color: accentColor,
								}}
							>
								<RiFilmFill className="size-[14px]" />
							</div>
							<span
								className="uppercase text-[11px]"
								style={{ color: accentColor }}
							>
								Animate GIF
							</span>
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.button
				whileHover={{ scale: 1.06 }}
				whileTap={{ scale: 0.92 }}
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"size-12 sm:size-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 z-50",
					isExporting
						? "border-amber-400/40"
						: exportStatus === "success"
							? "border-emerald-400/40"
							: exportStatus === "error"
								? "border-rose-400/40"
								: "",
				)}
				style={{
					backgroundColor: isExporting
						? undefined
						: exportStatus !== "idle"
							? undefined
							: isOpen
								? accentColor
								: "var(--background)",
					borderColor: isExporting
						? undefined
						: exportStatus !== "idle"
							? undefined
							: isOpen
								? accentColor
								: `${accentColor}40`,
					color: isExporting
						? undefined
						: exportStatus !== "idle"
							? undefined
							: isOpen
								? "#FFFFFF"
								: accentColor,
					boxShadow: isOpen
						? `0 8px 32px -4px ${accentColor}40`
						: `0 8px 24px -8px ${accentColor}20`,
				}}
			>
				<AnimatePresence mode="wait">
					{isExporting ? (
						<motion.div
							key="loading"
							initial={{ opacity: 0, rotate: -90 }}
							animate={{ opacity: 1, rotate: 0 }}
							exit={{ opacity: 0, rotate: 90 }}
							transition={{ duration: 0.2 }}
						>
							<div
								className="size-5 border-2 border-t-transparent rounded-full animate-spin"
								style={{
									borderColor: `${accentColor}60`,
									borderTopColor: "transparent",
								}}
							/>
						</motion.div>
					) : exportStatus === "success" ? (
						<motion.div
							key="success"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.2 }}
						>
							<RiCheckFill className="size-6 text-emerald-500" />
						</motion.div>
					) : isOpen ? (
						<motion.div
							key="close"
							initial={{ opacity: 0, rotate: -90 }}
							animate={{ opacity: 1, rotate: 0 }}
							exit={{ opacity: 0, rotate: 90 }}
							transition={{ duration: 0.2 }}
						>
							<RiCloseFill className="size-6" />
						</motion.div>
					) : (
						<motion.div
							key="share"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.2 }}
						>
							<RiShareForwardFill className="size-6" />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>
		</div>
	);
}
