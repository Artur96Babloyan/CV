import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./play.css";

const playFont = Inter({
  subsets: ["latin"],
  variable: "--font-play",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio narrative | Artur Babloyan",
  description:
    "Vertical narrative CV with a live Three.js scene: lighting and camera respond as you scroll through sections.",
};

export default function PlayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`play-font-root ${playFont.variable}`}>{children}</div>;
}
