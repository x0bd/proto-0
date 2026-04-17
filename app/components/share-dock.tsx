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
    X,
} from "lucide-react";
import GIF from "gif.js";

interface ShareDockProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
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
    constraintsRef,
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
                    className="size-12 sm:size-14 flex items-center justify-center transition-all duration-200 te-button"
                    style={{
                        color: accentColor,
                    }}
                    title="Share Moment"
                >
                    <Share2 className="size-5 sm:size-6" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 right-[400px] w-[340px] h-[500px] te-module z-[100]"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[var(--te-orange)]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">EXPORT_MOD</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => setIsOpen(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-orange)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar bg-[var(--panel-bg)]">
                        <section className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <Sparkles
                                    className="size-[10px]"
                                    style={{ color: accentColor }}
                                />
                                <span className="te-label">TEMPLATE_SEL</span>
                            </div>
                            <div className="space-y-2 te-recessed p-2">
                                {TEMPLATES.map((item) => {
                                    const active = item.id === template;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setTemplate(item.id)}
                                            className={`w-full text-left p-3 transition-all duration-150 te-button !border-b-[2px] !rounded-[8px] ${active ? 'bg-[var(--key-bg)] shadow-sm' : 'hover:bg-foreground/5 bg-transparent border-transparent'}`}
                                            style={active ? {
                                                borderColor: `color-mix(in srgb, ${accentColor} 40%, var(--key-border))`,
                                                borderBottomColor: `color-mix(in srgb, ${accentColor} 30%, var(--key-shadow))`
                                            } : undefined}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="te-value text-[11px]">
                                                        {item.name}
                                                    </p>
                                                    <p className="mt-0.5 text-[9px] font-mono text-muted-foreground/70 tracking-widest uppercase">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                {active && (
                                                    <div className="size-1.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <Download
                                    className="size-[10px]"
                                    style={{ color: accentColor }}
                                />
                                <span className="te-label">FORMAT_SEL</span>
                            </div>
                            <div className="space-y-2 te-recessed p-2">
                                {[
                                    {
                                        id: "png" as const,
                                        title: "PNG",
                                        description: "STATIC",
                                        icon: <ImageIcon className="size-3.5" />,
                                        onClick: handleExportPNG,
                                        disabled: false,
                                        badge: null,
                                    },
                                    {
                                        id: "gif" as const,
                                        title: "GIF",
                                        description: "MOTION",
                                        icon: <Film className="size-3.5" />,
                                        onClick: handleExportGIF,
                                        disabled: false,
                                        badge: null,
                                    },
                                    {
                                        id: "webm" as const,
                                        title: "WEBM",
                                        description: "VIDEO",
                                        icon: <Video className="size-3.5" />,
                                        onClick: () => undefined,
                                        disabled: true,
                                        badge: "N/A",
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={item.onClick}
                                        disabled={item.disabled || status === "progress"}
                                        className={`w-full text-left p-3 transition-all duration-150 te-button !border-b-[2px] !rounded-[8px] ${activeFormat === item.id ? 'bg-[var(--key-bg)] shadow-sm' : 'hover:bg-foreground/5 bg-transparent border-transparent'} disabled:opacity-30`}
                                        style={activeFormat === item.id ? {
                                            borderColor: `color-mix(in srgb, ${accentColor} 40%, var(--key-border))`,
                                            borderBottomColor: `color-mix(in srgb, ${accentColor} 30%, var(--key-shadow))`
                                        } : undefined}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="text-foreground/50">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="te-value text-[11px]">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[9px] font-mono text-muted-foreground/70 tracking-widest uppercase">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {item.badge ? (
                                                <span className="te-label opacity-40">{item.badge}</span>
                                            ) : null}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-2 pb-4">
                            <div className="flex items-center gap-2 px-1">
                                <Smartphone
                                    className="size-[10px]"
                                    style={{ color: accentColor }}
                                />
                                <span className="te-label">TARGET_SYS</span>
                            </div>
                            <div className="te-recessed p-3 space-y-3">
                                <div className="flex items-center justify-between gap-4 px-1">
                                    <p className="te-value text-[11px]">
                                        NATIVE_SHARE
                                    </p>
                                    <span className="te-label" style={{ color: canNativeShare ? 'var(--te-green)' : 'var(--te-orange)' }}>
                                        {canNativeShare ? "RDY" : "ERR"}
                                    </span>
                                </div>

                                <button
                                    onClick={handleShareNative}
                                    disabled={!canNativeShare || status === "progress"}
                                    className="w-full h-10 te-button"
                                    style={{ color: accentColor }}
                                >
                                    <Share2 className="size-[14px] mr-2" />
                                    EXECUTE
                                </button>
                            </div>
                        </section>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
