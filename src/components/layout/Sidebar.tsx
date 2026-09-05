import React from 'react'
import {
  Shield,
  Compass,
  Swords,
  Hammer,
  Flame,
  Users,
  Palette,
  Settings,
  HelpCircle,
  ChevronRight,
  Zap,
  Terminal,
  BookOpen,
  Code2,
  Layers,
  Gamepad2,
  Flag,
  Star,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/utils'

export type NavItemKey = 'dashboard' | 'learn' | 'practice' | 'build' | 'arcade' | 'community' | 'theme' | 'settings' | 'help' | 'admin'

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
        <stop offset="0%" stopColor="var(--theme-accent-primary-hover, #EF4444)" />
        <stop offset="55%" stopColor="var(--theme-accent-primary, #DC2626)" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="chainGradSidebar" x1="10" y1="36" x2="30" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--theme-accent-secondary, #F5D060)" />
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
  const { theme } = useTheme()

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || (theme === 'classic' ? 'Alex Morgan' : 'Spartan Warrior')
  const level = profile?.level ?? 12
  const xp = profile?.xp ?? 4850
  const streak = profile?.streak ?? 7

  const navItems = theme === 'classic'
    ? [
        { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Terminal },
        { key: 'learn' as NavItemKey, label: 'Learn', icon: BookOpen },
        { key: 'practice' as NavItemKey, label: 'Practice', icon: Code2 },
        { key: 'build' as NavItemKey, label: 'Build', icon: Layers },
        { key: 'arcade' as NavItemKey, label: 'Team Arcade', icon: Gamepad2 },
        { key: 'community' as NavItemKey, label: 'Community', icon: Users },
        { key: 'theme' as NavItemKey, label: 'Theme', icon: Palette },
      ]
    : [
        { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Shield },
        { key: 'learn' as NavItemKey, label: 'Learn', icon: Compass },
        { key: 'practice' as NavItemKey, label: 'Practice', icon: Swords },
        { key: 'build' as NavItemKey, label: 'Projects', icon: Hammer },
        { key: 'arcade' as NavItemKey, label: 'Arcade', icon: Flame },
        { key: 'community' as NavItemKey, label: 'Community', icon: Users },
        { key: 'theme' as NavItemKey, label: 'Theme', icon: Palette },
      ]

  return (
    <aside
      className="h-screen sticky top-0 w-64 px-4 py-5 flex flex-col justify-between select-none z-30 overflow-y-auto"
      style={{
        background: 'var(--theme-sidebar-bg, linear-gradient(180deg, rgba(14, 8, 8, 0.98) 0%, rgba(8, 4, 4, 0.98) 100%))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--theme-sidebar-border, rgba(80, 30, 30, 0.85))',
        boxShadow: '4px 0 32px rgba(7, 5, 5, 0.95), 1px 0 0 rgba(220, 38, 38, 0.15)',
        fontFamily: 'var(--theme-font-body, "Inter", sans-serif)',
      }}
    >
      {/* ── TOP SECTION: Brand & Navigation ── */}
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all duration-300 hover:bg-black/[0.03] cursor-pointer group"
        >
          {theme === 'classic' ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-600 text-base">
                &lt;|&gt;
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                  Coding Conflicts
                </span>
                <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase">
                  CodeQuest Academy
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <OmegaIcon className="w-9 h-9 drop-shadow-[0_0_14px_rgba(220,38,38,0.85)]" />
              </div>

              <div className="flex flex-col">
                <span
                  className="text-base font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, var(--theme-text-primary, #F5E6E6) 50%, var(--theme-accent-secondary, #C59B27) 100%)',
                    fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
                  }}
                >
                  The Crucible
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--theme-accent-primary, #DC2626)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
                >
                  ⚔ GOD OF WAR
                </span>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          <div
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.25em] px-3 mb-1",
              theme === 'classic' ? "text-slate-400 font-sans" : "text-[var(--theme-text-muted,#8A7A7A)] font-cinzel"
            )}
          >
            {theme === 'classic' ? 'MAIN' : 'NAVIGATION'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key

            if (theme === 'classic') {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectTab(item.key)}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group cursor-pointer text-left",
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  )}

                  <div className={cn(
                    "flex items-center justify-center transition-colors",
                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="text-xs truncate flex-1">
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group cursor-pointer overflow-hidden"
                style={{
                  background: isActive
                    ? 'var(--theme-sidebar-active-bg, linear-gradient(90deg, rgba(185, 28, 28, 0.35) 0%, rgba(127, 29, 29, 0.15) 60%, transparent 100%))'
                    : undefined,
                  border: isActive ? '1px solid var(--theme-sidebar-active-border, rgba(220, 38, 38, 0.45))' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 16px var(--theme-accent-primary-dim, rgba(220, 38, 38, 0.25))' : undefined,
                  transform: isActive ? 'translateX(3px)' : undefined,
                  color: isActive ? 'var(--theme-text-primary, #FFFFFF)' : 'var(--theme-text-secondary, #A89898)',
                }}
              >
                {/* Active Rune Flame Strip */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                    style={{
                      background: 'var(--theme-sidebar-flame, linear-gradient(180deg, #FF3D00 0%, #DC2626 100%))',
                      boxShadow: '0 0 10px var(--theme-accent-glow, #FF3D00)',
                    }}
                  />
                )}

                {/* Left Icon with glow */}
                <div
                  className="p-1.5 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: isActive ? 'var(--theme-accent-primary-dim, rgba(255,255,255,0.1))' : 'transparent',
                    border: isActive ? '1px solid var(--theme-sidebar-active-border, rgba(255,255,255,0.2))' : '1px solid transparent',
                    color: isActive ? 'var(--theme-accent-primary, #EF4444)' : 'var(--theme-text-muted, #A89898)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex items-center text-left min-w-0 flex-1">
                  <span
                    className="text-xs uppercase tracking-[0.16em] font-bold truncate leading-tight"
                    style={{
                      fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                      color: isActive ? 'var(--theme-text-primary, #FFFFFF)' : 'var(--theme-text-secondary, #A89898)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Right Arrow on active or hover */}
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-all duration-300",
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                  )}
                  style={{ color: isActive ? 'var(--theme-accent-primary, #DC2626)' : 'var(--theme-text-muted, #A89898)' }}
                />
              </button>
            )
          })}
        </nav>

        {/* ── MY QUEST / SAGA LABOR SHRINE ── */}
        {theme === 'classic' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>MY QUEST</span>
              <Flag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-xs shrink-0">
                  🐍
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-500 truncate">
                    PYTHON ADVENTURE
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 truncate">
                    Loops & Logic
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">3 quests remaining</span>
                <span className="font-bold text-emerald-600">78%</span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
              </div>

              <button
                type="button"
                onClick={onContinueQuest || (() => onSelectTab('learn'))}
                className="btn-gamified-3d btn-gamified-3d-primary w-full py-1.5 text-xs font-extrabold text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Continue &gt;</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-3.5 rounded-2xl relative overflow-hidden flex flex-col gap-2.5 transition-all duration-300 group"
            style={{
              background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #150909) 0%, var(--theme-surface-card, #0c0505) 100%)',
              border: '1px solid var(--theme-border-default, rgba(80, 30, 30, 0.85))',
              boxShadow: '0 4px 18px rgba(7,5,5,0.7)',
            }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--theme-glow-ambient, rgba(255,61,0,0.1)) 0%, transparent 70%)' }}
            />

            <div className="flex items-center justify-between z-10">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'var(--theme-accent-glow, #FF3D00)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
              >
                ⚔ CURRENT LABOR
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'var(--theme-accent-primary-dim, rgba(220,38,38,0.2))', color: 'var(--theme-accent-primary-hover, #EF4444)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
              >
                TRIAL
              </span>
            </div>

            <div className="flex flex-col gap-0.5 z-10">
              <span
                className="text-xs font-bold uppercase tracking-wide truncate"
                style={{
                  fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                  color: 'var(--theme-text-primary, #F5E8E8)',
                }}
              >
                Python Adventure
              </span>
              <span
                className="text-[10px] font-medium truncate"
                style={{ color: 'var(--theme-text-muted, #A89898)' }}
              >
                Loops & Logic • Chapter 04
              </span>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1 z-10">
              <div className="flex justify-between items-center text-[10px]">
                <span style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontSize: '9px' }}>Saga Mastery</span>
                <span
                  className="font-bold tracking-wider"
                  style={{ color: 'var(--theme-accent-secondary, #F5D060)', fontSize: '10px', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
                >
                  78%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden p-[0.5px]"
                style={{ background: 'var(--theme-bg-subtle, #080404)', border: '1px solid var(--theme-border-default, #3D1C1C)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: '78%',
                    background: 'var(--theme-btn-primary-gradient)',
                    boxShadow: '0 0 10px var(--theme-accent-glow, rgba(255,61,0,0.7))',
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
                fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                background: 'var(--theme-btn-primary-gradient)',
                border: '1px solid var(--theme-btn-primary-border, rgba(255,61,0,0.4))',
              }}
            >
              <span>Resume Trial</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── PROGRESS CARD ── */}
        {theme === 'classic' ? (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              PROGRESS
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-[10px] text-slate-500">LEVEL {level}</span>
                    <span className="font-extrabold text-xs text-slate-800">{xp.toLocaleString()} XP</span>
                  </div>
                </div>
                <span className="font-bold text-xs text-slate-400">78%</span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '78%' }} />
              </div>

              <span className="text-[10px] font-medium text-slate-400 text-center">
                150 XP to Level {level + 1}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="p-3.5 rounded-2xl flex flex-col gap-2.5"
            style={{
              background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #110808) 0%, var(--theme-surface-card, #080404) 100%)',
              border: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.8))',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--theme-status-med-bg, rgba(245,208,96,0.15))', border: '1px solid var(--theme-accent-secondary, rgba(245,208,96,0.35))' }}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-bold uppercase tracking-wider text-[9px]"
                    style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
                  >
                    TIER {level} WARRIOR
                  </span>
                  <span
                    className="font-bold text-[10px] tracking-wide"
                    style={{
                      fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                      color: 'var(--theme-text-primary, #F5E8E8)',
                    }}
                  >
                    {xp.toLocaleString()} Hacksilver
                  </span>
                </div>
              </div>
              <span
                className="text-[10px] font-bold"
                style={{ color: 'var(--theme-accent-glow, #FF3D00)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
              >
                {streak}d 🔥
              </span>
            </div>

            <div
              className="w-full h-1.5 rounded-full overflow-hidden p-[0.5px]"
              style={{ background: 'var(--theme-bg-subtle, #080404)', border: '1px solid var(--theme-border-default, #3D1C1C)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: '65%',
                  background: 'linear-gradient(90deg, #0284C7 0%, var(--theme-accent-cyan, #00E5FF) 100%)',
                  boxShadow: '0 0 8px var(--theme-accent-cyan, rgba(0,229,255,0.6))',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM SECTION: Profile + System Links ── */}
      <div
        className="flex flex-col gap-2.5 pt-3 mt-3"
        style={{ borderTop: '1px solid var(--theme-border-default, rgba(80,30,30,0.7))' }}
      >
        {/* User Mini-Profile */}
        {theme === 'classic' ? (
          <div
            onClick={() => onSelectTab('settings')}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 transition-all cursor-pointer hover:bg-slate-50"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Level {level} Adventurer
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onSelectTab('settings')}
            className="p-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 cursor-pointer group"
            style={{
              background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #140909) 0%, var(--theme-surface-card, #0A0505) 100%)',
              border: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.8))',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)',
                border: '1px solid var(--theme-accent-secondary, rgba(245, 208, 96, 0.5))',
                boxShadow: '0 0 10px rgba(220,38,38,0.5)',
                color: '#FFFFFF',
                fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
              }}
            >
              {displayName.slice(0, 2)}
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="font-bold text-xs uppercase tracking-wide truncate transition-colors"
                style={{ color: 'var(--theme-text-primary, #F1E5E5)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
              >
                {displayName}
              </div>
              <div
                className="text-[9px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
              >
                Spartan Champion
              </div>
            </div>
          </div>
        )}

        {/* System Navigation Links */}
      <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
              fontSize: '11px',
              background: activeTab === 'settings' ? 'var(--theme-surface-hover)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--theme-accent-secondary, #F5D060)' : 'var(--theme-text-muted, #A89898)',
              border: activeTab === 'settings' ? '1px solid var(--theme-accent-secondary, rgba(245, 208, 96, 0.3))' : '1px solid transparent',
            }}
          >
            <Settings className="w-3.5 h-3.5" style={{ color: activeTab === 'settings' ? 'var(--theme-accent-secondary)' : 'var(--theme-text-dim)' }} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('help')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
              fontSize: '11px',
              background: activeTab === 'help' ? 'var(--theme-surface-hover)' : 'transparent',
              color: activeTab === 'help' ? 'var(--theme-accent-cyan, #00E5FF)' : 'var(--theme-text-muted, #A89898)',
              border: activeTab === 'help' ? '1px solid var(--theme-accent-cyan, rgba(0, 229, 255, 0.3))' : '1px solid transparent',
            }}
          >
            <HelpCircle className="w-3.5 h-3.5" style={{ color: activeTab === 'help' ? 'var(--theme-accent-cyan)' : 'var(--theme-text-dim)' }} />
            <span>Help & Support</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
