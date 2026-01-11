import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

// Doto: Digital/Matrix display font for branding elements (心)
const doto = localFont({
	src: "../public/fonts/Doto-VariableFont_ROND,wght.ttf",
	variable: "--font-doto",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Kokoro | 心",
	description:
		"Kokoro – a minimal, expressive avatar. Pure eyes and mouth, emotion through orientation. 心。",
};

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} ${doto.variable} antialiased bg-background text-foreground`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<SidebarProvider>
						{children}
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
