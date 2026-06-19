"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Share2,
    Check,
    AlertCircle,
    X,
} from "lucide-react";
import GIF from "gif.js";
import { usePanelPosition } from "@/hooks/usePanelPosition";

interface ShareDockProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

type ExportStatus = "idle" | "progress" | "success" | "error";
type ExportFormat = "png" | "gif" | "webm";
type ShareTemplate = "mood-card" | "reflection-card" | "reaction-clip";

class ExportCancelledError extends Error {
    constructor() {
        super("Export cancelled");
        this.name = "ExportCancelledError";
    }
}

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

interface RgbColor {
    r: number;
    g: number;
    b: number;
}

interface RenderTemplateFrameOptions {
    avatarDataUrl: string;
    template: ShareTemplate;
    outputSize: number;
    accentColor: string;
    frameIndex?: number;
    totalFrames?: number;
}

function parseColor(color: string): RgbColor {
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
        return {
            r: Number(rgbMatch[1]),
            g: Number(rgbMatch[2]),
            b: Number(rgbMatch[3]),
        };
    }

    const hex = color.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
    if (!hex) return { r: 124, g: 58, b: 237 };

    const normalized =
        hex.length === 3
            ? hex
                .split("")
                .map((char) => char + char)
                .join("")
            : hex;
    const value = Number.parseInt(normalized, 16);

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

function rgba(color: RgbColor, alpha: number) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function loadCanvasImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load export frame"));
        img.src = src;
    });
}

function drawRoundedPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function fillRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient | CanvasPattern,
) {
    drawRoundedPath(ctx, x, y, width, height, radius);
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

function strokeRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
) {
    drawRoundedPath(ctx, x, y, width, height, radius);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawExportGrid(
    ctx: CanvasRenderingContext2D,
    size: number,
    color: RgbColor,
    opacity: number,
) {
    const step = size / 24;
    ctx.save();
    ctx.strokeStyle = rgba(color, opacity);
    ctx.lineWidth = Math.max(1, size * 0.0015);
    for (let i = 0; i <= size; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
    }
    ctx.restore();
}

function drawAvatarTile(
    ctx: CanvasRenderingContext2D,
    avatar: HTMLImageElement,
    x: number,
    y: number,
    size: number,
    radius: number,
    accent: RgbColor,
    dark: boolean,
) {
    ctx.save();
    ctx.shadowColor = rgba(accent, dark ? 0.34 : 0.2);
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.03;
    fillRoundedRect(
        ctx,
        x - size * 0.035,
        y - size * 0.035,
        size * 1.07,
        size * 1.07,
        radius + size * 0.03,
        dark ? "rgba(8, 8, 7, 0.92)" : "rgba(253, 249, 238, 0.94)",
    );
    ctx.restore();

    ctx.save();
    drawRoundedPath(ctx, x, y, size, size, radius);
    ctx.clip();
    ctx.fillStyle = dark ? "#090907" : "#f8f1df";
    ctx.fillRect(x, y, size, size);
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    strokeRoundedRect(ctx, x, y, size, size, radius, rgba(accent, 0.85), size * 0.01);
    strokeRoundedRect(
        ctx,
        x + size * 0.025,
        y + size * 0.025,
        size * 0.95,
        size * 0.95,
        radius * 0.8,
        dark ? "rgba(255, 255, 255, 0.08)" : "rgba(20, 20, 16, 0.08)",
        size * 0.004,
    );
}

function setMonoFont(
    ctx: CanvasRenderingContext2D,
    size: number,
    weight: number = 800,
) {
    ctx.font = `${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
}

function drawMoodCard(
    ctx: CanvasRenderingContext2D,
    avatar: HTMLImageElement,
    size: number,
    accent: RgbColor,
    dark: boolean,
    frameIndex: number,
    totalFrames: number,
) {
    const progress = totalFrames > 1 ? frameIndex / totalFrames : 0;
    const pulse = Math.sin(progress * Math.PI * 2);
    const base = dark ? "#0b0a08" : "#f4eddd";
    const ink = dark ? "#fff7de" : "#15120d";

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    const glow = ctx.createRadialGradient(size * 0.18, size * 0.08, 0, size * 0.38, size * 0.18, size * 0.7);
    glow.addColorStop(0, rgba(accent, 0.42));
    glow.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    drawExportGrid(ctx, size, accent, dark ? 0.07 : 0.09);

    fillRoundedRect(
        ctx,
        size * 0.07,
        size * 0.07,
        size * 0.86,
        size * 0.86,
        size * 0.045,
        dark ? "rgba(18, 17, 14, 0.8)" : "rgba(255, 251, 239, 0.78)",
    );
    strokeRoundedRect(ctx, size * 0.07, size * 0.07, size * 0.86, size * 0.86, size * 0.045, rgba(accent, 0.42), size * 0.004);

    setMonoFont(ctx, size * 0.025, 900);
    ctx.fillStyle = ink;
    ctx.fillText("DOT // MOOD_CARD", size * 0.12, size * 0.14);
    setMonoFont(ctx, size * 0.013, 700);
    ctx.fillStyle = dark ? "rgba(255, 247, 222, 0.48)" : "rgba(21, 18, 13, 0.48)";
    ctx.fillText("LOCAL CAPTURE / FEELING SNAPSHOT", size * 0.12, size * 0.17);

    const avatarSize = size * 0.58 + pulse * size * 0.006;
    drawAvatarTile(
        ctx,
        avatar,
        (size - avatarSize) / 2,
        size * 0.205,
        avatarSize,
        size * 0.045,
        accent,
        dark,
    );

    const labels = ["SIGNAL", "WARMTH", "AURA"];
    labels.forEach((label, index) => {
        const y = size * (0.78 + index * 0.045);
        const value = 0.52 + index * 0.12 + Math.abs(pulse) * 0.1;
        setMonoFont(ctx, size * 0.012, 800);
        ctx.fillStyle = dark ? "rgba(255, 247, 222, 0.58)" : "rgba(21, 18, 13, 0.58)";
        ctx.fillText(label, size * 0.13, y + size * 0.008);
        fillRoundedRect(ctx, size * 0.3, y, size * 0.55, size * 0.012, size * 0.006, dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)");
        fillRoundedRect(ctx, size * 0.3, y, size * 0.55 * Math.min(value, 0.95), size * 0.012, size * 0.006, rgba(accent, 0.9));
    });
}

function drawReflectionCard(
    ctx: CanvasRenderingContext2D,
    avatar: HTMLImageElement,
    size: number,
    accent: RgbColor,
    dark: boolean,
    frameIndex: number,
    totalFrames: number,
) {
    const progress = totalFrames > 1 ? frameIndex / totalFrames : 0;
    const drift = Math.sin(progress * Math.PI * 2) * size * 0.008;
    const base = dark ? "#11100d" : "#efe5cf";
    const paper = dark ? "rgba(25, 23, 19, 0.92)" : "rgba(255, 248, 231, 0.94)";
    const ink = dark ? "#fff4cf" : "#211b12";

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    const wash = ctx.createLinearGradient(0, 0, size, size);
    wash.addColorStop(0, rgba(accent, 0.28));
    wash.addColorStop(0.45, "rgba(0, 0, 0, 0)");
    wash.addColorStop(1, dark ? "rgba(255, 214, 128, 0.08)" : "rgba(118, 68, 22, 0.12)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, size, size);

    fillRoundedRect(ctx, size * 0.09, size * 0.09, size * 0.82, size * 0.82, size * 0.035, paper);
    strokeRoundedRect(ctx, size * 0.09, size * 0.09, size * 0.82, size * 0.82, size * 0.035, dark ? "rgba(255,255,255,0.1)" : "rgba(64,44,20,0.16)", size * 0.003);

    ctx.fillStyle = rgba(accent, 0.9);
    ctx.fillRect(size * 0.14, size * 0.15, size * 0.014, size * 0.7);

    setMonoFont(ctx, size * 0.019, 900);
    ctx.fillStyle = ink;
    ctx.fillText("REFLECTION_LOG", size * 0.19, size * 0.18);
    setMonoFont(ctx, size * 0.013, 700);
    ctx.fillStyle = dark ? "rgba(255, 244, 207, 0.46)" : "rgba(33, 27, 18, 0.46)";
    ctx.fillText("A QUIET DOT MOMENT, SAVED LOCALLY", size * 0.19, size * 0.215);

    const avatarSize = size * 0.51;
    drawAvatarTile(
        ctx,
        avatar,
        size * 0.245 + drift,
        size * 0.29,
        avatarSize,
        size * 0.035,
        accent,
        dark,
    );

    setMonoFont(ctx, size * 0.015, 800);
    ctx.fillStyle = ink;
    ctx.fillText("NOTE TO SELF", size * 0.19, size * 0.82);
    setMonoFont(ctx, size * 0.012, 700);
    ctx.fillStyle = dark ? "rgba(255, 244, 207, 0.5)" : "rgba(33, 27, 18, 0.5)";
    ctx.fillText("small signal, honest weather, still here.", size * 0.19, size * 0.85);
}

function drawReactionClip(
    ctx: CanvasRenderingContext2D,
    avatar: HTMLImageElement,
    size: number,
    accent: RgbColor,
    dark: boolean,
    frameIndex: number,
    totalFrames: number,
) {
    const progress = totalFrames > 1 ? frameIndex / totalFrames : 0;
    const pulse = Math.sin(progress * Math.PI * 2);
    const base = dark ? "#070707" : "#16130e";
    const ink = "#fff7e8";

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size * (0.08 + progress * 0.12), 0);
    ctx.rotate(-0.16);
    ctx.fillStyle = rgba(accent, 0.9);
    ctx.fillRect(size * 0.08, -size * 0.1, size * 0.18, size * 1.2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.fillRect(size * 0.3, -size * 0.1, size * 0.03, size * 1.2);
    ctx.restore();

    for (let y = 0; y < size; y += size * 0.025) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        ctx.fillRect(0, y + (progress * size * 0.025), size, Math.max(1, size * 0.002));
    }

    const avatarSize = size * 0.64 + pulse * size * 0.018;
    drawAvatarTile(
        ctx,
        avatar,
        (size - avatarSize) / 2 + pulse * size * 0.008,
        size * 0.19,
        avatarSize,
        size * 0.055,
        accent,
        true,
    );

    fillRoundedRect(ctx, size * 0.08, size * 0.08, size * 0.84, size * 0.085, size * 0.018, "rgba(0, 0, 0, 0.58)");
    setMonoFont(ctx, size * 0.024, 900);
    ctx.fillStyle = ink;
    ctx.fillText("RXN_CLIP", size * 0.12, size * 0.135);
    setMonoFont(ctx, size * 0.012, 800);
    ctx.fillStyle = "rgba(255, 247, 232, 0.55)";
    const frameLabel = `${String(frameIndex + 1).padStart(2, "0")}/${String(Math.max(totalFrames, 1)).padStart(2, "0")}`;
    ctx.fillText(`FRAME ${frameLabel}`, size * 0.72, size * 0.135);

    const ticks = 11;
    for (let i = 0; i < ticks; i++) {
        const x = size * 0.1 + i * size * 0.08;
        const h = size * (0.018 + ((i + frameIndex) % 4) * 0.01);
        fillRoundedRect(ctx, x, size * 0.84, size * 0.028, h, size * 0.006, rgba(accent, 0.85));
    }
}

async function renderTemplateFrame({
    avatarDataUrl,
    template,
    outputSize,
    accentColor,
    frameIndex = 0,
    totalFrames = 1,
}: RenderTemplateFrameOptions): Promise<{ dataUrl: string; size: number }> {
    const avatar = await loadCanvasImage(avatarDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas rendering is unavailable");

    const accent = parseColor(accentColor);
    const dark = document.documentElement.classList.contains("dark");

    if (template === "reflection-card") {
        drawReflectionCard(ctx, avatar, outputSize, accent, dark, frameIndex, totalFrames);
    } else if (template === "reaction-clip") {
        drawReactionClip(ctx, avatar, outputSize, accent, dark, frameIndex, totalFrames);
    } else {
        drawMoodCard(ctx, avatar, outputSize, accent, dark, frameIndex, totalFrames);
    }

    return {
        dataUrl: canvas.toDataURL("image/png"),
        size: outputSize,
    };
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

function getTemplateMeta(template: ShareTemplate) {
    return TEMPLATES.find((item) => item.id === template) ?? TEMPLATES[0];
}

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
    const cancelExportRef = React.useRef(false);
    const resetTimerRef = React.useRef<number | null>(null);
    const activeRecorderRef = React.useRef<MediaRecorder | null>(null);
    const activeStreamRef = React.useRef<MediaStream | null>(null);
    const activeGifRef = React.useRef<{ abort?: () => void } | null>(null);
    const selectedTemplate = getTemplateMeta(template);
    const canNativeShare =
        typeof navigator !== "undefined" && typeof navigator.share === "function";

    const resetStatus = React.useCallback(() => {
        if (resetTimerRef.current) {
            window.clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = window.setTimeout(() => {
            setStatus("idle");
            setStatusMessage("");
            setActiveFormat(null);
            resetTimerRef.current = null;
        }, 2200);
    }, []);

    const beginExport = React.useCallback((format: ExportFormat, message: string) => {
        if (resetTimerRef.current) {
            window.clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
        cancelExportRef.current = false;
        setStatus("progress");
        setStatusMessage(message);
        setActiveFormat(format);
    }, []);

    const ensureNotCancelled = React.useCallback(() => {
        if (cancelExportRef.current) throw new ExportCancelledError();
    }, []);

    const handleCancelExport = React.useCallback(() => {
        cancelExportRef.current = true;
        activeGifRef.current?.abort?.();
        if (
            activeRecorderRef.current &&
            activeRecorderRef.current.state !== "inactive"
        ) {
            activeRecorderRef.current.stop();
        } else {
            activeStreamRef.current?.getTracks().forEach((track) => track.stop());
        }
        setStatus("error");
        setStatusMessage("Export cancelled");
        setActiveFormat(null);
        resetStatus();
    }, [resetStatus]);

    React.useEffect(() => {
        return () => {
            cancelExportRef.current = true;
            activeGifRef.current?.abort?.();
            if (
                activeRecorderRef.current &&
                activeRecorderRef.current.state !== "inactive"
            ) {
                activeRecorderRef.current.stop();
            }
            activeStreamRef.current?.getTracks().forEach((track) => track.stop());
            if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
        };
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
            beginExport("png", "Rendering PNG");

            const { dataUrl } = await captureAvatarPNG(targetRef.current, 1024);
            ensureNotCancelled();
            const rendered = await renderTemplateFrame({
                avatarDataUrl: dataUrl,
                template,
                outputSize: 1024,
                accentColor,
            });
            ensureNotCancelled();
            const blob = dataUrlToBlob(rendered.dataUrl);
            triggerDownload(blob, `dot-${template}-${Date.now()}.png`);

            setStatus("success");
            setStatusMessage("PNG saved");
            resetStatus();
        } catch (error) {
            if (error instanceof ExportCancelledError) return;
            console.error("PNG export failed", error);
            setStatus("error");
            setStatusMessage("PNG export failed");
            resetStatus();
        }
    }, [accentColor, beginExport, ensureNotCancelled, resetStatus, status, targetRef, template, triggerDownload]);

    const handleExportWebM = React.useCallback(async () => {
        if (!targetRef.current || status === "progress") return;

        const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(
            (t) => MediaRecorder.isTypeSupported(t),
        );
        if (!mimeType) {
            setStatus("error");
            setStatusMessage("WebM not supported");
            resetStatus();
            return;
        }

        let stream: MediaStream | null = null;
        let recorder: MediaRecorder | null = null;
        let cancelled = false;

        try {
            beginExport("webm", "Recording WebM");

            const outputSize = 512;
            const canvas = document.createElement("canvas");
            canvas.width = outputSize;
            canvas.height = outputSize;
            const ctx2d = canvas.getContext("2d");
            if (!ctx2d) throw new Error("Canvas rendering is unavailable");

            stream = canvas.captureStream(12);
            recorder = new MediaRecorder(stream, { mimeType });
            activeStreamRef.current = stream;
            activeRecorderRef.current = recorder;
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
                stream?.getTracks().forEach((track) => track.stop());
                activeStreamRef.current = null;
                activeRecorderRef.current = null;
                if (cancelled || cancelExportRef.current) return;
                const blob = new Blob(chunks, { type: "video/webm" });
                triggerDownload(blob, `dot-${template}-${Date.now()}.webm`);
                setStatus("success");
                setStatusMessage("WebM saved");
                resetStatus();
            };

            recorder.start();

            const fps = 12;
            const totalFrames = Math.ceil(3 * fps);
            for (let i = 0; i < totalFrames; i++) {
                ensureNotCancelled();
                const { dataUrl } = await captureAvatarPNG(targetRef.current!, outputSize);
                ensureNotCancelled();
                const rendered = await renderTemplateFrame({
                    avatarDataUrl: dataUrl,
                    template,
                    outputSize,
                    accentColor,
                    frameIndex: i,
                    totalFrames,
                });
                ensureNotCancelled();
                const img = await loadCanvasImage(rendered.dataUrl);
                ctx2d.clearRect(0, 0, outputSize, outputSize);
                ctx2d.drawImage(img, 0, 0, outputSize, outputSize);
                await new Promise((r) => setTimeout(r, 1000 / fps));
            }

            recorder.stop();
        } catch (error) {
            if (error instanceof ExportCancelledError) {
                cancelled = true;
                if (recorder && recorder.state !== "inactive") {
                    recorder.stop();
                } else {
                    stream?.getTracks().forEach((track) => track.stop());
                    activeStreamRef.current = null;
                    activeRecorderRef.current = null;
                }
                return;
            }
            console.error("WebM export failed", error);
            setStatus("error");
            setStatusMessage("WebM export failed");
            resetStatus();
        }
    }, [accentColor, beginExport, ensureNotCancelled, resetStatus, status, targetRef, template, triggerDownload]);

    const handleExportGIF = React.useCallback(async () => {
        if (!targetRef.current || status === "progress") return;
        try {
            beginExport("gif", "Capturing animated GIF");

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
            activeGifRef.current = gif as { abort?: () => void };

            const fps = 10;
            const duration = 4000;
            const totalFrames = (duration / 1000) * fps;

            for (let i = 0; i < totalFrames; i++) {
                ensureNotCancelled();
                const { dataUrl } = await captureAvatarPNG(container, outputSize);
                ensureNotCancelled();
                const rendered = await renderTemplateFrame({
                    avatarDataUrl: dataUrl,
                    template,
                    outputSize,
                    accentColor,
                    frameIndex: i,
                    totalFrames,
                });
                ensureNotCancelled();
                const img = await loadCanvasImage(rendered.dataUrl);
                gif.addFrame(img, { delay: 1000 / fps });
                await new Promise((r) => setTimeout(r, 1000 / fps));
            }

            gif.on("finished", (blob: Blob) => {
                activeGifRef.current = null;
                if (cancelExportRef.current) return;
                triggerDownload(blob, `dot-${template}-${Date.now()}.gif`);
                setStatus("success");
                setStatusMessage("GIF saved");
                resetStatus();
            });

            ensureNotCancelled();
            gif.render();
        } catch (error) {
            activeGifRef.current = null;
            if (error instanceof ExportCancelledError) return;
            console.error("GIF export failed", error);
            setStatus("error");
            setStatusMessage("GIF export failed");
            resetStatus();
        }
    }, [accentColor, beginExport, ensureNotCancelled, resetStatus, status, targetRef, template, triggerDownload]);

    const handleShareNative = React.useCallback(async () => {
        if (!targetRef.current || status === "progress") return;
        if (!canNativeShare) {
            setStatus("error");
            setStatusMessage("Native share unavailable on this device");
            resetStatus();
            return;
        }
        try {
            beginExport("png", "Preparing share card");

            const { dataUrl } = await captureAvatarPNG(targetRef.current, 1024);
            ensureNotCancelled();
            const rendered = await renderTemplateFrame({
                avatarDataUrl: dataUrl,
                template,
                outputSize: 1024,
                accentColor,
            });
            ensureNotCancelled();
            const blob = dataUrlToBlob(rendered.dataUrl);
            const file = new File([blob], `dot-${template}.png`, {
                type: "image/png",
            });

            await navigator.share({
                title: `DOT ${selectedTemplate.name}`,
                text: selectedTemplate.description,
                files: [file],
            });

            setStatus("success");
            setStatusMessage("Shared successfully");
            resetStatus();
        } catch (error) {
            if (error instanceof ExportCancelledError) return;
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
    }, [accentColor, beginExport, canNativeShare, ensureNotCancelled, resetStatus, selectedTemplate, status, targetRef, template]);

    const { x, y, onDragEnd } = usePanelPosition("share-dock");

    return (
        <>
            <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] right-3 sm:bottom-10 sm:right-6 z-[70] flex flex-col items-end gap-3 pointer-events-auto">
                <AnimatePresence>
                    {status !== "idle" && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex items-center gap-2 rounded-[6px] nt-surface px-4 py-2"
                        >
                            {status === "progress" && (
                                <div
                                    className="size-4 animate-spin rounded-full border-2 border-[var(--fg)] border-t-transparent"
                                />
                            )}
                            {status === "success" && (
                                <Check className="size-4 text-[var(--success)]" strokeWidth={1.5} />
                            )}
                            {status === "error" && (
                                <AlertCircle className="size-4 text-[var(--error)]" strokeWidth={1.5} />
                            )}
                            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">
                                {statusMessage}
                            </span>
                            {status === "progress" && (
                                <button
                                    type="button"
                                    onClick={handleCancelExport}
                                    className="ml-1 rounded-[4px] border border-[var(--error)]/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--error)] hover:bg-[var(--error)]/10"
                                >
                                    ABORT
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsOpen(true)}
                    className="flex size-12 items-center justify-center te-button text-[var(--fg)] sm:size-14"
                    title="Share Moment"
                >
                    <Share2 className="size-5 sm:size-6" strokeWidth={1.5} />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    style={{ x, y }}
                    onDragEnd={onDragEnd}
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute top-24 right-[400px] z-[100] h-auto w-[280px] pb-3 te-module te-safe-panel"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header h-10 px-3">
                        <div className="flex items-center gap-2">
                            <span className="size-2 shrink-0 bg-[var(--fg)]" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg)]">
                                EXPORT_MOD
                            </span>
                        </div>
                        <div className="te-grip h-2.5 w-10 opacity-70" />
                        <button onClick={() => setIsOpen(false)} className="size-6 shrink-0 te-button rounded-[5px]" aria-label="Close">
                            <X className="size-3" strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="fade-up relative z-10 flex h-full flex-col space-y-4 px-4 py-4">

                        {/* Status readout */}
                        <div className="te-lcd flex h-[56px] shrink-0 flex-col justify-center gap-1 p-3">
                            <div className="flex items-center justify-between">
                                <span className="label leading-none">STATUS</span>
                                <span className="label leading-none">SYS_01</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {status === "idle" ? (
                                    <>
                                        <span className="size-2 shrink-0 bg-[var(--fg-faint)]" />
                                        <span className="font-mono text-[12px] tracking-wider text-[var(--fg)]">READY</span>
                                    </>
                                ) : status === "progress" ? (
                                    <>
                                        <span className="size-2 shrink-0 animate-pulse bg-[var(--accent)]" />
                                        <span className="font-mono text-[12px] tracking-wider text-[var(--fg)]">{statusMessage.toUpperCase()}</span>
                                    </>
                                ) : status === "success" ? (
                                    <>
                                        <span className="size-2 shrink-0 bg-[var(--success)]" />
                                        <span className="font-mono text-[12px] tracking-wider text-[var(--fg)]">{statusMessage.toUpperCase()}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="size-2 shrink-0 bg-[var(--error)]" />
                                        <span className="font-mono text-[12px] tracking-wider text-[var(--error)]">ERROR</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* CFG // TEMPLATE */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">TEMPLATE</span>
                            </div>
                            <div className="te-recessed flex gap-1.5 p-1.5">
                                {TEMPLATES.map((item) => {
                                    const active = item.id === template;
                                    const shortName = item.id === "mood-card" ? "MOOD" : item.id === "reflection-card" ? "REFL" : "CLIP";

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setTemplate(item.id)}
                                            className="h-9 flex-1 rounded-[5px] te-button text-[10px]"
                                            style={active ? {
                                                background: "var(--fg)",
                                                borderColor: "var(--fg)",
                                                color: "var(--bg)",
                                            } as React.CSSProperties : undefined}
                                        >
                                            {shortName}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="te-lcd px-2.5 py-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-[var(--fg-muted)]">
                                {selectedTemplate.description}
                            </div>
                        </section>

                        {/* EXE // RENDER */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">FORMAT</span>
                            </div>
                            <div className="te-recessed flex gap-1.5 p-1.5">
                                {[
                                    { id: "png" as const, label: "PNG", onClick: handleExportPNG, disabled: false },
                                    { id: "gif" as const, label: "GIF", onClick: handleExportGIF, disabled: false },
                                    { id: "webm" as const, label: "WEBM", onClick: handleExportWebM, disabled: false },
                                ].map((item) => {
                                    const active = activeFormat === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={item.onClick}
                                            disabled={item.disabled || status === "progress"}
                                            className="h-9 flex-1 rounded-[5px] te-button text-[10px] disabled:opacity-30"
                                            style={active ? {
                                                background: "var(--fg)",
                                                borderColor: "var(--fg)",
                                                color: "var(--bg)",
                                            } as React.CSSProperties : undefined}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {status === "progress" && (
                                <button
                                    type="button"
                                    onClick={handleCancelExport}
                                    className="h-9 rounded-[5px] te-button text-[10px] tracking-widest text-[var(--error)] hover:border-[var(--error)]"
                                >
                                    ABORT_RENDER
                                </button>
                            )}
                        </section>

                        <div className="flex-1" /> {/* Spacer */}

                        {/* NATIVE SHARE Button — primary go-action */}
                        <button
                            onClick={handleShareNative}
                            disabled={!canNativeShare || status === "progress"}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-[6px] te-button text-[12px] disabled:opacity-30"
                            style={canNativeShare ? {
                                background: "var(--accent)",
                                borderColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                            } as React.CSSProperties : undefined}
                        >
                            <Share2 className="size-[14px]" strokeWidth={1.5} />
                            <span className="tracking-widest">TRANSMIT</span>
                        </button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
