"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { SiGithub, SiNpm } from "react-icons/si";
import type { FaceVariant } from "@/app/components/face/types";

const Avatar = dynamic(() => import("@/app/components/Avatar"), {
	ssr: false,
	loading: () => <div className="size-full" />,
});

const FACES: { id: FaceVariant; label: string }[] = [
	{ id: "minimal", label: "PURE" },
	{ id: "tron", label: "DIGITAL" },
	{ id: "analogue", label: "SKETCH" },
];

const FEATURES = [
	{
		n: "01",
		title: "VOICE PIPELINE",
		desc: "Speech → AI inference → synthesised voice at sub-second latency",
	},
	{
		n: "02",
		title: "PERSISTENT MEMORY",
		desc: "Every session writes to a local store DOT reads from on next open",
	},
	{
		n: "03",
		title: "PERSONA SYSTEM",
		desc: "Four AI personalities with tunable expressiveness and directness",
	},
] as const;

const LINKS = [
	{
		icon: <SiGithub className="size-[13px]" />,
		href: "https://github.com/x0bd/proto-0",
		label: "source",
	},
	{
		icon: <SiNpm className="size-[14px]" />,
		href: "https://www.npmjs.com/package/@xoboid/avatar",
		label: "@xoboid/avatar",
	},
];

