"use client";

import React from "react";
import { Users, Hammer, MonitorSmartphone, Trophy, Code2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const usps = [
  {
    icon: Users,
    title: "The Social-Obligation Engine",
    desc: "Squad-based Party Health Bar. Missed bounties and skipped days damage the whole guild. Peer pressure works.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Hammer,
    title: "The Blueprint Forge",
    desc: "XP unlocks real Blueprint Projects. Build them in our IDE, pass the automated tests, and push them live to your GitHub.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: MonitorSmartphone,
    title: "Immersive Multiverse",
    desc: "Choose your world (Spartan, Space, Cyberpunk) and re-skin your entire workspace. Aesthetics matter when you're grinding.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Trophy,
    title: "Global Rankings & Sorting",
    desc: "Climb the Global Leaderboards and dynamically sort your Practice Arena challenges to always find the perfect match for your skill level.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Code2,
    title: "Dynamic Language Scaffolding",
    desc: "Venture beyond JS and Python. Our platform dynamically supports obscure language paths to keep your skills sharp.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Dynamic Rules Engine",
    desc: "A fully configurable backend rules engine evaluates your actions, levels, and XP in real-time to instantly award custom achievements.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
];

export default function USPs() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl mb-4">YOUR NEW ARSENAL</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {usps.map((usp, i) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-card to-background pixel-border pointer-events-none" />
              <div className="relative p-8 h-full flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${usp.bgColor} ${usp.color} pixel-border flex items-center justify-center mb-6`}>
                  <usp.icon className="w-8 h-8" />
                </div>
                <h3 className="font-retro text-sm mb-4 leading-relaxed">{usp.title}</h3>
                <p className="text-muted text-sm">{usp.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
