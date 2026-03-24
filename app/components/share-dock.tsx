"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
    Share2,
    Image as ImageIcon,
    Film,
    Video,
    Check,
    AlertCircle,
    Download,
    Smartphone,
    Sparkles,
} from "lucide-react";
import GIF from "gif.js";

interface ShareDockProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    accentColor?: string;
}

type ExportStatus = "idle" | "progress" | "success" | "error";
type ExportFormat = "png" | "gif" | "webm";
type ShareTemplate = "mood-card" | "reflection-card" | "reaction-clip";

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

    const vb = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [
        0, 0, 520, 350,
    ];
    const [vbX, vbY, vbW, vbH] = vb;
    const vbSide = Math.max(vbW, vbH);
    const squareVBX = vbX - (vbSide - vbW) / 2;
    const squareVBY = vbY - (vbSide - vbH) / 2;

    const isDark = document.documentElement.classList.contains("dark");
    const fg = isDark ? "#fafafa" : "#09090b";
    const bg = isDark ? "#09090b" : "#fafafa";

    const liveRoot = getComputedStyle(svg);
    const accentColor = liveRoot.color || fg;

    const liveElements = Array.from(svg.querySelectorAll("*")) as SVGElement[];
    const resolvedFills: string[] = [];
    const resolvedStrokes: string[] = [];
    liveElements.forEach((el) => {
        const cs = getComputedStyle(el);
        resolvedFills.push(cs.fill || "");
        resolvedStrokes.push(cs.stroke || "");
    });

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", String(outputSize));
    clone.setAttribute("height", String(outputSize));
    clone.setAttribute(
        "viewBox",
        `${squareVBX} ${squareVBY} ${vbSide} ${vbSide}`,
    );
    clone.style.color = accentColor;

    const allElements = Array.from(clone.querySelectorAll("*")) as SVGElement[];
    allElements.forEach((el, i) => {
        const attrFill = el.getAttribute("fill");
        const attrStroke = el.getAttribute("stroke");

        if (attrFill === "currentColor") {
            el.setAttribute("fill", accentColor);
        } else if (attrFill === null || attrFill === "") {
            const resolved = resolvedFills[i];
            if (resolved && resolved !== "none" && !resolved.startsWith("url(")) {
                el.setAttribute("fill", resolved);
            }
        }

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

        el.removeAttribute("class");
        if (el.style.filter?.includes("drop-shadow")) el.style.filter = "";
        if (el.style.fill?.startsWith("var(")) el.style.removeProperty("fill");
        if (el.style.stroke?.startsWith("var(")) {
            el.style.removeProperty("stroke");
        }
        if (el.style.color?.startsWith("var(")) el.style.color = accentColor;
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = outputSize;
            canvas.height = outputSize;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, outputSize, outputSize);
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

function dataUrlToBlob(dataUrl: string) {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/png";
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
}

const TEMPLATES: {
    id: ShareTemplate;
    name: string;
    description: string;
}[] = [
    {
        id: "mood-card",
        name: "Mood Card",
        description: "A clean portrait export for static sharing.",
    },
    {
        id: "reflection-card",
        name: "Reflection",
        description: "Built for journal-like moments and softer posts.",
    },
    {
        id: "reaction-clip",
        name: "Reaction Clip",
        description: "Best fit for motion-first exports and social snippets.",
    },
];

export function ShareDock({
    targetRef,
    accentColor = "#7C3AED",
}: ShareDockProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [template, setTemplate] = React.useState<ShareTemplate>("mood-card");
    const [status, setStatus] = React.useState<ExportStatus>("idle");
    const [statusMessage, setStatusMessage] = React.useState("");
    const [activeFormat, setActiveFormat] = React.useState<ExportFormat | null>(
        null,
    );
    const canNativeShare =
        typeof navigator !== "undefined" && typeof navigator.share === "function";

    const resetStatus = React.useCallback(() => {
        window.setTimeout(() => {
            setStatus("idle");
            setStatusMessage("");
            setActiveFormat(null);
        }, 2200);
    }, []);

    const triggerDownload = React.useCallback((blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, []);

    const handleExportPNG = React.useCallback(async () => {
        if (!targetRef.current || status === "progress") return;
        try {
            setStatus("progress");
            setStatusMessage("Rendering PNG");
            setActiveFormat("png");

            const { dataUrl } = await captureAvatarPNG(targetRef.current, 1024);
            const blob = dataUrlToBlob(dataUrl);
            triggerDownload(blob, `dot-${template}-${Date.now()}.png`);

            setStatus("success");
            setStatusMessage("PNG saved");
            resetStatus();
        } catch (error) {
            console.error("PNG export failed", error);
            setStatus("error");
            setStatusMessage("PNG export failed");
            resetStatus();
        }
    }, [resetStatus, status, targetRef, template, triggerDownload]);

    const handleExportGIF = React.useCallback(async () => {
        if (!targetRef.current || status === "progress") return;
        try {
            setStatus("progress");
            setStatusMessage("Capturing animated GIF");
            setActiveFormat("gif");

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

            const fps = 10;
            const duration = 4000;
            const totalFrames = (duration / 1000) * fps;

            for (let i = 0; i < totalFrames; i++) {
                const { dataUrl } = await captureAvatarPNG(container, outputSize);
                const img = new Image();
                img.src = dataUrl;
                await new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                });
                gif.addFrame(img, { delay: 1000 / fps });
                await new Promise((r) => setTimeout(r, 1000 / fps));
            }

            gif.on("finished", (blob: Blob) => {
                triggerDownload(blob, `dot-${template}-${Date.now()}.gif`);
                setStatus("success");
                setStatusMessage("GIF saved");
                resetStatus();
            });

            gif.render();
        } catch (error) {
            console.error("GIF export failed", error);
            setStatus("error");
            setStatusMessage("GIF export failed");
            resetStatus();
        }
    }, [resetStatus, status, targetRef, template, triggerDownload]);

    const handleShareNative = React.useCallback(async () => {
        if (!targetRef.current || status === "progress") return;
        if (!canNativeShare) {
            setStatus("error");
            setStatusMessage("Native share unavailable on this device");
            resetStatus();
            return;
        }
        try {
            setStatus("progress");
            setStatusMessage("Preparing share card");
            setActiveFormat("png");

            const { dataUrl } = await captureAvatarPNG(targetRef.current, 1024);
            const blob = dataUrlToBlob(dataUrl);
            const file = new File([blob], `dot-${template}.png`, {
                type: "image/png",
            });

            await navigator.share({
                title: "DOT Moment",
                text: "A moment captured from DOT.",
                files: [file],
            });

            setStatus("success");
            setStatusMessage("Shared successfully");
            resetStatus();
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                setStatus("idle");
                setStatusMessage("");
                setActiveFormat(null);
                return;
            }
            console.error("Native share failed", error);
            setStatus("error");
            setStatusMessage("Share failed");
            resetStatus();
        }
    }, [canNativeShare, resetStatus, status, targetRef, template]);

    return (
        <>
            <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] right-3 sm:bottom-10 sm:right-6 z-[70] flex flex-col items-end gap-3 pointer-events-auto">
                <AnimatePresence>
                    {status !== "idle" && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            className="rounded-full px-4 py-2 bg-background/90 backdrop-blur-md border shadow-premium flex items-center gap-2"
                            style={{ borderColor: `${accentColor}20` }}
                        >
                            {status === "progress" && (
                                <div
                                    className="size-4 rounded-full border-2 border-t-transparent animate-spin"
                                    style={{
                                        borderColor: `${accentColor}70`,
                                        borderTopColor: "transparent",
                                    }}
                                />
                            )}
                            {status === "success" && (
                                <Check className="size-4 text-success" />
                            )}
                            {status === "error" && (
                                <AlertCircle className="size-4 text-destructive" />
                            )}
                            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-foreground/80">
                                {statusMessage}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsOpen(true)}
                    className="size-12 sm:size-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 shadow-premium"
                    style={{
                        backgroundColor: "var(--background)",
                        borderColor: `${accentColor}40`,
                        color: accentColor,
                        boxShadow: `0 8px 24px -8px ${accentColor}20`,
                    }}
                    title="Share Moment"
                >
                    <Share2 className="size-5 sm:size-6" />
                </motion.button>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent
                    side="right"
                    className="w-[calc(100vw-16px)] sm:w-[460px] sm:max-w-md p-0 flex flex-col right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 h-[calc(100svh-16px)] sm:h-[calc(100svh-32px)] rounded-[32px] border-0 shadow-premium overflow-hidden glass-card"
                >
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-color-burn"
                        style={{ backgroundColor: accentColor }}
                    />
                    <div className="absolute inset-0 bg-washi pointer-events-none opacity-[0.12]" />

                    <SheetHeader className="relative z-10 px-7 pt-7 pb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="size-10 rounded-full flex items-center justify-center shadow-sm"
                                style={{
                                    backgroundColor: `${accentColor}15`,
                                    color: accentColor,
                                }}
                            >
                                <Share2 className="size-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground/90">
                                    Share Moment
                                </SheetTitle>
                                <SheetDescription className="mt-1 text-[13px] leading-relaxed text-muted-foreground/75">
                                    Export DOT as a card, a still, or a motion
                                    clip in the same polished presentation style.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-7 space-y-5 custom-scrollbar">
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                <Sparkles
                                    className="size-3.5"
                                    style={{ color: accentColor }}
                                />
                                <span className="text-micro">Template Picker</span>
                            </div>
                            <div className="space-y-3">
                                {TEMPLATES.map((item) => {
                                    const active = item.id === template;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setTemplate(item.id)}
                                            className="w-full text-left p-4 rounded-[24px] border transition-all duration-300 bg-background/60 backdrop-blur-md shadow-sm hover:bg-background/80"
                                            style={{
                                                borderColor: active
                                                    ? `${accentColor}45`
                                                    : "rgba(28,10,46,0.06)",
                                                boxShadow: active
                                                    ? `0 10px 24px -14px ${accentColor}60`
                                                    : undefined,
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[15px] font-semibold tracking-tight text-foreground/90">
                                                        {item.name}
                                                    </p>
                                                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground/75">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                {active && (
                                                    <Badge
                                                        className="rounded-full border-0"
                                                        style={{
                                                            backgroundColor: `${accentColor}14`,
                                                            color: accentColor,
                                                        }}
                                                    >
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                <Download
                                    className="size-3.5"
                                    style={{ color: accentColor }}
                                />
                                <span className="text-micro">Export Options</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    {
                                        id: "png" as const,
                                        title: "PNG",
                                        description: "Best for static cards and clean social posts.",
                                        icon: <ImageIcon className="size-4" />,
                                        onClick: handleExportPNG,
                                        disabled: false,
                                        badge: null,
                                    },
                                    {
                                        id: "gif" as const,
                                        title: "GIF",
                                        description: "Short looping motion capture of the avatar.",
                                        icon: <Film className="size-4" />,
                                        onClick: handleExportGIF,
                                        disabled: false,
                                        badge: null,
                                    },
                                    {
                                        id: "webm" as const,
                                        title: "WebM",
                                        description: "Higher-fidelity video export for later polish.",
                                        icon: <Video className="size-4" />,
                                        onClick: () => undefined,
                                        disabled: true,
                                        badge: "Soon",
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={item.onClick}
                                        disabled={item.disabled || status === "progress"}
                                        className="w-full text-left p-4 rounded-[24px] border transition-all duration-300 bg-background/60 backdrop-blur-md shadow-sm hover:bg-background/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor:
                                                activeFormat === item.id
                                                    ? `${accentColor}40`
                                                    : "rgba(28,10,46,0.06)",
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="size-9 rounded-full flex items-center justify-center shrink-0"
                                                    style={{
                                                        backgroundColor: `${accentColor}12`,
                                                        color: accentColor,
                                                    }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-semibold tracking-tight text-foreground/90">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground/75">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {item.badge ? (
                                                <Badge variant="outline" className="rounded-full">
                                                    {item.badge}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                <Smartphone
                                    className="size-3.5"
                                    style={{ color: accentColor }}
                                />
                                <span className="text-micro">Share Target</span>
                            </div>
                            <div className="rounded-[28px] bg-background/60 backdrop-blur-md border border-foreground/[0.05] p-5 shadow-sm space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[15px] font-medium text-foreground/90">
                                            Native share sheet
                                        </p>
                                        <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                                            {canNativeShare
                                                ? "Share directly through your device after DOT prepares a PNG card."
                                                : "Your browser does not expose native sharing here, so DOT will fall back to file downloads."}
                                        </p>
                                    </div>
                                    <Badge
                                        className="rounded-full border-0"
                                        style={{
                                            backgroundColor: canNativeShare
                                                ? `${accentColor}14`
                                                : "rgba(239,68,68,0.12)",
                                            color: canNativeShare
                                                ? accentColor
                                                : "var(--destructive)",
                                        }}
                                    >
                                        {canNativeShare ? "Available" : "Fallback"}
                                    </Badge>
                                </div>

                                <button
                                    onClick={handleShareNative}
                                    disabled={!canNativeShare || status === "progress"}
                                    className="w-full h-12 rounded-[20px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                                    style={{
                                        backgroundColor: accentColor,
                                        color: "#fff",
                                        boxShadow: `0 4px 14px ${accentColor}40`,
                                    }}
                                >
                                    <Share2 className="size-[16px]" />
                                    Open Share Sheet
                                </button>
                            </div>
                        </section>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
