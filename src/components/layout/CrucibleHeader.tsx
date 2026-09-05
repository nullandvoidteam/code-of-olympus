import React, { useState, useEffect, useRef } from 'react'
import { Bell, LogOut, Settings, ChevronDown, Palette, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationContext'
import { SpiderEmblemIcon, SpiderNetDecal } from '../ui/SpiderNetDecal'
import { cn } from '../../lib/utils'
import type { NavItemKey } from './Sidebar'

export type DashboardMode = 'overview' | 'headquarters' | 'first_time'

interface CrucibleHeaderProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  onOpenLumi: () => void
  dashboardMode?: DashboardMode
  onChangeDashboardMode?: (mode: DashboardMode) => void
  courseDetailTitle?: string | null
  onToggleMobileMenu?: () => void
}

/* ── Omega SVG icon ── */
const OmegaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 4C11.163 4 4 11.163 4 20C4 26.5 7.8 32.1 13.3 34.8L10 38H30L26.7 34.8C32.2 32.1 36 26.5 36 20C36 11.163 28.837 4 20 4Z"
      stroke="url(#omegaGrad)"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M13 38 L10 38 L10 35 L13 35Z"
      fill="url(#omegaGrad)"
      opacity="0.7"
    />
    <path
      d="M27 38 L30 38 L30 35 L27 35Z"
      fill="url(#omegaGrad)"
      opacity="0.7"
    />
    {/* Chain detail */}
    <line x1="10" y1="36" x2="30" y2="36" stroke="url(#chainGrad)" strokeWidth="1" strokeDasharray="2 3" />
    <defs>
      <linearGradient id="omegaGrad" x1="4" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--theme-accent-primary-hover, #EF4444)" />
        <stop offset="55%" stopColor="var(--theme-accent-primary, #DC2626)" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="chainGrad" x1="10" y1="36" x2="30" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--theme-accent-secondary, #F5D060)" />
        <stop offset="100%" stopColor="#784E10" />
      </linearGradient>
    </defs>
  </svg>
)