function CornerMark({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
	const borders: Record<typeof position, string> = {
		tl: "top-4 left-4 border-t-2 border-l-2",
		tr: "top-4 right-4 border-t-2 border-r-2",
		bl: "bottom-4 left-4 border-b-2 border-l-2",
		br: "bottom-4 right-4 border-b-2 border-r-2",
	};
	return (
		<div
			className={`pointer-events-none absolute size-[18px] border-[var(--te-orange)] opacity-30 ${borders[position]}`}
		/>
	);
}

export default function LandingPage() {
	const [mounted, setMounted] = React.useState(false);
	const [face, setFace] = React.useState<FaceVariant>("tron");
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = mounted && resolvedTheme === "dark";

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		/*
		 * Mobile:  min-h-dvh, no overflow-hidden → page scrolls naturally
		 * Desktop: h-dvh overflow-hidden → locked two-column split
		 */
		<main className="flex min-h-dvh flex-col bg-background text-foreground sm:h-dvh sm:overflow-hidden">
			{/* ── Top Navigation ─────────────────────────────────── */}
			<header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--panel-border)] px-4 sm:px-7">
				<div className="te-button h-7 cursor-default px-3.5">
					<span className="font-mono text-[11px] font-bold tracking-[0.28em] text-[var(--te-yellow)]">
						DOT
					</span>
				</div>

				{/* Center nav — desktop only */}
				<nav className="hidden items-center gap-7 sm:flex">
					{(["COMPANION", "MEMORY", "KEYS"] as const).map((label) => (
						<span
							key={label}
							className="cursor-default select-none font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-foreground/40 transition-colors hover:text-foreground/70"
						>
							{label}
						</span>
					))}
				</nav>

				<div className="flex items-center gap-2">
					{LINKS.map((l) => (
						<a
							key={l.label}
							href={l.href}
							target="_blank"
							rel="noreferrer"
							className="te-button size-7 text-foreground/45 hover:text-foreground"
							aria-label={l.label}
						>
							{l.icon}
						</a>
					))}
					<button
						type="button"
						onClick={() => setTheme(isDark ? "light" : "dark")}
						className="te-button size-7 text-foreground/45 hover:text-foreground"
						aria-label="Toggle theme"
					>
						{isDark ? (
							<RiMoonFill className="size-[13px]" />
						) : (
							<RiSunFill className="size-[13px]" />
						)}
					</button>
				</div>
			</header>

			{/* ── Main grid ──────────────────────────────────────── */}
			{/*
			 * Mobile:  single column, natural height
			 * Desktop: two columns, flex-1 fills remaining viewport
			 */}
			<div className="grid flex-1 grid-cols-1 sm:min-h-0 sm:grid-cols-[5fr_6fr]">

				{/* ── Left: Avatar Panel ── */}
				{/*
				 * Mobile:  fixed height so avatar has dedicated space
				 * Desktop: fills the grid cell height via stretch
				 */}
				<div className="relative flex h-[42vh] flex-col overflow-hidden border-b border-[var(--panel-border)] sm:h-auto sm:border-b-0 sm:border-r">

					{/* Dot grid background */}
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.03]"
						style={{
							backgroundImage:
								"radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
							backgroundSize: "28px 28px",
						}}
					/>

					{/* Corner crosshairs */}
					<CornerMark position="tl" />
					<CornerMark position="tr" />
					<CornerMark position="bl" />
					<CornerMark position="br" />

					{/* Avatar — fills width, centered vertically in flex-1 */}
					<div className="flex min-h-0 flex-1 items-center justify-center px-4 py-3">
						<Avatar
							variant={face}
							accentColor="var(--te-orange)"
							emotion={{
								joy: 0.2,
								sadness: 0,
								surprise: 0.05,
								anger: 0,
								curiosity: 0.5,
							}}
						/>
					</div>

					{/* Face type picker */}
					<div className="flex shrink-0 items-center justify-center gap-2 border-t border-[var(--panel-border)] px-4 py-2.5">
						{FACES.map((f) => {
							const active = face === f.id;
							return (
								<button
									key={f.id}
									type="button"
									onClick={() => setFace(f.id)}
									className="te-button h-7 px-3 text-[9px] transition-colors"
									style={
										active
											? {
													backgroundColor: "var(--te-orange)",
													borderColor:
														"color-mix(in srgb, var(--te-orange) 78%, black)",
													borderBottomColor:
														"color-mix(in srgb, var(--te-orange) 56%, black)",
													color: "#fff",
												}
											: {}
									}
								>
									{f.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* ── Right: Content Panel ── */}
				{/*
				 * Mobile:  natural height, compact spacing, desc text hidden
				 * Desktop: flex justify-between fills the grid cell
				 */}
				<div className="relative flex flex-col gap-6 px-5 py-5 sm:justify-between sm:gap-0 sm:px-12 sm:py-10">

					{/* Top-right corner mark — desktop only */}
					<div className="absolute right-5 top-5 hidden size-[18px] border-r-2 border-t-2 border-[var(--te-orange)] opacity-25 sm:block" />

					{/* Status badge */}
					<div className="te-lcd w-fit px-2.5 py-1">
						<span className="text-[8px] font-bold tracking-[0.26em] opacity-50">
							COMPANION_OS · v0.1
						</span>
					</div>

					{/* Core content */}
					<div className="flex flex-col gap-4 sm:gap-8">
						{/* Headline — scales from mobile to desktop */}
						<h1
							className="font-bold leading-[0.9] tracking-[-0.01em] text-foreground"
							style={{
								fontFamily: "var(--font-display)",
								fontSize: "clamp(2rem, 9vw, 4.4rem)",
							}}
						>
							A SMALL
							<br />
							<span style={{ color: "var(--te-orange)" }}>AI</span>
							<br />
							COMPANION
						</h1>

						{/* Feature list */}
						<div className="flex flex-col">
							{FEATURES.map((f) => (
								<div
									key={f.n}
									className="flex items-start gap-4 border-b border-[var(--panel-border)] py-2 first:border-t sm:py-3"
								>
									<span
										className="mt-0.5 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.22em]"
										style={{ color: "var(--te-orange)", opacity: 0.75 }}
									>
										[{f.n}]
									</span>
									<div className="flex flex-col gap-0.5">
										<span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/80">
											{f.title}
										</span>
										{/* Desc hidden on mobile to save space */}
										<span className="hidden font-mono text-[9px] leading-relaxed text-foreground/35 sm:block">
											{f.desc}
										</span>
									</div>
								</div>
							))}
						</div>

						{/* CTA */}
						<div className="flex items-center gap-4">
							<Link
								href="/companion"
								className="te-button h-12 px-10 text-[12px]"
								style={{
									backgroundColor: "var(--te-yellow)",
									borderColor:
										"color-mix(in srgb, var(--te-yellow) 78%, black)",
									borderBottomColor:
										"color-mix(in srgb, var(--te-yellow) 56%, black)",
									color: "#111111",
								}}
							>
								START
							</Link>
							{/* Arrow hint — desktop only */}
							<span className="hidden font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/25 sm:inline">
								→ /companion
							</span>
						</div>
					</div>

					{/* Pagination — desktop only */}
					<div className="hidden items-end justify-between sm:flex">
						<span className="font-mono text-[13px] font-bold tracking-widest text-foreground/15">
							1
						</span>
						<span className="font-mono text-[13px] font-bold tracking-widest text-foreground/15">
							/3
						</span>
					</div>
				</div>
			</div>

			{/* ── Bottom Status Bar ──────────────────────────────── */}
			<footer className="flex h-9 shrink-0 items-center justify-between border-t border-[var(--panel-border)] px-4 sm:px-7">
				<a
					href="https://xoboid.com"
					target="_blank"
					rel="noreferrer"
					className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-foreground/30 transition-opacity hover:text-foreground/60"
				>
					XOBOID.COM
				</a>
				<div className="te-lcd px-2.5 py-1">
					<span className="text-[8px] font-bold tracking-[0.22em] opacity-50">
						LOCAL_FIRST · BYOK
					</span>
				</div>
			</footer>
		</main>
	);
}
