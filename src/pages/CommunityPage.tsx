import React from 'react'
import { ShieldWallFeed } from '../components/crucible/ShieldWallFeed'
import { Swords } from 'lucide-react'

export const CommunityPage: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8 pb-20 select-none animate-in fade-in duration-300">
      {/* ── Sacred Shield Wall Hero ── */}
      <div className="relative bg-gradient-to-br from-[#180A0A] via-[#0E0505] to-[#0A0404] border-2 border-[#8C2828] rounded-2xl p-6 sm:p-8 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <div className="absolute top-0 right-1/4 w-96 h-36 bg-[#FF3D00]/15 blur-[90px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />
        <div className="absolute -bottom-8 -right-8 text-[180px] font-serif font-black text-red-950/20 pointer-events-none select-none leading-none">
          Ω
        </div>

        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
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
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-2xl sm:text-4xl font-black text-[#F5E8E8] tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          >
            The Shield Wall
          </h1>

          <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed max-w-xl">
            Proclaim your battle triumphs, request algorithmic counsel, and swear blood oaths alongside fellow Spartan coders.
          </p>
        </div>
      </div>

      <ShieldWallFeed />
    </div>
  )
}
