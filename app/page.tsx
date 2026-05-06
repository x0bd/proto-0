import Link from "next/link";

export default function LandingPage() {
	return (
		<main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-background text-foreground">
			<div
				className="absolute inset-0 pointer-events-none opacity-70"
				style={{
					background:
						"radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--te-yellow) 18%, transparent), transparent 34%), radial-gradient(circle at 50% 55%, color-mix(in srgb, var(--foreground) 6%, transparent), transparent 52%)",
				}}
			/>
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.035]"
				style={{
					backgroundImage:
						"linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}}
			/>

			<Link
				href="/companion"
				aria-label="Enter Dot"
				className="te-button relative z-10 h-16 min-w-[172px] px-10 text-[13px] shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
				style={{
					backgroundColor: "var(--te-yellow)",
					borderColor: "color-mix(in srgb, var(--te-yellow) 78%, black)",
					borderBottomColor:
						"color-mix(in srgb, var(--te-yellow) 56%, black)",
					color: "#111111",
				}}
			>
				ENTER
			</Link>
		</main>
	);
}
