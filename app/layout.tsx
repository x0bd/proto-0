import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

const carbon = localFont({
	src: "../public/fonts/carbon/Carbon Regular.woff2",
	variable: "--font-carbon",
});

export const metadata: Metadata = {
	title: "Dot | Agentic Expressive Avatar",
	description:
		"Dot – a minimal, expressive avatar. Pure eyes and mouth, emotion through orientation. .",
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
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&family=Mochiy+Pop+One&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} ${carbon.variable} antialiased bg-background text-foreground`}
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
