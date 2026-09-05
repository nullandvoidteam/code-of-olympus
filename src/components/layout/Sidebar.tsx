import React from 'react'
import {
  Shield,
  Compass,
  Swords,
  Hammer,
  Flame,
  Users,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

export type NavItemKey = 'dashboard' | 'learn' | 'practice' | 'build' | 'arcade' | 'community' | 'settings' | 'help' | 'admin'

interface SidebarProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onContinueQuest?: () => void
  userMode?: 'level1' | 'level12'
  isAdmin?: boolean
}

/* ── Omega God of War Icon ── */
const OmegaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 4C11.163 4 4 11.163 4 20C4 26.5 7.8 32.1 13.3 34.8L10 38H30L26.7 34.8C32.2 32.1 36 26.5 36 20C36 11.163 28.837 4 20 4Z"
      stroke="url(#omegaGradSidebar)"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M13 38 L10 38 L10 35 L13 35Z" fill="url(#omegaGradSidebar)" opacity="0.8" />
    <path d="M27 38 L30 38 L30 35 L27 35Z" fill="url(#omegaGradSidebar)" opacity="0.8" />
    <line x1="10" y1="36" x2="30" y2="36" stroke="url(#chainGradSidebar)" strokeWidth="1" strokeDasharray="2 3" />
    <defs>
      <linearGradient id="omegaGradSidebar" x1="4" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="55%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="chainGradSidebar" x1="10" y1="36" x2="30" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5D060" />
        <stop offset="100%" stopColor="#784E10" />
      </linearGradient>
    </defs>
  </svg>
)

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onContinueQuest,
}) => {
  const { user, profile } = useAuth()

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Spartan Warrior'
  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0
  const streak = profile?.streak ?? 0

  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Shield },
    { key: 'learn' as NavItemKey, label: 'Learn', icon: Compass },
    { key: 'practice' as NavItemKey, label: 'Practice', icon: Swords },
    { key: 'build' as NavItemKey, label: 'Projects', icon: Hammer },
    { key: 'arcade' as NavItemKey, label: 'Arcade', icon: Flame },
    { key: 'community' as NavItemKey, label: 'Community', icon: Users },
  ]

  return (
    <aside
      className="h-screen sticky top-0 w-64 px-4 py-5 flex flex-col justify-between select-none z-30 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 8, 8, 0.98) 0%, rgba(8, 4, 4, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(80, 30, 30, 0.85)',
        boxShadow: '4px 0 32px rgba(7, 5, 5, 0.95), 1px 0 0 rgba(220, 38, 38, 0.15)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── TOP SECTION: Brand & Navigation ── */}
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all duration-300 hover:bg-red-950/20 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 transition-transform duration-300 group-hover:scale-110">
            <OmegaIcon className="w-9 h-9 drop-shadow-[0_0_14px_rgba(220,38,38,0.85)]" />
          </div>

          <div className="flex flex-col">
            <span
              className="text-base font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #F5E6E6 50%, #C59B27 100%)',
                fontFamily: "'Cinzel', serif",
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
              }}
            >
              The Crucible
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.25em]"
              style={{ color: '#DC2626', fontFamily: "'Cinzel', serif" }}
            >
              ⚔ GOD OF WAR
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.25em] px-3 mb-1"
            style={{ color: '#8A7A7A', fontFamily: "'Cinzel', serif" }}
          >
            NAVIGATION
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group cursor-pointer overflow-hidden",
                  isActive
                    ? "text-white font-bold"
                    : "text-[#A89898] hover:text-white hover:bg-white/[0.04]"
                )}
                style={{
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(185, 28, 28, 0.35) 0%, rgba(127, 29, 29, 0.15) 60%, transparent 100%)'
                    : undefined,
                  border: isActive ? '1px solid rgba(220, 38, 38, 0.45)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 16px rgba(220, 38, 38, 0.25), inset 0 0 10px rgba(220, 38, 38, 0.15)' : undefined,
                  transform: isActive ? 'translateX(3px)' : undefined,
                }}
              >
                {/* Active Rune Flame Strip */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                    style={{
                      background: 'linear-gradient(180deg, #FF3D00 0%, #DC2626 100%)',
                      boxShadow: '0 0 10px #FF3D00, 0 0 20px #DC2626',
                    }}
                  />
                )}

                {/* Left Icon with God of War glow */}
                <div
                  className={cn(
                    "p-1.5 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    isActive
                      ? "text-[#EF4444] bg-red-950/40 border border-red-800/40"
                      : "text-[#8A7A7A] group-hover:text-[#F5D060]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex items-center text-left min-w-0 flex-1">
                  <span
                    className="text-xs uppercase tracking-[0.16em] font-bold truncate leading-tight"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Right Arrow on active or hover */}
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-all duration-300",
                    isActive
                      ? "text-[#DC2626] opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 text-stone-500"
                  )}
                />
              </button>
            )
          })}
        </nav>

        {/* ── SAGA LABOR SHRINE (Always Expanded) ── */}
        <div
          className="p-3.5 rounded-2xl relative overflow-hidden flex flex-col gap-2.5 transition-all duration-300 hover:border-red-600/50 group"
          style={{
            background: 'linear-gradient(145deg, #150909 0%, #0c0505 100%)',
            border: '1px solid rgba(80, 30, 30, 0.85)',
            boxShadow: '0 4px 18px rgba(7,5,5,0.7), 0 0 16px rgba(220,38,38,0.06)',
          }}
        >
          {/* Subtle ember glow */}
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,61,0,0.1) 0%, transparent 70%)' }}
          />

          <div className="flex items-center justify-between z-10">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: '#FF3D00', fontFamily: "'Cinzel', serif" }}
            >
              ⚔ CURRENT LABOR
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(220,38,38,0.2)', color: '#EF4444', fontFamily: "'Cinzel', serif" }}
            >
              TRIAL
            </span>
          </div>

          <div className="flex flex-col gap-0.5 z-10">
            <span
              className="text-xs font-bold uppercase tracking-wide text-stone-100 truncate"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Python Adventure
            </span>
            <span className="text-[10px] text-stone-400 font-medium truncate">
              Loops & Logic • Chapter 04
            </span>
          </div>

          {/* Molten Lava Progress Bar */}
          <div className="flex flex-col gap-1 z-10">
            <div className="flex justify-between items-center text-[10px]">
              <span style={{ color: '#8A7A7A', fontSize: '9px' }}>Saga Mastery</span>
              <span
                className="font-bold tracking-wider"
                style={{ color: '#F5D060', fontSize: '10px', fontFamily: "'Cinzel', serif" }}
              >
                78%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden p-[0.5px]"
              style={{ background: '#080404', border: '1px solid #3D1C1C' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: '78%',
                  background: 'linear-gradient(90deg, #991B1B 0%, #DC2626 50%, #FF3D00 100%)',
                  boxShadow: '0 0 10px rgba(255,61,0,0.7)',
                }}
              />
            </div>
          </div>

          {/* Continue Action Button */}
          <button
            type="button"
            onClick={onContinueQuest || (() => onSelectTab('learn'))}
            className="w-full py-2 px-3 rounded-xl font-bold text-[11px] uppercase tracking-[0.18em] text-white flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer z-10 shadow-lg"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 60%, #EA580C 100%)',
              border: '1px solid rgba(255,61,0,0.4)',
              boxShadow: '0 0 16px rgba(220,38,38,0.4)',
            }}
          >
            <span>Resume Trial</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── ASCENSION PROGRESS CARD ── */}
        <div
          className="p-3.5 rounded-2xl flex flex-col gap-2.5"
          style={{
            background: 'linear-gradient(145deg, #110808 0%, #080404 100%)',
            border: '1px solid rgba(61, 28, 28, 0.8)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,208,96,0.15)', border: '1px solid rgba(245,208,96,0.35)' }}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold uppercase tracking-wider text-[9px]"
                  style={{ color: '#C59B27', fontFamily: "'Cinzel', serif" }}
                >
                  TIER {level} WARRIOR
                </span>
                <span
                  className="font-bold text-[10px] text-stone-200 tracking-wide"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {xp.toLocaleString()} Hacksilver
                </span>
              </div>
            </div>
            <span
              className="text-[10px] font-bold"
              style={{ color: '#FF3D00', fontFamily: "'Cinzel', serif" }}
            >
              {streak}d 🔥
            </span>
          </div>

          <div
            className="w-full h-1.5 rounded-full overflow-hidden p-[0.5px]"
            style={{ background: '#080404', border: '1px solid #3D1C1C' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: '65%',
                background: 'linear-gradient(90deg, #0284C7 0%, #00E5FF 100%)',
                boxShadow: '0 0 8px rgba(0,229,255,0.6)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: Warrior Profile + System Links ── */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-[rgba(80,30,30,0.7)] mt-3">
        {/* Spartan Warrior Mini-Profile */}
        <div
          onClick={() => onSelectTab('settings')}
          className="p-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:border-amber-600/50 cursor-pointer group"
          style={{
            background: 'linear-gradient(145deg, #140909 0%, #0A0505 100%)',
            border: '1px solid rgba(61, 28, 28, 0.8)',
          }}
        >
          {/* Avatar frame */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase transition-transform duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)',
              border: '1px solid rgba(245, 208, 96, 0.5)',
              boxShadow: '0 0 10px rgba(220,38,38,0.5)',
              color: '#FFFFFF',
              fontFamily: "'Cinzel', serif",
            }}
          >
            {displayName.slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-xs uppercase tracking-wide truncate group-hover:text-amber-400 transition-colors"
              style={{ color: '#F1E5E5', fontFamily: "'Cinzel', serif" }}
            >
              {displayName}
            </div>
            <div
              className="text-[9px] uppercase tracking-wider font-semibold"
              style={{ color: '#C59B27', fontFamily: "'Cinzel', serif" }}
            >
              Spartan Champion
            </div>
          </div>
        </div>

        {/* System Navigation Links */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-200 cursor-pointer",
              activeTab === 'settings'
                ? "text-[#F5D060] bg-white/[0.06] font-bold border border-amber-500/30"
                : "text-[#8A7A7A] hover:text-white hover:bg-white/[0.03]"
            )}
            style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }}
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('help')}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-200 cursor-pointer",
              activeTab === 'help'
                ? "text-[#00E5FF] bg-white/[0.06] font-bold border border-cyan-500/30"
                : "text-[#8A7A7A] hover:text-white hover:bg-white/[0.03]"
            )}
            style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }}
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Help & Support</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
