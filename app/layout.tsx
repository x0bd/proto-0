import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
	variable: "--font-noto-sans-jp",
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "夢見るアバター | Dreaming Avatar",
	description:
		"A vaporous, expressive avatar that reacts to emotions with beautiful GSAP animations. 感情的な表現を持つ夢のようなアバター。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
