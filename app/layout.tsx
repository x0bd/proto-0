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

// Doto: Digital/Matrix display font for branding
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
				className={`${departureMono.variable} ${doto.variable} antialiased bg-background text-foreground`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<SidebarProvider>
						<SidebarInset>
							{children}
						</SidebarInset>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
