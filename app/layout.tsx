import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

/* ─── Main: Carbon — display, headings, hero moments ─── */
const carbon = localFont({
	src: "../public/fonts/carbon/Carbon Regular.woff2",
	variable: "--font-carbon",
	display: "swap",
});

/* ─── Secondary: Departure Mono — labels, data, body ─── */
const departureMono = localFont({
	src: "../public/fonts/carbon/DepartureMono-1.500/DepartureMono-1.500/DepartureMono-Regular.woff2",
	variable: "--font-departure",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Dot | Agentic Expressive Avatar",
	description:
		"Dot – a minimal, expressive avatar. Pure eyes and mouth, emotion through orientation.",
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${carbon.variable} ${departureMono.variable} antialiased bg-background text-foreground`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
