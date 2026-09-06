"use client";

import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "My guild wouldn't let me skip a day. We shipped 3 full-stack apps in a month.",
    author: "Alex",
    role: "Lvl 12 Fullstack Wizard",
    stats: "Shipped 3 Projects",
    avatarColor: "bg-blue-500",
  },
  {
    quote: "Leetcode felt pointless. Here, I actually have a GitHub history to show employers.",
    author: "Sam",
    role: "Lvl 8 Backend Paladin",
    stats: "150+ Commits",
    avatarColor: "bg-green-500",
  },
  {
    quote: "The cyberpunk theme makes staring at code at 2 AM actually enjoyable.",
    author: "Jordan",
    role: "Lvl 15 Frontend Rogue",
    stats: "Guild Leader",
    avatarColor: "bg-pink-500",
  },
];

export default function SocialProof() {
  return (
    <section id="guilds" className="py-24 px-4 bg-card border-y-2 border-border relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">HALL OF FAME</h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background pixel-border">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-retro text-xs text-muted">Guilds Active Right Now: <span className="text-foreground">1,337</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((test, i) => (
            <motion.div
              key={test.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background pixel-border p-6 relative"
            >
              <div className="text-4xl text-primary/20 absolute top-4 left-4 font-serif">"</div>
              <p className="text-muted relative z-10 mb-6 italic">{test.quote}</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-10 h-10 ${test.avatarColor} pixel-border flex items-center justify-center`}>
                  <span className="font-retro text-[8px] text-white">IMG</span>
                </div>
                <div>
                  <div className="font-bold text-foreground">{test.author}</div>
                  <div className="text-xs text-accent font-retro">{test.role}</div>
                  <div className="text-xs text-muted mt-1">{test.stats}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
