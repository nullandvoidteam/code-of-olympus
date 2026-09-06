import React from 'react'
import { ShieldWallFeed } from '../components/crucible/ShieldWallFeed'
import { ClassicCommunityFeed } from '../components/community/ClassicCommunityFeed'
import { useTheme } from '../context/ThemeContext'
import { SpiderNetDecal } from '../components/ui/SpiderNetDecal'
import { SpiderMaskSticker, ThwipSticker, FriendlyNeighborhoodBadge } from '../components/ui/SpiderStickers'

export const CommunityPage: React.FC = () => {
  const { theme } = useTheme()

  if (theme === 'classic') {
    return <ClassicCommunityFeed />
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8 pb-20 select-none animate-in fade-in duration-300">
      {theme === 'spiderman' ? (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-spider-banner">
          {/* Animated Ambient Glow Overlays */}
          <div className="absolute right-12 top-0 w-96 h-96 rounded-full bg-blue-600/30 blur-3xl pointer-events-none animate-shade-glow" />
          <div className="absolute left-1/4 bottom-0 w-80 h-36 bg-red-600/25 blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

          {/* Corner Spider Web Nets */}
          <SpiderNetDecal position="top-right" size={130} glow={true} />
          <SpiderNetDecal position="bottom-left" size={100} glow={true} />

          {/* Left Content */}
          <div className="relative z-10 flex flex-col gap-3 max-w-xl text-left">
            <div className="flex items-center gap-2">
              <FriendlyNeighborhoodBadge />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-md gamified-shaky-title">
              The Web Alliance
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl font-medium">
              Share code showcases, seek friendly neighbourhood debugging counsel, and collaborate with web warriors across the city.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border bg-blue-950/70 border-blue-400/40 text-blue-200">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Daily Bugle Dispatch Live
              </span>
              <ThwipSticker size={38} />
            </div>
          </div>

          {/* Right Cartoonish Mascot Column */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="relative animate-cartoon-float">
              <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl scale-95" />
              <img
                src="/extracted/community_space.png"
                alt="Web Explorer Coder"
                className="w-48 sm:w-56 md:w-64 h-auto object-contain relative z-10 drop-shadow-[0_16px_32px_rgba(0,102,255,0.45)] transition-transform hover:scale-105"
              />
              <div className="absolute -top-3 -right-2 z-20">
                <SpiderMaskSticker size={52} glow={true} />
              </div>
              <div className="absolute -bottom-2 -left-2 px-3 py-1 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-1.5 z-20 bg-slate-900/90 border-cyan-400/60">
                <span className="text-[10px] font-black tracking-widest text-cyan-300 font-mono">
                  ALLIANCE FEED
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Sacred Shield Wall Hero with Shaded Animation & Cartoonish Image ── */
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-shade-sweep"
          style={{
            background: 'linear-gradient(135deg, rgba(28,10,10,0.98) 0%, rgba(18,6,6,0.98) 50%, rgba(8,2,2,0.98) 100%)',
            borderColor: '#8C2828',
            boxShadow: `0 0 40px rgba(220,38,38,0.2) inset, 0 12px 36px rgba(0,0,0,0.85)`,
          }}
        >
          {/* Shaded Ambient Glow Overlays */}
          <div className="absolute right-12 top-0 w-96 h-96 rounded-full bg-red-600/25 blur-3xl pointer-events-none animate-shade-glow" />
          <div className="absolute left-1/4 bottom-0 w-80 h-36 bg-orange-600/15 blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />
          <div className="absolute -bottom-8 -right-8 text-[180px] font-serif font-black text-red-950/20 pointer-events-none select-none leading-none">
            Ω
          </div>

        {/* Left Content */}
        <div className="relative z-10 flex flex-col gap-3 max-w-xl text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3D00] shadow-[0_0_8px_#FF3D00] animate-pulse" />
            <span
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[10px] font-bold text-[#FF5722] uppercase tracking-[0.25em]"
            >
              WARRIORS OF MIDGARD • COUNCIL OF VALHALLA
            </span>
          </div>

          <h1
            style={{ fontFamily: "'Cinzel Decorative', serif", textShadow: '0 2px 20px rgba(220,38,38,0.5)' }}
            className="text-3xl md:text-5xl font-black text-[#F5E8E8] tracking-wider uppercase gamified-shaky-title"
          >
            The Shield Wall
          </h1>

          <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed max-w-xl">
            Proclaim your battle triumphs, request algorithmic counsel, and swear blood oaths alongside fellow Spartan coders.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <span
              className="px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border"
              style={{ background: 'rgba(30,14,14,0.8)', borderColor: '#8C2828', color: '#F5D060' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Midgard Guild Feed Active
            </span>
          </div>
        </div>

        {/* Right Cartoonish Image */}
        <div className="relative z-10 shrink-0 flex items-center justify-center">
          <div className="relative animate-cartoon-float">
            <div className="absolute inset-0 rounded-full bg-red-600/30 blur-2xl scale-95" />
            <img
              src="/extracted/community_space.png"
              alt="Community Space Guild"
              className="w-44 sm:w-56 md:w-64 h-auto object-contain relative z-10 drop-shadow-[0_16px_32px_rgba(220,38,38,0.45)] transition-transform hover:scale-105"
            />
            <div
              className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-1.5 z-20"
              style={{ background: 'rgba(14,6,6,0.92)', borderColor: '#8C2828' }}
            >
              <span className="text-[10px] font-black tracking-widest text-amber-400" style={{ fontFamily: "'Cinzel', serif" }}>
                COUNCIL LIVE
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      <ShieldWallFeed />
    </div>
  )
}
