"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Choose Your Class",
    desc: "Sign in with GitHub and select your path: Frontend Rogue, Backend Paladin, or Fullstack Wizard.",
  },
  {
    num: "02",
    title: "Join a Guild",
    desc: "Get auto-matched into a 3-5 person squad based on your timezone and skill level.",
  },
  {
    num: "03",
    title: "Daily Quests",
    desc: "Enter the Code Battleground. Passing unit tests deals damage to bugs and bosses.",
  },
  {
    num: "04",
    title: "Unlock the Forge",
    desc: "Earn XP to unlock real-world Blueprint Projects in your persistent workspace.",
  },
  {
    num: "05",
    title: "Push to GitHub",
    desc: "Complete projects and push them straight to your GitHub with one click. Build your real portfolio.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-card border-y-2 border-border relative">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">THE QUEST LOG</h2>
          <p className="text-muted max-w-2xl mx-auto">
            From lone wolf to guild legend. Here is how your journey unfolds.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-border hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col md:flex-row gap-6 md:gap-12 md:items-center group"
              >
                <div className="z-10 flex-shrink-0 w-16 h-16 bg-background pixel-border border-border group-hover:border-primary flex items-center justify-center transition-colors">
                  <span className="font-retro text-xl text-primary">{step.num}</span>
                </div>
                
                <div className="bg-background pixel-border p-6 flex-grow relative overflow-hidden group-hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <h3 className="font-retro text-sm mb-3">{step.title}</h3>
                  <p className="text-muted text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
