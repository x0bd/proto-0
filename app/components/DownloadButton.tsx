"use client";

import * as React from "react";
import { IoDownloadOutline, IoImageOutline, IoVideocamOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import GIF from "gif.js";

interface DownloadButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Captures the avatar SVG as a PNG data URL using native SVG serialization.
 * Forces a perfect 1:1 square output by centering the SVG's viewBox.
 */
async function captureAvatarPNG(container: HTMLDivElement, outputSize: number = 1024): Promise<{ dataUrl: string; size: number }> {
    const svg = container.querySelector("svg");
    if (!svg) throw new Error("No SVG element found in avatar container");

    // Read the original viewBox (e.g. "0 -35 520 350")
    const vb = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [0, 0, 520, 350];
    const [vbX, vbY, vbW, vbH] = vb;

    // Make the viewBox square by expanding the shorter axis, centered
    const vbSide = Math.max(vbW, vbH);
    const squareVBX = vbX - (vbSide - vbW) / 2;
    const squareVBY = vbY - (vbSide - vbH) / 2;

    // Theme colors
    const isDark = document.documentElement.classList.contains("dark");
    const fg = isDark ? "#fafafa" : "#09090b";
    const bg = isDark ? "#09090b" : "#fafafa";

    // Clone and prepare the SVG
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", String(outputSize));
    clone.setAttribute("height", String(outputSize));
    clone.setAttribute("viewBox", `${squareVBX} ${squareVBY} ${vbSide} ${vbSide}`);

    // Resolve currentColor
    const computedColor = getComputedStyle(svg).color || fg;
    clone.style.color = computedColor;

    // Replace CSS variable references and currentColor in the clone
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
        const htmlEl = el as SVGElement;
        const style = htmlEl.style;

        // Fix fill
        const fill = htmlEl.getAttribute("fill");
        if (fill === "currentColor") htmlEl.setAttribute("fill", fg);

        // Fix stroke  
        const stroke = htmlEl.getAttribute("stroke");
        if (stroke === "currentColor") htmlEl.setAttribute("stroke", fg);

        // Remove CSS classes (they won't resolve in the serialized SVG)
        htmlEl.removeAttribute("class");

        // Remove filters that reference external defs
        if (style.filter && style.filter.includes("drop-shadow")) {
            style.filter = "";
        }
    });

    // Serialize to blob
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
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

            resolve({ dataUrl: canvas.toDataURL("image/png"), size: outputSize });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to render SVG to canvas"));
        };
        img.src = url;
    });
}

export function DownloadButton({ targetRef }: DownloadButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
    const [exportStatus, setExportStatus] = React.useState<"idle" | "success" | "error">("idle");

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
            const outputSize = 512;

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
            const duration = 2000; // 2 seconds
            const totalFrames = (duration / 1000) * fps;
            
            for (let i = 0; i < totalFrames; i++) {
                const { dataUrl } = await captureAvatarPNG(container, outputSize);
                
                const img = new Image();
                img.src = dataUrl;
                await new Promise<void>((resolve) => { img.onload = () => resolve(); });
                
                gif.addFrame(img, { delay: 1000 / fps });
                
                // Wait for next animation tick
                await new Promise(r => setTimeout(r, 1000 / fps));
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
        <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="flex flex-col gap-2 mb-2 origin-bottom-right"
                    >
                        <button
                            onClick={handleDownloadPNG}
                            disabled={isExporting}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-foreground/10 hover:bg-foreground/5 transition-all text-sm font-medium shadow-lg group w-40"
                        >
                            <div className="p-1.5 rounded-lg bg-foreground/5 text-foreground group-hover:scale-110 transition-transform">
                                <IoImageOutline className="size-4" />
                            </div>
                            <span>PNG</span>
                        </button>

                        <button
                            onClick={handleDownloadGIF}
                            disabled={isExporting}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-foreground/10 hover:bg-foreground/5 transition-all text-sm font-medium shadow-lg group w-40"
                        >
                            <div className="p-1.5 rounded-lg bg-foreground/5 text-foreground group-hover:scale-110 transition-transform">
                                <IoVideocamOutline className="size-4" />
                            </div>
                            <span>GIF (2s)</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "size-12 rounded-full flex items-center justify-center border transition-all shadow-xl backdrop-blur-sm z-50",
                    isExporting 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : exportStatus === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : exportStatus === "error"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                : isOpen 
                                    ? "bg-foreground text-background border-transparent"
                                    : "bg-background/50 hover:bg-background/80 border-foreground/10 text-foreground"
                )}
            >
                <AnimatePresence mode="wait">
                    {isExporting ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    ) : exportStatus === "success" ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <IoCheckmarkOutline className="size-6" />
                        </motion.div>
                    ) : isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <IoCloseOutline className="size-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="download"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <IoDownloadOutline className="size-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
