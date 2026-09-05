"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Solo Quest",
    price: "Free",
    desc: "For lone wolves testing the waters.",
    features: [
      "Access to basic Code Battleground",
      "Public Guild matching",
      "1 Blueprint Project/month",
      "Community Support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Guild Pro",
    price: "$15",
    period: "/mo",
    desc: "For serious builders who want real output.",
    features: [
      "Unlimited Blueprint Projects",
      "Private Guild creation",
      "Advanced Boss Battles (System Design)",
      "1-Click GitHub Portfolio Sync",
      "All Multiverse Skins (Space, Cyberpunk)",
    ],
    cta: "Join the Guild",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Train your junior dev teams with metrics.",
    features: [
      "Custom Blueprint Projects",
      "Company-wide leaderboards",
      "Performance Analytics HUD",
      "Dedicated Support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">MERCHANT'S SHOP</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Choose your gear. Upgrade your stats.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card pixel-border p-8 flex flex-col h-full ${
                tier.highlight ? "border-primary shadow-[0_0_15px_rgba(217,70,239,0.3)] transform md:-translate-y-4" : "border-border"
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-retro text-[10px] px-4 py-1 pixel-border-primary">
                  MOST POPULAR
                </div>
              )}
              <h3 className="font-retro text-lg mb-2 text-foreground">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">{tier.price}</span>
                {tier.period && <span className="text-muted">{tier.period}</span>}
              </div>
              <p className="text-sm text-muted mb-8">{tier.desc}</p>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="https://code-city-pied.vercel.app/"
                className={`w-full font-retro text-xs py-4 transition-colors text-center inline-block ${
                  tier.highlight
                    ? "bg-primary hover:bg-primary-hover text-white pixel-border-primary"
                    : "bg-background hover:bg-border text-foreground pixel-border border-border"
                }`}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
