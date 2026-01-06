import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

// Departure Mono: The "Traf" / Terminal aesthetic backbone
const departureMono = localFont({
	src: "../public/fonts/DepartureMono-Regular.woff2",
	variable: "--font-departure",
	display: "swap",
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
			<head>
				{/* Google Fonts Preconnect for Doto */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</head>
			<body
				className={`${departureMono.variable} antialiased bg-background text-foreground`}
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