export const CrucibleHeader: React.FC<CrucibleHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLumi,
  dashboardMode,
  onChangeDashboardMode,
  courseDetailTitle,
  onToggleMobileMenu,
}) => {
  const { user, profile, signOut } = useAuth()
  const { theme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [bellShaking, setBellShaking] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Spartan'
  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0
  const streak = profile?.streak ?? 0

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // XP display formatter
  const formatXP = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`

  return (
    <header
      id="crucible-header"
      className="relative overflow-hidden h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 select-none w-full"
      style={{
        background: 'var(--theme-surface-card-translucent, rgba(7,5,5,0.92))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--theme-border-default, rgba(42,20,20,0.9))',
        boxShadow: '0 1px 0 var(--theme-border-subtle, rgba(220,38,38,0.08)), var(--theme-shadow-card, 0 4px 24px rgba(7,5,5,0.8))',
      }}
    >
      {theme === 'spiderman' && <SpiderNetDecal size={60} position="top-right" />}

      {/* LEFT — Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-2 rounded-xl transition-colors cursor-pointer"
          style={{
            color: 'var(--theme-text-primary, #1e293b)'
          }}
        >
          <Menu className="w-6 h-6" />
        </button>

        {theme === 'classic' ? (
          <></>
        ) : theme === 'spiderman' ? (
          <>
            <div className="relative flex items-center justify-center w-10 h-10">
              <SpiderEmblemIcon size={34} glowColor="rgba(0, 210, 255, 0.8)" className="animate-spider-sense" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-black tracking-[0.2em] text-base leading-tight"
                style={{ fontFamily: 'var(--theme-font-heading, "Inter", sans-serif)', color: 'var(--theme-text-primary, #F8FAFC)' }}
              >
                SPIDER-MAN
              </span>
              <span
                className="text-[9px] tracking-[0.3em] uppercase leading-tight font-bold"
                style={{ color: 'var(--theme-accent-glow, #00D2FF)' }}
              >
                NYC WEB NETWORK
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center w-10 h-10">
              <OmegaIcon className="w-9 h-9 drop-shadow-[0_0_12px_rgba(220,38,38,0.7)]" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-extrabold tracking-[0.22em] text-base leading-tight"
                style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}
              >
                THE CRUCIBLE
              </span>
              <span
                className="text-[9px] tracking-[0.35em] uppercase leading-tight"
                style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-accent-glow, #FF3D00)' }}
              >
                CodeCity
              </span>
            </div>
          </>
        )}
      </div>

      {/* CENTER — Context Location */}
      {courseDetailTitle && (
        <div
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold"
          style={{
            background: 'var(--theme-surface-card-alt, rgba(0,0,0,0.4))',
            borderColor: 'var(--theme-border-default, rgba(61,28,28,0.6))',
            color: 'var(--theme-text-secondary, #D1C2C2)',
          }}
        >
          <span style={{ color: 'var(--theme-accent-glow, #FF3D00)' }}>⚔</span>
          <span style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}>{courseDetailTitle}</span>
        </div>
      )}

      {/* RIGHT — Player HUD Status */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Streak Fury */}
        {streak > 0 && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all"
            title={`${streak}-Day Streak`}
            style={{
              background: 'var(--theme-hud-streak-bg, rgba(220,38,38,0.15))',
              borderColor: 'var(--theme-hud-streak-border, #DC2626)',
              color: 'var(--theme-hud-streak-text, #FF3D00)',
            }}
          >
            <span className="text-base leading-none">🔥</span>
            <span className="text-[11px] font-extrabold leading-none">
              {streak}
            </span>
            <span className="text-[9px] leading-none hidden xl:inline opacity-80">Streak</span>
          </div>
        )}

        {/* XP */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all"
          title={`${xp} Total XP`}
          style={{
            background: 'var(--theme-hud-xp-bg, rgba(245,208,96,0.15))',
            borderColor: 'var(--theme-hud-xp-border, #C59B27)',
            color: 'var(--theme-hud-xp-text, #F5C842)',
          }}
        >
          <span className="text-[11px] font-bold leading-none">⭐</span>
          <span className="text-[11px] font-extrabold leading-none">
            {formatXP(xp)} XP
          </span>
        </div>

        {/* Level */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all"
          title={`Level ${level}`}
          style={{
            background: 'var(--theme-hud-lvl-bg, rgba(26,16,16,0.85))',
            borderColor: 'var(--theme-hud-lvl-border, rgba(61,28,28,0.8))',
            color: 'var(--theme-hud-lvl-text, #F5E8E8)',
          }}
        >
          <span className="text-[9px] font-bold leading-none opacity-80 uppercase tracking-wider">LVL</span>
          <span className="text-[12px] font-extrabold leading-none">{level}</span>
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            id="crucible-notifications-btn"
            onClick={() => {
              setShowNotifications((v) => !v)
              setBellShaking(true)
              setTimeout(() => setBellShaking(false), 700)
            }}
            className="relative p-2 rounded-xl transition-colors cursor-pointer"
            title="Dispatches"
            style={{
              background: 'var(--theme-surface-card-alt, rgba(42,20,20,0.5))',
              border: '1px solid var(--theme-border-default, rgba(220,38,38,0.18))',
              color: 'var(--theme-text-muted, #8C7A7A)',
            }}
          >
            <Bell
              className={cn('w-4 h-4', bellShaking && 'animate-bell-shake')}
            />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white dark:border-black"
                style={{ background: 'var(--theme-accent-primary, #DC2626)' }}
              />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              id="crucible-notifications-panel"
              className="absolute right-0 mt-2 w-80 rounded-2xl p-3 z-50 text-left animate-in fade-in shadow-2xl border"
              style={{
                background: 'var(--theme-surface-card, #0E0606)',
                borderColor: 'var(--theme-border-default, rgba(61,28,28,0.9))',
                boxShadow: 'var(--theme-shadow-card, 0 16px 40px rgba(0,0,0,0.9))',
              }}
            >
              <div
                className="flex items-center justify-between pb-2 mb-2 border-b"
                style={{ borderColor: 'var(--theme-border-subtle, rgba(42,20,20,0.8))' }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}
                >
                  Dispatches
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                    style={{
                      background: 'var(--theme-status-hard-bg, rgba(220,38,38,0.2))',
                      borderColor: 'var(--theme-accent-primary, rgba(220,38,38,0.4))',
                      color: 'var(--theme-accent-glow, #FF5722)',
                      fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                    }}
                  >
                    {unreadCount} New
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new dispatches.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className="p-2.5 rounded-xl text-xs transition-colors cursor-pointer border"
                      style={{
                        background: n.unread ? 'var(--theme-surface-card-alt, rgba(26,16,16,0.9))' : 'var(--theme-surface-card, rgba(14,10,10,0.6))',
                        borderColor: n.unread ? 'var(--theme-border-strong, rgba(220,38,38,0.3))' : 'transparent',
                      }}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span
                          style={{
                            fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                            color: n.unread ? 'var(--theme-text-primary, #F5E8E8)' : 'var(--theme-text-muted, #8C7A7A)',
                          }}
                        >
                          {n.title}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: 'var(--theme-text-dim, #554040)' }}>
                          {n.time}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--theme-text-muted, #8C7A7A)' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Menu */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            id="crucible-profile-btn"
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-xl transition-all cursor-pointer group border"
            style={{
              background: 'var(--theme-surface-card-alt, rgba(26,16,16,0.8))',
              borderColor: 'var(--theme-border-default, rgba(61,28,28,0.8))',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase"
              style={{
                background: 'var(--theme-btn-primary-gradient)',
                border: '1px solid var(--theme-border-strong, rgba(245,208,96,0.4))',
                color: '#fff',
                fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
              }}
            >
              {displayName.slice(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span
                className="text-xs font-bold leading-tight truncate max-w-[90px]"
                style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}
              >
                {displayName}
              </span>
              <span
                className="text-[9px] uppercase leading-tight font-semibold"
                style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontFamily: 'var(--theme-font-heading, "Cinzel", serif)' }}
              >
                Tier {level}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: 'var(--theme-text-muted, #8C7A7A)' }} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              id="crucible-profile-dropdown"
              className="absolute right-0 mt-2 w-56 rounded-2xl p-2 z-50 text-left animate-in fade-in shadow-2xl border"
              style={{
                background: 'var(--theme-surface-card, #0E0606)',
                borderColor: 'var(--theme-border-default, rgba(61,28,28,0.9))',
                boxShadow: 'var(--theme-shadow-card, 0 16px 40px rgba(0,0,0,0.9))',
              }}
            >
              <div
                className="px-3 py-2 border-b"
                style={{ borderColor: 'var(--theme-border-subtle, rgba(42,20,20,0.8))' }}
              >
                <div
                  className="font-bold text-xs truncate"
                  style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}
                >
                  {displayName}
                </div>
                <div className="text-[10px] truncate" style={{ color: 'var(--theme-text-muted, #8C7A7A)' }}>
                  {user?.email}
                </div>
              </div>

              <div className="py-1 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); onSelectTab('settings') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  style={{ color: 'var(--theme-text-secondary, #D1C2C2)' }}
                >
                  <Settings className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent-glow, #FF3D00)' }} />
                  <span>Profile Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); onSelectTab('theme') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  style={{ color: 'var(--theme-text-secondary, #D1C2C2)' }}
                >
                  <Palette className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent-cyan, #00E5FF)' }} />
                  <span>Visual Themes</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); signOut() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
