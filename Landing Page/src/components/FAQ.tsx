"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Is this for absolute beginners?",
    a: "CodeQuest is best for those who know basic syntax (variables, loops, functions) but struggle to build real projects or stay consistent. If you've done a Codecademy course but can't build a full-stack app, this is for you.",
  },
  {
    q: "What happens if my squad quits?",
    a: "If a party member goes AFK for 3 days without a shield potion, they are automatically dropped, and you'll be matchmade with a new active player. Your streak remains intact.",
  },
  {
    q: "What tech stack do I learn?",
    a: "You choose your class. Frontend Rogues learn React/Next.js and Tailwind. Backend Paladins learn Node/Express and PostgreSQL. Fullstack Wizards learn both.",
  },
  {
    q: "Is the GitHub output really mine?",
    a: "Yes. Blueprint Projects are deployed directly to your personal GitHub repository. The code is yours, the commit history is yours, and the portfolio is yours.",
  },
  {
    q: "How do I cancel my Guild Pro subscription?",
    a: "You can cancel anytime from the Settings menu. You'll keep your Pro perks until the end of the billing cycle, after which you'll be downgraded to the Free Solo Quest tier.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">LORE & KNOWLEDGE</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="bg-card pixel-border border-border overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-background/50 transition-colors"
                >
                  <span className="font-retro text-sm text-foreground pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-6 pt-0 text-muted text-sm border-t border-border/30">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
