"use client";

import React from "react";
import Image from "./NextImage";
import { motion } from "framer-motion";
import { PlayCircle, Shield, Users, Sword } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none" />

      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column: Copy */}
        <div className="flex flex-col items-start gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-card pixel-border border-border text-accent font-retro text-[10px]"
          >
            <Sword className="w-3 h-3" />
            <span>SEASON 1: THE SYNTAX CRUSADE IS LIVE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            90% of Coders Quit Alone. <br />
            <span className="text-primary font-retro text-3xl md:text-4xl lg:text-5xl block mt-4">Yours Won't.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted max-w-xl"
          >
            CodeQuest is a 16-bit RPG-themed SaaS platform that teaches coding through squad-based accountability, gamified challenges, and real GitHub portfolio output.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mt-4"
          >
            <a href="#" onClick={(e: any) => { e.preventDefault(); window.dispatchEvent(new Event('navigate-auth')) }} className="bg-primary hover:bg-primary-hover text-white font-retro text-sm px-6 py-4 pixel-border-primary transition-all hover:-translate-y-1 active:translate-y-0 group">
              Start Your Quest — Free
              <span className="block text-[10px] opacity-70 mt-1 font-sans">No credit card required</span>
            </a>
            <a href="#" onClick={(e: any) => { e.preventDefault(); window.dispatchEvent(new Event('navigate-auth')) }} className="bg-card hover:bg-border text-foreground font-retro text-sm px-6 py-4 pixel-border flex items-center gap-2 transition-all">
              <PlayCircle className="w-5 h-5" />
              Watch Demo
            </a>
          </motion.div>

          {/* Social Proof Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 flex items-center gap-6 text-sm text-muted"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span><strong className="text-foreground">12,400+</strong> Guilds</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span><strong className="text-foreground">850k+</strong> Commits</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square max-w-2xl">
            {/* Glow Effect behind image */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 w-full h-full pixel-border border-border bg-card overflow-hidden">
               {/* We use the generated pixel art image here. Since it's in the artifact dir, we'll assume we can copy it to public or just use a placeholder if we were building for real, but for this demo I will use an absolute path for local viewing or a placeholder block. Wait, the prompt says "visual: animated/static mockup". I will create a placeholder layout that resembles the HUD since Next.js Image needs static paths or configured domains. */}
               <div className="w-full h-8 bg-border flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500" />
                 <div className="w-3 h-3 rounded-full bg-green-500" />
                 <span className="ml-4 font-retro text-[10px] text-muted">player_hud.exe</span>
               </div>
               
               {/* HUD Content Simulation */}
               <div className="p-4 grid grid-cols-3 gap-4 h-[calc(100%-2rem)]">
                 <div className="col-span-1 space-y-4">
                   <div className="bg-background pixel-border p-2">
                     <p className="font-retro text-[8px] text-muted mb-1">XP</p>
                     <div className="w-full h-2 bg-border"><div className="w-3/4 h-full bg-secondary" /></div>
                     <p className="font-retro text-[8px] text-muted mt-2 mb-1">PARTY HEALTH</p>
                     <div className="w-full h-2 bg-border"><div className="w-full h-full bg-primary" /></div>
                   </div>
                   <div className="bg-background pixel-border p-2 h-32 flex items-center justify-center">
                     <span className="font-retro text-xs text-muted text-center">CLASS<br/>AVATAR</span>
                   </div>
                 </div>
                 <div className="col-span-2 space-y-4 flex flex-col">
                   <div className="bg-background pixel-border p-2 flex-grow">
                     <p className="font-retro text-[10px] text-accent mb-2">DAILY QUESTS</p>
                     <ul className="space-y-2">
                       <li className="flex items-center gap-2 text-xs font-mono"><input type="checkbox" readOnly checked className="accent-primary"/> Defeat 'NullPointerException' Boss</li>
                       <li className="flex items-center gap-2 text-xs font-mono"><input type="checkbox" readOnly className="accent-primary"/> Push 2 commits to Forge</li>
                       <li className="flex items-center gap-2 text-xs font-mono"><input type="checkbox" readOnly className="accent-primary"/> Heal Party Member (Review PR)</li>
                     </ul>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
