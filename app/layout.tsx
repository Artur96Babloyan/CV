import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artur Babloyan - Senior Frontend Developer",
  description:
    "Frontend Developer with 3+ years of experience building scalable, high-performance web applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
