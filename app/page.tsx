"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { RiGlobalLine, RiMoonFill, RiSunFill } from "react-icons/ri";
import { SiGithub, SiNpm } from "react-icons/si";

const PRODUCT_LINKS = [
	{
		icon: <RiGlobalLine className="size-[15px] shrink-0" />,
		label: "xoboid.com",
		href: "https://xoboid.com",
	},
	{
		icon: <SiGithub className="size-[15px] shrink-0" />,
		label: "source",
		href: "https://github.com/x0bd/proto-0",
	},
	{
		icon: <SiNpm className="size-[17px] shrink-0" />,
		label: "@xoboid/avatar",
		href: "https://www.npmjs.com/package/@xoboid/avatar",
	},
];

export default function LandingPage() {
	const [mounted, setMounted] = React.useState(false);
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = mounted && resolvedTheme === "dark";

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-background text-foreground">
			<div
				className="pointer-events-none absolute inset-0 opacity-90"
				style={{
					background:
						"radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--te-yellow) 16%, transparent), transparent 28%), radial-gradient(circle at 50% 66%, color-mix(in srgb, var(--foreground) 6%, transparent), transparent 42%)",
				}}
			/>

			<header className="absolute left-4 top-[max(16px,env(safe-area-inset-top))] z-10 sm:left-7 sm:top-7">
				<div className="flex flex-col items-start gap-2">
					<div className="te-button h-12 px-5 cursor-default">
						<span className="logo-font text-[14px] font-bold tracking-[0.26em] text-[var(--te-yellow)]">
							DOT
						</span>
					</div>
					<div className="te-lcd px-3 py-1.5 shadow-sm">
						<span className="text-[9px] font-bold tracking-[0.22em] opacity-60">
							LOCAL_FIRST · BYOK
						</span>
					</div>
				</div>
			</header>

			<button
				type="button"
				onClick={() => setTheme(isDark ? "light" : "dark")}
				className="te-button absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-10 size-11 text-foreground/70 sm:right-7 sm:top-7"
				aria-label="Toggle theme"
				title="Toggle theme"
			>
				{isDark ? (
					<RiMoonFill className="size-[17px]" />
				) : (
					<RiSunFill className="size-[17px]" />
				)}
			</button>

			<section className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
				<div className="te-lcd px-4 py-2">
					<span className="text-[9px] font-bold tracking-[0.24em] opacity-55">
						COMPANION_OS
					</span>
				</div>

				<Link
					href="/companion"
					aria-label="Start Dot"
					className="te-button h-[72px] min-w-[204px] px-12 text-[14px] shadow-[0_22px_44px_rgba(0,0,0,0.14)]"
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

				<p className="max-w-[240px] text-[10px] font-mono font-bold uppercase leading-relaxed tracking-[0.18em] text-foreground/35">
					A small local-first AI companion for voice, memory, and mood.
				</p>
			</section>

			<nav
				aria-label="Product links"
				className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-10 flex flex-col items-end gap-2 rounded-[16px] sm:bottom-7 sm:right-7"
			>
				{PRODUCT_LINKS.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target="_blank"
						rel="noreferrer"
						className="te-button h-10 justify-start gap-2 px-3 text-foreground/62 hover:text-foreground"
						aria-label={`Open ${link.label}`}
						title={link.label}
					>
						{link.icon}
						<span className="font-mono text-[9px] font-bold uppercase leading-none tracking-[0.15em]">
							{link.label}
						</span>
					</a>
				))}
			</nav>
		</main>
	);
}
