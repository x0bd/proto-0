"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { SiGithub, SiNpm } from "react-icons/si";

const Avatar = dynamic(() => import("@/app/components/Avatar"), {
	ssr: false,
	loading: () => <div className="size-full" />,
});

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

function CornerMark({
	position,
}: {
	position: "tl" | "tr" | "bl" | "br";
}) {
	const base = "absolute size-[18px] border-[var(--te-orange)] opacity-35";
	const borders: Record<typeof position, string> = {
		tl: "top-4 left-4 border-t-2 border-l-2",
		tr: "top-4 right-4 border-t-2 border-r-2",
		bl: "bottom-4 left-4 border-b-2 border-l-2",
		br: "bottom-4 right-4 border-b-2 border-r-2",
	};
	return <div className={`${base} ${borders[position]}`} />;
}

export default function LandingPage() {
	const [mounted, setMounted] = React.useState(false);
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = mounted && resolvedTheme === "dark";

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<main className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
			{/* ── Top Navigation ─────────────────────────────────── */}
			<header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--panel-border)] px-5 sm:px-7">
				{/* Brand */}
				<div className="te-button h-7 cursor-default px-3.5">
					<span className="font-mono text-[11px] font-bold tracking-[0.28em] text-[var(--te-yellow)]">
						DOT
					</span>
				</div>

				{/* Center links */}
				<nav className="hidden items-center gap-7 sm:flex">
					{(["COMPANION", "MEMORY", "KEYS"] as const).map((label) => (
						<span
							key={label}
							className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-foreground/40 transition-colors hover:text-foreground/70 cursor-default select-none"
						>
							{label}
						</span>
					))}
				</nav>

				{/* Actions */}
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

			{/* ── Main Two-Column ────────────────────────────────── */}
			<div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[5fr_6fr]">
				{/* ── Left: Avatar Panel ── */}
				<div className="relative flex h-[38vh] items-center justify-center overflow-hidden border-b border-[var(--panel-border)] sm:h-auto sm:border-b-0 sm:border-r">
					{/* Subtle dot grid */}
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.035]"
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

					{/* Avatar — "Digital" (tron) preset = robot */}
					<div className="relative w-[75%] max-w-[380px] aspect-square sm:w-[80%]">
						<Avatar
							variant="tron"
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

					{/* Mode label */}
					<div className="absolute bottom-4 left-0 right-0 flex justify-center">
						<div className="te-lcd px-2.5 py-1">
							<span className="text-[8px] font-bold tracking-[0.24em] opacity-45">
								DIGITAL · IDLE
							</span>
						</div>
					</div>
				</div>

				{/* ── Right: Content Panel ── */}
				<div className="relative flex flex-col justify-between overflow-hidden px-7 py-6 sm:px-12 sm:py-10">
					{/* Top-right corner mark */}
					<div className="absolute right-5 top-5 size-[18px] border-r-2 border-t-2 border-[var(--te-orange)] opacity-25" />

					{/* Status badge */}
					<div>
						<div className="te-lcd w-fit px-2.5 py-1">
							<span className="text-[8px] font-bold tracking-[0.26em] opacity-50">
								COMPANION_OS · v0.1
							</span>
						</div>
					</div>

					{/* Core content */}
					<div className="flex flex-col gap-6 sm:gap-8">
						{/* Headline */}
						<h1
							className="font-bold leading-[0.9] tracking-[-0.01em] text-foreground"
							style={{
								fontFamily: "var(--font-display)",
								fontSize: "clamp(2.6rem, 5.8vw, 4.4rem)",
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
									className="flex items-start gap-4 border-b border-[var(--panel-border)] py-3 first:border-t"
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
										<span className="font-mono text-[9px] leading-relaxed text-foreground/35">
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
							<span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/25">
								→ /companion
							</span>
						</div>
					</div>

					{/* Pagination */}
					<div className="flex items-end justify-between">
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
			<footer className="flex h-9 shrink-0 items-center justify-between border-t border-[var(--panel-border)] px-5 sm:px-7">
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
