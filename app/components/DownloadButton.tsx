"use client";

import * as React from "react";
import { IoDownloadOutline, IoImageOutline, IoVideocamOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";
import * as htmlToImage from "html-to-image";
import { cn } from "@/lib/utils";
// gif.js is not typed by default, need to handle import carefully or use a d.ts
// We'll trust the user has the library available in public/ or node_modules
import GIF from "gif.js";

interface DownloadButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
}

export function DownloadButton({ targetRef }: DownloadButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
    const [exportStatus, setExportStatus] = React.useState<"idle" | "success" | "error">("idle");

    const handleDownloadPNG = async () => {
        if (!targetRef.current || isExporting) return;
        
        try {
            setIsExporting(true);
            const dataUrl = await htmlToImage.toPng(targetRef.current, {
                pixelRatio: 2,
                cacheBust: true,
                skipAutoScale: true,
                backgroundColor: "#000000", // Enforce black bg for consistency
            });
            
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
            
            // Initialize GIF encoder
            // Assumes gif.worker.js is in public folder. If not, we might need to fetch blob.
            // For now, we'll try standard config.
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: targetRef.current.clientWidth * 2,
                height: targetRef.current.clientHeight * 2,
                workerScript: "/gif.worker.js",
                background: "#000000"
            });

            // Capture frames
            const fps = 10;
            const duration = 2000; // 2 seconds
            const frames = (duration / 1000) * fps;
            
            for (let i = 0; i < frames; i++) {
                const dataUrl = await htmlToImage.toPng(targetRef.current, {
                    pixelRatio: 2,
                    skipAutoScale: true,
                    backgroundColor: "#000000",
                });
                
                const img = new Image();
                img.src = dataUrl;
                await new Promise((resolve) => { img.onload = resolve; });
                
                gif.addFrame(img, { delay: 1000 / fps });
                
                // Wait for next "tick" of animation (approx)
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
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-sm font-medium shadow-lg group w-40"
                        >
                            <div className="p-1.5 rounded-lg bg-white/5 text-foreground group-hover:scale-110 transition-transform">
                                <IoImageOutline className="size-4" />
                            </div>
                            <span>PNG</span>
                        </button>

                        <button
                            onClick={handleDownloadGIF}
                            disabled={isExporting}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-sm font-medium shadow-lg group w-40"
                        >
                            <div className="p-1.5 rounded-lg bg-white/5 text-foreground group-hover:scale-110 transition-transform">
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
                                    : "bg-background/50 hover:bg-background/80 border-white/10 text-foreground"
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
