"use client";

import React from "react";
import { motion } from "framer-motion";

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

export default function FinalCTA() {
  return (
    <section className="py-32 px-4 relative flex flex-col items-center text-center">
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none" />
      
      <div className="container mx-auto max-w-3xl relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-20 h-20 bg-primary pixel-border-primary flex items-center justify-center mb-8"
        >
          <span className="font-retro text-2xl text-white">CQ</span>
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Ready to Forge Your Destiny?
        </h2>
        <p className="text-lg text-muted mb-10 max-w-xl">
          Join 12,000+ developers shipping real code, building portfolios, and leveling up together.
        </p>
        
        <a href="https://code-city-pied.vercel.app/" className="bg-primary hover:bg-primary-hover text-white font-retro text-lg px-8 py-5 pixel-border-primary flex items-center gap-3 transition-all hover:-translate-y-1 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
          <GithubIcon />
          <span>START YOUR QUEST</span>
        </a>
        <p className="font-sans text-xs text-muted mt-4">Join in 60 seconds • No credit card required</p>
      </div>
    </section>
  );
}
