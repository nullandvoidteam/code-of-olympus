"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-card border-t-2 border-border pt-16 pb-8 px-4">
      <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary pixel-border-primary flex items-center justify-center">
              <span className="font-retro text-[8px] text-white">CQ</span>
            </div>
            <span className="font-retro text-sm text-foreground">CodeQuest</span>
          </Link>
          <p className="text-muted text-sm max-w-xs mb-6">
            Code With a Party, Not a Playlist. The 16-bit RPG-themed SaaS platform that teaches coding through squad-based accountability.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted hover:text-primary transition-colors"><TwitterIcon /></Link>
            <Link href="#" className="text-muted hover:text-primary transition-colors"><GithubIcon /></Link>
            <Link href="#" className="text-muted hover:text-primary transition-colors"><MessageSquare className="w-5 h-5" /></Link>
          </div>
        </div>

        <div>
          <h4 className="font-retro text-[10px] text-foreground mb-4">PRODUCT</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-retro text-[10px] text-foreground mb-4">COMPANY</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-retro text-[10px] text-foreground mb-4">LEGAL</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto max-w-6xl pt-8 border-t border-border/50 text-center text-xs text-muted flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© {new Date().getFullYear()} CodeQuest Inc. All rights reserved.</span>
        <span className="font-retro text-[8px]">v1.0.0 "SYNTAX CRUSADE"</span>
      </div>
    </footer>
  );
}
