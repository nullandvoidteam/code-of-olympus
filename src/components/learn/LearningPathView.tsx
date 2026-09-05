import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Check, Lock, Play, Flame, Star, Hexagon } from 'lucide-react';

const NODES = [
  { id: '1', title: 'GETTING STARTED', status: 'completed', x: 100, y: 100 },
  { id: '2', title: 'PYTHON FUNDAMENTALS', status: 'completed', x: 400, y: 100 },
  { id: '3', title: 'CONTROL FLOW & LOOPS', status: 'completed', x: 700, y: 250 },
  { id: '4', title: 'DATA STRUCTURES', subtitle: 'Python', status: 'active', progress: 65, x: 200, y: 350 },
  { id: '5', title: 'JAVASCRIPT BASICS', subtitle: 'JavaScript', status: 'locked', x: 600, y: 450 },
  { id: '6', title: 'WEB DEVELOPMENT', subtitle: 'React & Node', status: 'locked', x: 200, y: 550 },
  { id: '7', title: 'ADVANCED TOPICS', status: 'locked', x: 600, y: 700 },
];

export const LearningPathView: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  
  const isMythic = theme === 'gow';

  // Winding SVG path connecting the nodes
  const pathD = `
    M 100 100 
    L 400 100 
    C 600 100, 700 150, 700 250 
    C 700 350, 400 350, 200 350 
    C 50 350, 50 450, 200 450
    L 600 450
    C 750 450, 750 550, 600 550
    L 200 550
    C 50 550, 50 700, 200 700
    L 600 700
  `;

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 transition-colors duration-300 hide-scrollbar" style={{ background: 'var(--theme-bg-canvas)' }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* TOP STATS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-3xl border shadow-lg relative overflow-hidden"
             style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0"
                 style={{ borderColor: 'var(--theme-accent-cyan)', background: 'var(--theme-bg-subtle)' }}>
              <span className="font-bold text-sm" style={{ color: 'var(--theme-text-primary)' }}>Lvl {profile?.level || 12}</span>
            </div>
            <div className="flex flex-col">
              <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-subtle)' }}>
                <div className="h-full w-[80%] rounded-full" style={{ background: 'var(--theme-accent-cyan)' }} />
              </div>
              <span className="text-[10px] mt-1 font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                XP to Next Level
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8 z-10">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total XP</span>
              <div className="flex items-center gap-1.5 font-black text-lg" style={{ color: 'var(--theme-accent-secondary)' }}>
                <Star className="w-4 h-4" /> 18,750
              </div>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--theme-border-subtle)' }} />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Day Streak</span>
              <div className="flex items-center gap-1.5 font-black text-lg" style={{ color: 'var(--theme-accent-primary)' }}>
                <Flame className="w-4 h-4" /> 7
              </div>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--theme-border-subtle)' }} />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Skill Points</span>
              <div className="flex items-center gap-1.5 font-black text-lg" style={{ color: 'var(--theme-accent-cyan)' }}>
                <Hexagon className="w-4 h-4" /> 3
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          {/* MAIN LEARNING PATH (LEFT) */}
          <div className="lg:col-span-8 rounded-3xl border shadow-xl relative min-h-[800px] overflow-hidden"
               style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            
            <div className="absolute top-6 left-6 z-20">
              <h2 className="text-xl font-bold tracking-widest uppercase drop-shadow-md"
                  style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
                Learning Path
              </h2>
            </div>

            {/* Path SVG Container */}
            <div className="absolute inset-0 w-full h-full pt-10 pl-4 overflow-x-auto hide-scrollbar">
              <div className="relative w-[900px] h-full mx-auto">
                
                {/* SVG Path Background Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 10px var(--theme-accent-cyan))' }}>
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="var(--theme-border-subtle)" 
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Glowing Overlay Line for progress */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="var(--theme-accent-cyan)" 
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-80"
                    strokeDasharray="3000"
                    strokeDashoffset="1800" // Adjust to show partial progress
                  />
                </svg>

                {/* Nodes rendered absolutely */}
                {NODES.map((node) => (
                  <div 
                    key={node.id} 
                    className={cn(
                      "absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110",
                      node.status === 'locked' && "opacity-50 grayscale"
                    )}
                    style={{ left: node.x, top: node.y }}
                  >
                    <div className="relative">
                      {node.status === 'active' && (
                        <div className="absolute -inset-4 rounded-full animate-ping opacity-20" style={{ background: 'var(--theme-accent-cyan)' }} />
                      )}
                      <div 
                        className="w-16 h-16 rounded-full border-4 flex items-center justify-center relative z-10 shadow-xl"
                        style={{
                          background: node.status === 'completed' ? 'var(--theme-accent-cyan)' : 'var(--theme-surface-card)',
                          borderColor: node.status === 'locked' ? 'var(--theme-border-subtle)' : 'var(--theme-accent-cyan)',
                          boxShadow: node.status === 'active' ? '0 0 30px var(--theme-accent-cyan)' : 'none',
                        }}
                      >
                        {node.status === 'completed' && <Check className="w-8 h-8 text-black" />}
                        {node.status === 'active' && <Play className="w-6 h-6 ml-1" style={{ color: 'var(--theme-accent-cyan)' }} />}
                        {node.status === 'locked' && <Lock className="w-6 h-6" style={{ color: 'var(--theme-text-muted)' }} />}
                      </div>
                    </div>
                    
                    <div className="mt-4 px-4 py-2 rounded-full border shadow-lg whitespace-nowrap flex flex-col items-center"
                         style={{ background: 'var(--theme-surface-card-alt)', borderColor: 'var(--theme-border-default)' }}>
                      <span className="font-bold text-xs tracking-wider uppercase" style={{ color: 'var(--theme-text-primary)' }}>
                        {node.title}
                      </span>
                      {node.subtitle && (
                        <span className="text-[10px] font-bold opacity-70 mt-0.5" style={{ color: 'var(--theme-accent-secondary)' }}>
                          {node.subtitle}
                        </span>
                      )}
                    </div>
                    
                    {node.status === 'active' && node.progress !== undefined && (
                      <div className="w-24 h-1.5 rounded-full overflow-hidden mt-3" style={{ background: 'var(--theme-bg-subtle)' }}>
                        <div className="h-full rounded-full" style={{ width: `${node.progress}%`, background: 'var(--theme-accent-cyan)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE COURSES SIDEBAR (RIGHT) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h3 className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
              Active Courses
            </h3>

            <div className="flex flex-col gap-4">
              {/* Python Course Card */}
              <div className="p-5 rounded-2xl border shadow-lg flex flex-col gap-4"
                   style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm tracking-wider uppercase leading-tight max-w-[70%]" style={{ color: 'var(--theme-text-primary)' }}>
                    Data Structures (Python)
                  </h4>
                  <div className="w-8 h-8 rounded border flex items-center justify-center font-bold text-xs" 
                       style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-accent-cyan)', color: 'var(--theme-accent-cyan)' }}>
                    Py
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span style={{ color: 'var(--theme-text-muted)' }}>Progress</span>
                    <span style={{ color: 'var(--theme-accent-cyan)' }}>65%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-subtle)' }}>
                    <div className="h-full rounded-full" style={{ width: '65%', background: 'var(--theme-accent-cyan)' }} />
                  </div>
                </div>
                
                <div className="text-xs flex flex-col gap-1" style={{ color: 'var(--theme-text-muted)' }}>
                  <div className="flex items-center gap-2"><span>⏱</span> 4 hours to next level</div>
                </div>
                
                <button className="w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase mt-2 shadow-md transition-transform hover:-translate-y-0.5"
                        style={{ background: 'var(--theme-accent-cyan)', color: '#000' }}>
                  Continue
                </button>
              </div>

              {/* JavaScript Course Card */}
              <div className="p-5 rounded-2xl border shadow-lg flex flex-col gap-4"
                   style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm tracking-wider uppercase leading-tight max-w-[70%]" style={{ color: 'var(--theme-text-primary)' }}>
                    JavaScript Basics
                  </h4>
                  <div className="w-8 h-8 rounded border flex items-center justify-center font-bold text-xs" 
                       style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-accent-secondary)', color: 'var(--theme-accent-secondary)' }}>
                    JS
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span style={{ color: 'var(--theme-text-muted)' }}>Progress</span>
                    <span style={{ color: 'var(--theme-accent-cyan)' }}>20%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-subtle)' }}>
                    <div className="h-full rounded-full" style={{ width: '20%', background: 'var(--theme-accent-cyan)' }} />
                  </div>
                </div>
                
                <div className="text-xs flex flex-col gap-1" style={{ color: 'var(--theme-text-muted)' }}>
                  <div className="flex items-center gap-2"><span>⏱</span> Unlock Functions in 2 hours</div>
                </div>
                
                <button className="w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase mt-2 border shadow-md transition-transform hover:-translate-y-0.5"
                        style={{ background: 'var(--theme-surface-card-alt)', borderColor: 'var(--theme-accent-cyan)', color: 'var(--theme-accent-cyan)' }}>
                  Continue
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
