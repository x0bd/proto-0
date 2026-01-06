import type { Metadata } from "next";
import localFont from "next/font/local";
import { Doto } from "next/font/google"; // Doto for digital/matrix display headers
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

// Departure Mono: The "Traf" / Terminal aesthetic backbone
const departureMono = localFont({
	src: "../public/fonts/DepartureMono-Regular.woff2",
	variable: "--font-departure",
	display: "swap",
});

// Doto: For digital/retro-futuristic headings
const doto = Doto({
	variable: "--font-doto",
	subsets: ["latin"],
	weight: ["400", "700"], // Normal and Bold for headers
});

export const metadata: Metadata = {
	title: "Kokoro | 心",
	description:
		"Kokoro – a minimal, expressive avatar. Pure eyes and mouth, emotion through orientation. 心。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${departureMono.variable} ${doto.variable} antialiased bg-background text-foreground`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
