"use client";

import React from "react";
import { motion } from "framer-motion";
import { Skull } from "lucide-react";

export default function BossBanner() {
  return (
    <section className="py-12 px-4 bg-primary text-white border-y-4 border-primary-hover relative overflow-hidden">
      {/* Warning Stripes Background */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#000_20px,#000_40px)]" />
      
      <div className="container mx-auto max-w-4xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="flex items-center gap-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="hidden md:flex w-16 h-16 bg-black pixel-border border-black items-center justify-center text-primary shrink-0"
          >
            <Skull className="w-8 h-8" />
          </motion.div>
          <div>
            <h2 className="font-retro text-xl md:text-2xl mb-2 flex items-center justify-center md:justify-start gap-2">
              <span className="text-yellow-400">WARNING:</span> YOUR SQUAD IS WAITING
            </h2>
            <p className="font-sans text-white/80">
              Don't leave them hanging. The next boss battle starts soon.
            </p>
          </div>
        </div>
        
        <a href="https://code-city-pied.vercel.app/" className="bg-black hover:bg-black/80 text-primary font-retro text-sm px-8 py-4 pixel-border border-black transition-transform hover:scale-105 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          JOIN BATTLE
        </a>
      </div>
    </section>
  );
}
