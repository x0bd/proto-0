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
	const { theme, setTheme } = useTheme();
	const isDark = mounted && theme === "dark";

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-background text-foreground">
			<div
				className="pointer-events-none absolute inset-0 opacity-80"
				style={{
					background:
						"radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--te-yellow) 11%, transparent), transparent 30%)",
				}}
			/>

			<header className="absolute left-4 top-[max(16px,env(safe-area-inset-top))] z-10 sm:left-7 sm:top-7">
				<div className="flex flex-col items-start gap-2">
					<div className="te-button h-11 px-5 cursor-default">
						<span className="logo-font text-[13px] font-bold tracking-[0.24em] text-[var(--te-yellow)]">
							DOT
						</span>
					</div>
					<div className="te-lcd px-3 py-1.5">
						<span className="text-[9px] font-bold tracking-[0.22em] opacity-60">
							LOCAL_FIRST
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

			<Link
				href="/companion"
				aria-label="Start Dot"
				className="te-button relative z-10 h-16 min-w-[180px] px-10 text-[13px] shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
				style={{
					backgroundColor: "var(--te-yellow)",
					borderColor: "color-mix(in srgb, var(--te-yellow) 78%, black)",
					borderBottomColor:
						"color-mix(in srgb, var(--te-yellow) 56%, black)",
					color: "#111111",
				}}
			>
				START
			</Link>

			<nav
				aria-label="Product links"
				className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-10 flex flex-col items-end gap-2 sm:bottom-7 sm:right-7"
			>
				{PRODUCT_LINKS.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target="_blank"
						rel="noreferrer"
						className="te-button h-10 justify-start gap-2 px-3 text-foreground/70 hover:text-foreground"
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
