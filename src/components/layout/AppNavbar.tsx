import React, { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  FolderGit2,
  MessageSquare,
  BarChart3,
  LogOut,
  Bell,
  Sparkles,
  Flame,
  Star
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAchievementsAndNotifications } from '../../lib/achievements'
import { CodeQuestLogo } from '../brand/CodeQuestLogo'

export type ActiveTab = 'dashboard' | 'quests' | 'projects' | 'community' | 'analytics'

interface AppNavbarProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, profile, role, signOut } = useAuth()
  const { theme } = useTheme()
  const { notifications, unreadCount, markRead } = useAchievementsAndNotifications(user?.id)
  const [showNotifications, setShowNotifications] = useState(false)

  const username = profile?.username || user?.email?.split('@')[0] || 'Adventurer'
  const xp = profile?.xp || 120
  const streak = profile?.streak || 3
  const level = profile?.level || Math.floor(xp / 100) + 1

  return (
    <nav className="w-full max-w-7xl mx-auto mb-8 rounded-3xl p-3 sm:px-6 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative z-30 select-none transition-colors duration-300"
         style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
      {/* Brand & Role Tag */}
      <div className="flex items-center gap-3">
        <CodeQuestLogo size="sm" showTagline={false} />
        <span className="px-2 py-0.5 rounded-full text-[8.5px] font-pixel font-bold uppercase border shadow-inner"
              style={{ 
                background: 'var(--theme-bg-subtle)', 
                color: role === 'admin' ? 'var(--theme-accent-primary)' : 'var(--theme-accent-cyan)',
                borderColor: role === 'admin' ? 'var(--theme-accent-primary)' : 'var(--theme-accent-cyan)'
              }}>
          {role === 'admin' ? 'ADMIN' : 'STUDENT'}
        </span>
      </div>

      {/* Navigation Tabs with Gamified 3D Feel */}
      <div className="flex items-center p-1.5 rounded-2xl gap-1.5 flex-wrap justify-center border shadow-inner transition-colors duration-300"
           style={{ background: 'var(--theme-bg-canvas)', borderColor: 'var(--theme-border-subtle)' }}>
        
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'shadow-md scale-102 border' : 'hover:scale-105 opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'dashboard' ? 'var(--theme-surface-card-alt)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
            borderColor: activeTab === 'dashboard' ? 'var(--theme-accent-secondary)' : 'transparent',
          }}
        >
          <LayoutDashboard className="w-4 h-4" style={{ color: activeTab === 'dashboard' ? 'var(--theme-accent-secondary)' : 'inherit' }} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('quests')}
          className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quests' ? 'shadow-md scale-102 border' : 'hover:scale-105 opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'quests' ? 'var(--theme-surface-card-alt)' : 'transparent',
            color: activeTab === 'quests' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
            borderColor: activeTab === 'quests' ? 'var(--theme-accent-cyan)' : 'transparent',
          }}
        >
          <BookOpen className="w-4 h-4" style={{ color: activeTab === 'quests' ? 'var(--theme-accent-cyan)' : 'inherit' }} />
          <span>Quests</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('projects')}
          className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects' ? 'shadow-md scale-102 border' : 'hover:scale-105 opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'projects' ? 'var(--theme-surface-card-alt)' : 'transparent',
            color: activeTab === 'projects' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
            borderColor: activeTab === 'projects' ? 'var(--theme-accent-primary)' : 'transparent',
          }}
        >
          <FolderGit2 className="w-4 h-4" style={{ color: activeTab === 'projects' ? 'var(--theme-accent-primary)' : 'inherit' }} />
          <span>Projects</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('community')}
          className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'community' ? 'shadow-md scale-102 border' : 'hover:scale-105 opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'community' ? 'var(--theme-surface-card-alt)' : 'transparent',
            color: activeTab === 'community' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
            borderColor: activeTab === 'community' ? '#9333EA' : 'transparent',
          }}
        >
          <MessageSquare className="w-4 h-4" style={{ color: activeTab === 'community' ? '#9333EA' : 'inherit' }} />
          <span>Community</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'shadow-md scale-102 border' : 'hover:scale-105 opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'analytics' ? 'var(--theme-surface-card-alt)' : 'transparent',
            color: activeTab === 'analytics' ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
            borderColor: activeTab === 'analytics' ? 'var(--theme-accent-secondary)' : 'transparent',
          }}
        >
          <BarChart3 className="w-4 h-4" style={{ color: activeTab === 'analytics' ? 'var(--theme-accent-secondary)' : 'inherit' }} />
          <span>Analytics</span>
        </button>
      </div>

      {/* Gamified HUD Stats (XP, Streak, Level) & User Actions */}
      <div className="flex items-center gap-3">
        {/* XP Counter Pill */}
        <div className="hidden lg:flex items-center gap-1.5 border-2 px-3 py-1.5 rounded-2xl shadow-inner transition-colors duration-300"
             style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-accent-secondary)' }}>
          <Star className="w-4 h-4 animate-pulse" style={{ color: 'var(--theme-accent-secondary)', fill: 'var(--theme-accent-secondary)' }} />
          <span className="font-pixel text-[9px] font-bold tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>{xp} XP</span>
        </div>

        {/* Streak Counter Pill */}
        <div className="hidden lg:flex items-center gap-1.5 border-2 px-3 py-1.5 rounded-2xl shadow-inner transition-colors duration-300"
             style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-accent-primary)' }}>
          <Flame className="w-4 h-4" style={{ color: 'var(--theme-accent-primary)', fill: 'var(--theme-accent-primary)' }} />
          <span className="font-pixel text-[9px] font-bold tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>{streak}D</span>
        </div>

        {/* Level Badge Pill */}
        <button
          type="button"
          onClick={() => onTabChange('levels')}
          className="hidden sm:flex items-center gap-1.5 border-2 px-3 py-1.5 rounded-2xl shadow-inner transition-colors duration-300 cursor-pointer hover:scale-105 active:scale-95"
          style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-accent-cyan)' }}
          title="View Level Progression"
        >
          <span className="font-pixel text-[8px] uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>LVL {level}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl border transition-all relative cursor-pointer shadow-sm active:scale-95"
            style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)', color: 'var(--theme-text-muted)' }}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full font-pixel text-[8px] flex items-center justify-center font-bold animate-bounce text-black shadow-md"
                    style={{ background: 'var(--theme-accent-secondary)' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl border p-4 z-50 text-left animate-scale-in"
                 style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
              <div className="flex items-center justify-between border-b pb-2.5 mb-3" style={{ borderColor: 'var(--theme-border-subtle)' }}>
                <div className="font-pixel text-xs font-bold uppercase flex items-center gap-1.5" style={{ color: 'var(--theme-text-primary)' }}>
                  <span>🔔</span>
                  <span>Notifications</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>{unreadCount} Unread</span>
              </div>

              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto hide-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs font-medium font-pixel text-[9px] opacity-60" style={{ color: 'var(--theme-text-muted)' }}>
                    NO NOTIFICATIONS YET
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        n.isRead ? 'opacity-60' : 'shadow-md'
                      }`}
                      style={{ 
                        background: n.isRead ? 'var(--theme-bg-subtle)' : 'var(--theme-surface-card-alt)', 
                        borderColor: n.isRead ? 'var(--theme-border-subtle)' : 'var(--theme-accent-cyan)' 
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">{n.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-xs leading-tight" style={{ color: 'var(--theme-text-primary)' }}>{n.title}</div>
                          <div className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--theme-text-secondary)' }}>{n.message}</div>
                          <div className="text-[9px] mt-1 opacity-70" style={{ color: 'var(--theme-text-muted)' }}>{n.createdAt}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Portrait */}
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--theme-border-subtle)' }}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={username}
              className="w-10 h-10 rounded-2xl object-cover border-2 shadow-sm"
              style={{ borderColor: 'var(--theme-accent-cyan)' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-sm font-black shadow-inner"
                 style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-accent-cyan)', color: 'var(--theme-accent-cyan)' }}>
              🧑‍💻
            </div>
          )}

          <div className="text-right hidden xl:flex flex-col mr-2">
            <div className="text-xs font-bold flex items-center gap-1 justify-end" style={{ color: 'var(--theme-text-primary)' }}>
              <Sparkles className="w-3 h-3" style={{ color: 'var(--theme-accent-secondary)' }} />
              <span>{username}</span>
            </div>
            <div className="text-[10px] font-medium truncate max-w-[120px]" style={{ color: 'var(--theme-text-muted)' }}>{user?.email || profile?.email}</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => signOut()}
          className="p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 hover:-translate-y-0.5 shadow-sm"
          style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-subtle)', color: 'var(--theme-accent-primary)' }}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
