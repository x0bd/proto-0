"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SiGithub, SiNpm } from "react-icons/si";
import type { FaceVariant } from "@/app/components/face/types";

const Avatar = dynamic(() => import("@/app/components/Avatar"), {
	ssr: false,
	loading: () => <div className="size-full" />,
});

/* Indigo ink — the avatar reads as a solid pixel glyph on the bone canvas */
const INK = "#1A1B52";

const FACES: { id: FaceVariant; label: string }[] = [
	{ id: "minimal", label: "PURE" },
	{ id: "tron", label: "DIGITAL" },
	{ id: "analogue", label: "SKETCH" },
];

const FEATURES = [
	{ n: "01", title: "VOICE PIPELINE", desc: "Speech → AI → synthesised reply" },
	{ n: "02", title: "PERSISTENT MEMORY", desc: "Recalls you across sessions" },
	{ n: "03", title: "PERSONA SYSTEM", desc: "Four tunable personalities" },
] as const;

const LINKS = [
	{ icon: <SiGithub className="size-[13px]" />, href: "https://github.com/x0bd/proto-0", label: "source" },
	{ icon: <SiNpm className="size-[14px]" />, href: "https://www.npmjs.com/package/@xoboid/avatar", label: "npm" },
];

/* Thin register mark — Permitify-style corner crosshair */
function Plus({ className }: { className: string }) {
	return (
		<span
			className={`pointer-events-none absolute select-none font-mono text-[14px] leading-none text-[var(--fg-faint)] ${className}`}
		>
			+
		</span>
	);
}

export default function LandingPage() {
	const [face, setFace] = React.useState<FaceVariant>("tron");

	return (
		<main className="flex min-h-dvh flex-col bg-background text-foreground sm:h-dvh sm:overflow-hidden">

			{/* ─── Top bar ─────────────────────────────────────────── */}
			<header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--hair)] px-5 sm:px-7">
				<span
					className="text-[16px] tracking-[0.04em] text-[var(--fg)]"
					style={{ fontFamily: "var(--font-display)" }}
				>
					DOT
				</span>

				<nav className="hidden items-center gap-8 sm:flex">
					{(["COMPANION", "MEMORY", "KEYS"] as const).map((l) => (
						<span key={l} className="label cursor-default select-none transition-colors hover:text-[var(--fg-muted)]">
							{l}
						</span>
					))}
				</nav>

				<div className="flex items-center gap-4">
					<div className="hidden items-center gap-2 sm:flex">
						{/* lime status square — geometry, the canonical accent use on bone */}
						<span className="size-[7px] bg-[var(--accent)]" />
						<span className="label">LOCAL · BYOK</span>
					</div>
					{LINKS.map((l) => (
						<a
							key={l.label}
							href={l.href}
							target="_blank"
							rel="noreferrer"
							aria-label={l.label}
							className="text-[var(--fg-faint)] transition-colors hover:text-[var(--fg)]"
						>
							{l.icon}
						</a>
					))}
				</div>
			</header>

			{/* ─── Split ───────────────────────────────────────────── */}
			<div className="grid flex-1 grid-cols-1 sm:min-h-0 sm:grid-cols-[45fr_55fr]">

				{/* ── Left: bone canvas, indigo avatar ── */}
				<section className="relative flex h-[40vh] flex-col overflow-hidden border-b border-[var(--hair)] sm:h-auto sm:border-b-0 dot-grid-subtle">
					<Plus className="left-4 top-4" />
					<Plus className="right-4 top-4" />
					<Plus className="bottom-4 left-4" />
					<Plus className="right-4 bottom-4" />

					{/* fig label */}
					<div className="absolute left-5 top-5">
						<span className="label">FIG.01 — COMPANION</span>
					</div>

					{/* avatar fills the field, centered */}
					<div className="flex min-h-0 flex-1 items-center justify-center px-8 py-6">
						<Avatar
							variant={face}
							accentColor={INK}
							emotion={{ joy: 0.2, sadness: 0, surprise: 0.05, anger: 0, curiosity: 0.5 }}
						/>
					</div>

					{/* face picker */}
					<div className="flex shrink-0 items-center justify-center gap-1.5 pb-5">
						{FACES.map((f) => {
							const active = face === f.id;
							return (
								<button
									key={f.id}
									type="button"
									onClick={() => setFace(f.id)}
									className="label h-7 border px-3 transition-colors"
									style={
										active
											? { background: INK, color: "var(--bg)", borderColor: INK }
											: { borderColor: "var(--hair-2)", color: "var(--fg-muted)" }
									}
								>
									{f.label}
								</button>
							);
						})}
					</div>
				</section>

				{/* ── Right: indigo band content card ── */}
				<section
					className="band relative flex flex-col gap-7 px-6 py-7 sm:justify-between sm:gap-0 sm:px-11 sm:py-10"
					style={{
						clipPath:
							"polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)",
					}}
				>
					{/* top label */}
					<span className="label">COMPANION_OS — v0.1</span>

					{/* core */}
					<div className="flex flex-col gap-6 sm:gap-8">
						<h1
							className="leading-[0.92] tracking-[-0.01em] text-[var(--bg)]"
							style={{
								fontFamily: "var(--font-display)",
								fontSize: "clamp(2.2rem, 5vw, 4rem)",
							}}
						>
							A SMALL
							<br />
							AI COMPANION
						</h1>

						<p className="max-w-[44ch] font-mono text-[12px] leading-relaxed text-[rgba(235,235,235,0.55)]">
							A local-first AI companion for voice, memory and mood. Bring your
							own keys — nothing leaves the device.
						</p>

						{/* numbered feature list */}
						<div className="flex flex-col">
							{FEATURES.map((f) => (
								<div
									key={f.n}
									className="flex items-center gap-4 border-t border-[rgba(235,235,235,0.14)] py-2.5 last:border-b"
								>
									<span className="font-mono text-[11px] tracking-[0.06em] text-[rgba(235,235,235,0.4)]">
										[{f.n}]
									</span>
									<span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--bg)]">
										{f.title}
									</span>
									<span className="ml-auto hidden font-mono text-[11px] text-[rgba(235,235,235,0.4)] sm:inline">
										{f.desc}
									</span>
								</div>
							))}
						</div>

						{/* CTA — the one lime moment */}
						<div className="flex items-center gap-5">
							<Link
								href="/companion"
								className="flex h-12 items-center justify-center px-11 font-mono text-[12px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-[var(--accent-hover)]"
								style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
							>
								START
							</Link>
							<span className="hidden font-mono text-[11px] uppercase tracking-[0.1em] text-[rgba(235,235,235,0.35)] sm:inline">
								→ /companion
							</span>
						</div>
					</div>

					{/* pagination / sig */}
					<div className="hidden items-end justify-between sm:flex">
						<span
							className="text-[15px] tracking-widest text-[rgba(235,235,235,0.3)]"
							style={{ fontFamily: "var(--font-display)" }}
						>
							01
						</span>
						<span className="label text-[rgba(235,235,235,0.3)]">
							BUILT BY XOBOID
						</span>
						<span
							className="text-[15px] tracking-widest text-[rgba(235,235,235,0.3)]"
							style={{ fontFamily: "var(--font-display)" }}
						>
							/03
						</span>
					</div>
				</section>
			</div>
		</main>
	);
}
