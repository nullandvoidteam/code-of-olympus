import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-retro",
  weight: "400",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/ThemeContext";

export const metadata: Metadata = {
  title: "CodeQuest | Start Your Quest",
  description: "Code With a Party, Not a Playlist. Join the 16-bit RPG-themed SaaS platform that teaches coding through squad-based accountability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart.variable} h-full antialiased`} style={{ colorScheme: 'dark' }}>
      <body className="min-h-full font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
