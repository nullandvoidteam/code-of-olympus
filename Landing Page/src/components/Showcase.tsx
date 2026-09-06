"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Swords, FolderGit2, Trophy, Settings } from "lucide-react";

const tabs = [
  {
    id: "hud",
    icon: Terminal,
    title: "Player HUD",
    desc: "Your command center. Track XP, manage daily quests, and monitor your guild's health.",
  },
  {
    id: "battle",
    icon: Swords,
    title: "Code Battleground",
    desc: "Integrated IDE where unit tests deal damage to bosses. Watch the monster's health bar drop as your code compiles.",
  },
  {
    id: "forge",
    icon: FolderGit2,
    title: "Forge Workspace",
    desc: "A multi-file project builder. Once a blueprint is forged, push it to GitHub with a single click.",
  },
  {
    id: "ranking",
    icon: Trophy,
    title: "Global Ranking Arena",
    desc: "Dynamically sort, filter, and challenge top players across the platform's global leaderboards.",
  },
  {
    id: "rules",
    icon: Settings,
    title: "Admin Rules Engine",
    desc: "Configure achievement triggers on the fly. Evaluate actions in real-time without modifying any source code.",
  },
];

export default function Showcase() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-retro text-2xl md:text-3xl text-primary mb-4">SYSTEM ARCHITECTURE</h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Tabs Menu */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-6 pixel-border transition-all duration-300 flex items-start gap-4 ${
                    isActive
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-card border-border text-muted hover:border-muted hover:text-foreground"
                  }`}
                >
                  <div className={`p-2 pixel-border ${isActive ? "bg-primary text-white border-primary" : "bg-background border-border"}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-retro text-xs mb-2">{tab.title}</h3>
                    <p className="text-sm font-sans">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab Content / Screen */}
          <div className="lg:col-span-8">
            <div className="bg-card pixel-border border-border p-2 aspect-[4/3] md:aspect-video relative overflow-hidden">
              {/* Fake Window Controls */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-border/50">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="ml-2 font-retro text-[8px] text-muted">codequest_client.exe</span>
              </div>

              <div className="relative w-full h-[calc(100%-2rem)] bg-background pixel-border flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 p-4 flex flex-col"
                  >
                    {activeTab === "hud" && (
                      <div className="flex flex-col h-full gap-4">
                         <div className="flex justify-between items-center bg-card p-2 pixel-border border-primary/50">
                           <span className="font-retro text-xs text-primary">LVL 5 FRONTEND ROGUE</span>
                           <span className="font-retro text-xs text-accent">XP: 2450/3000</span>
                         </div>
                         <div className="flex-grow bg-card/50 pixel-border border-dashed border-muted p-4 flex items-center justify-center text-muted font-retro text-xs text-center leading-loose">
                           [ HUD MOCKUP VISUALS GO HERE ]<br/>
                           (Refer to Hero section for dashboard vibes)
                         </div>
                      </div>
                    )}
                    {activeTab === "battle" && (
                      <div className="flex h-full gap-4">
                        <div className="w-2/3 bg-black pixel-border p-4 font-mono text-xs text-green-400 overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-2 text-[8px] text-muted">IDE</div>
                          <code>
                            {`function attack(monster) {
  if (!monster.isAlive()) return;
  const damage = calculateDPS();
  monster.health -= damage;
  return monster.health;
}
// Running unit tests...`}
                          </code>
                        </div>
                        <div className="w-1/3 bg-card pixel-border p-2 flex flex-col items-center justify-center">
                           <div className="w-16 h-16 bg-red-500/20 pixel-border border-red-500 flex items-center justify-center mb-4">
                             <span className="font-retro text-2xl">👾</span>
                           </div>
                           <div className="w-full h-4 bg-background pixel-border">
                             <div className="w-1/2 h-full bg-red-500" />
                           </div>
                           <span className="font-retro text-[8px] mt-2 text-red-500">BOSS HP: 50%</span>
                        </div>
                      </div>
                    )}
                    {activeTab === "forge" && (
                      <div className="flex h-full gap-4">
                        <div className="w-1/4 bg-card pixel-border p-2 flex flex-col gap-2 font-mono text-xs text-muted">
                          <div className="text-foreground border-b border-border pb-1">explorer</div>
                          <div>src/</div>
                          <div className="pl-2">components/</div>
                          <div className="pl-4 text-primary">App.tsx</div>
                          <div>package.json</div>
                        </div>
                        <div className="w-3/4 flex flex-col gap-4">
                           <div className="flex-grow bg-black pixel-border p-4 font-mono text-xs text-blue-400">
                             // App.tsx<br/>
                             export default function App() {'{'}<br/>
                             &nbsp;&nbsp;return &lt;div&gt;Ready to ship&lt;/div&gt;;<br/>
                             {'}'}
                           </div>
                           <div className="h-12 bg-primary/20 pixel-border border-primary flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
                             <span className="font-retro text-xs text-primary flex items-center gap-2"><FolderGit2 className="w-4 h-4"/> PUSH TO GITHUB</span>
                           </div>
                        </div>
                      </div>
                    )}
                    {activeTab === "ranking" && (
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex justify-between items-center bg-card p-2 pixel-border border-amber-500/50">
                          <span className="font-retro text-xs text-amber-500">GLOBAL LEADERBOARD</span>
                          <span className="font-retro text-xs text-muted">SORT: ELO RATING</span>
                        </div>
                        <div className="flex-grow bg-card/50 pixel-border p-4 flex flex-col gap-2 font-mono text-xs text-amber-400">
                          <div className="flex justify-between border-b border-amber-500/30 pb-1">
                            <span>1. AL3X_M</span> <span>4850 XP</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/30 pb-1 text-muted">
                            <span>2. LUNA_99</span> <span>4720 XP</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/30 pb-1 text-muted">
                            <span>3. NEO_DEV</span> <span>4500 XP</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === "rules" && (
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex justify-between items-center bg-card p-2 pixel-border border-indigo-500/50">
                          <span className="font-retro text-xs text-indigo-500">ACHIEVEMENT TRIGGER CONFIG</span>
                        </div>
                        <div className="flex-grow bg-black pixel-border p-4 font-mono text-xs text-indigo-300">
                          // Rules Engine Evaluation<br/><br/>
                          <span className="text-muted">IF</span> EVENT_TYPE === 'LEVEL_UP'<br/>
                          <span className="text-muted">AND</span> NEW_LEVEL &gt;= 5<br/>
                          <span className="text-indigo-500">THEN</span> UNLOCK_ACHIEVEMENT('Veteran Coder')<br/><br/>
                          <span className="text-green-500">&gt; Trigger successfully registered.</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
