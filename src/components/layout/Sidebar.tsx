import React from 'react'
import {
  Shield,
  Compass,
  Swords,
  Hammer,
  Flame,
  Users,
  User,
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
  Trophy,
  Target
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { SpiderNetDecal } from '../ui/SpiderNetDecal'
import { cn } from '../../lib/utils'
import { CodeQuestLogo } from '../brand/CodeQuestLogo'

export type NavItemKey = 'dashboard' | 'learn' | 'practice' | 'build' | 'arcade' | 'community' | 'profile' | 'quests' | 'achievements' | 'badges' | 'theme' | 'settings' | 'help' | 'admin'

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

  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Shield },
    { key: 'learn' as NavItemKey, label: 'Learn', icon: Compass },
    { key: 'practice' as NavItemKey, label: 'Practice', icon: Swords },
    { key: 'build' as NavItemKey, label: 'Projects', icon: Hammer },
    { key: 'arcade' as NavItemKey, label: 'Arcade', icon: Flame },
    { key: 'community' as NavItemKey, label: 'Community', icon: Users },
    { key: 'profile' as NavItemKey, label: 'Profile', icon: User },
    { key: 'theme' as NavItemKey, label: 'Theme', icon: Palette },
  ]

  return (
    <aside
      className="relative overflow-hidden h-screen sticky top-0 w-64 px-4 py-5 flex flex-col justify-between select-none z-30 overflow-y-auto hide-scrollbar"
      style={{
        background: 'var(--theme-sidebar-bg, linear-gradient(180deg, rgba(14, 8, 8, 0.98) 0%, rgba(8, 4, 4, 0.98) 100%))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--theme-sidebar-border, rgba(80, 30, 30, 0.85))',
        boxShadow: theme === 'classic' ? 'none' : '4px 0 32px rgba(7, 5, 5, 0.95), 1px 0 0 rgba(220, 38, 38, 0.15)',
        fontFamily: 'var(--theme-font-body, "Inter", sans-serif)',
      }}
    >
      {theme === 'spiderman' && <SpiderNetDecal size={65} position="top-right" />}

      {/* ── TOP SECTION: Brand & Navigation ── */}
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all duration-300 hover:bg-black/[0.03] cursor-pointer group"
        >
          <CodeQuestLogo size="md" variant="dark" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">

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
                    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer text-left active:translate-y-0",
                    isActive
                      ? "bg-white text-emerald-800 font-black shadow-[0_4px_0_0_#10B981] border-2 border-emerald-500 -translate-y-1"
                      : "bg-transparent hover:bg-white text-slate-600 hover:text-slate-900 font-bold border-2 border-transparent hover:border-slate-200 hover:shadow-[0_4px_0_0_#E2E8F0] hover:-translate-y-1"
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

                  <span className="text-sm truncate flex-1 font-semibold">
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
                    className="text-[13px] uppercase tracking-[0.16em] font-bold truncate leading-tight"
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


      </div>

      {/* ── BOTTOM SECTION: Profile + System Links ── */}
      <div
        className="flex flex-col gap-2.5 pt-3 mt-3"
        style={{ borderTop: '1px solid var(--theme-border-default, rgba(80,30,30,0.7))' }}
      >
        {/* User Mini-Profile */}
        {theme === 'classic' ? (
          <div
            onClick={() => onSelectTab('profile')}
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
            onClick={() => onSelectTab('profile')}
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm tracking-wide font-semibold transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm tracking-wide font-semibold transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
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
