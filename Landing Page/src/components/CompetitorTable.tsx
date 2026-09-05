"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  "Primary Audience",
  "Retention Engine",
  "Tangible Output",
  "UX Standard",
];

const competitors = [
  {
    name: "MOOCs",
    values: ["Passive Learners", "Self-Discipline", "Certificates", "Boring Video Player"],
    isCodeQuest: false,
  },
  {
    name: "LeetCode",
    values: ["Interview Grinders", "Fear of Failure", "Green Squares", "Sterile IDE"],
    isCodeQuest: false,
  },
  {
    name: "Kids EdTech",
    values: ["Children", "Badges & Stars", "Block Projects", "Toy-like"],
    isCodeQuest: false,
  },
  {
    name: "CodeQuest",
    values: ["Serious Builders", "Guild Accountability", "Real GitHub Commits", "Immersive 16-bit RPG"],
    isCodeQuest: true,
  },
];

export default function CompetitorTable() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">CHOOSE YOUR WEAPON</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 text-left border-b-2 border-border text-muted font-retro text-xs w-1/4">FEATURE</th>
                {competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className={`p-4 text-center border-b-2 font-retro text-xs ${
                      comp.isCodeQuest ? "border-primary text-primary" : "border-border text-muted"
                    }`}
                  >
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                  <td className="p-4 font-medium text-muted">{feature}</td>
                  {competitors.map((comp) => (
                    <td
                      key={comp.name + feature}
                      className={`p-4 text-center ${
                        comp.isCodeQuest ? "bg-primary/5 text-foreground font-bold" : "text-muted"
                      }`}
                    >
                      {comp.isCodeQuest ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4 text-primary" />
                          <span>{comp.values[idx]}</span>
                        </motion.div>
                      ) : (
                        <span className="flex items-center justify-center gap-2 opacity-70">
                          {comp.values[idx] === "No" ? <X className="w-4 h-4 text-red-500" /> : comp.values[idx]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
