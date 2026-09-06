"use client";

import React from "react";
import Link from "./NextLink";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Guilds", href: "#guilds" },
];

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b-2 border-border pixel-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary pixel-border-primary flex items-center justify-center">
            <span className="font-retro text-xs text-white">CQ</span>
          </div>
          <span className="font-retro text-lg text-foreground group-hover:text-primary transition-colors">
            CodeQuest
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative font-retro text-xs text-muted hover:text-foreground transition-colors py-2 group"
            >
              {link.name}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              />
            </Link>
          ))}
          
          {/* Theme Switcher for Demo */}
          <div className="flex gap-2 ml-4">
            {(["cyberpunk", "space", "spartan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-4 h-4 rounded-full border-2 ${
                  theme === t ? "border-primary" : "border-border"
                } ${
                  t === "cyberpunk" ? "bg-[#d946ef]" :
                  t === "space" ? "bg-[#3b82f6]" : "bg-[#dc2626]"
                }`}
                title={`Switch to ${t} theme`}
              />
            ))}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="#" onClick={(e: any) => { e.preventDefault(); window.dispatchEvent(new Event('navigate-auth')) }}
            className="hidden sm:block font-retro text-xs text-foreground hover:text-primary transition-colors"
          >
            Log In
          </Link>
          <Link
            href="#" onClick={(e: any) => { e.preventDefault(); window.dispatchEvent(new Event('navigate-auth')) }}
            className="bg-primary hover:bg-primary-hover text-white font-retro text-xs px-4 py-2 pixel-border-primary flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <GithubIcon />
            <span>Start Quest</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
