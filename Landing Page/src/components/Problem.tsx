"use client";

import React from "react";
import { BookX, Code2, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
  {
    icon: BookX,
    title: "Self-Paced MOOCs",
    stat: "90% Drop-off Rate",
    desc: "Endless tutorial purgatory with no accountability. You watch, you copy, you forget, you quit.",
  },
  {
    icon: Code2,
    title: "LeetCode Grind",
    stat: "No Real Output",
    desc: "Great for cracking algorithms, terrible for building products. You get burnout, not a portfolio.",
  },
  {
    icon: Gamepad2,
    title: "Kids EdTech",
    stat: "Not Serious",
    desc: "Block-coding and childish games won't prepare you for production environments or a real engineering job.",
  },
];

export default function Problem() {
  return (
    <section id="features" className="py-24 px-4 bg-card relative border-y-2 border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">THE FAILURE MODE</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Traditional learning paths are broken. They lack the social pressure, tangible output, and engaging mechanics needed to survive the chasm of despair.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((prob, i) => (
            <motion.div
              key={prob.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-background pixel-border p-6 hover:border-primary transition-colors group relative overflow-hidden"
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
              
              <div className="w-12 h-12 bg-card pixel-border flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors text-muted">
                <prob.icon className="w-6 h-6" />
              </div>
              
              <div className="font-retro text-[10px] text-accent mb-2">{prob.stat}</div>
              <h3 className="text-xl font-bold mb-3">{prob.title}</h3>
              <p className="text-muted text-sm">{prob.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
