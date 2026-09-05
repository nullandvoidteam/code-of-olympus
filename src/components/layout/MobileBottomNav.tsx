import React from 'react'
import {
  Terminal,
  BookOpen,
  Code2,
  Layers,
  Gamepad2,
  Palette,
  User,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { NavItemKey } from './Sidebar'

interface MobileBottomNavProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const items = [
    { key: 'dashboard' as NavItemKey, label: 'Home', icon: Terminal },
    { key: 'learn' as NavItemKey, label: 'Learn', icon: BookOpen },
    { key: 'practice' as NavItemKey, label: 'Practice', icon: Code2 },
    { key: 'build' as NavItemKey, label: 'Build', icon: Layers },
    { key: 'arcade' as NavItemKey, label: 'Arcade', icon: Gamepad2 },
    { key: 'theme' as NavItemKey, label: 'Theme', icon: Palette },
    { key: 'settings' as NavItemKey, label: 'Profile', icon: User },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 backdrop-blur-md border-t flex items-center justify-around px-2 z-30 select-none transition-colors duration-200"
      style={{
        background: 'var(--theme-surface-card-translucent, rgba(14, 8, 8, 0.95))',
        borderColor: 'var(--theme-border-default, #ece7df)',
        boxShadow: 'var(--theme-shadow-card, 0 -4px 16px rgba(0,0,0,0.4))',
      }}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectTab(item.key)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer"
            style={{
              color: isActive ? 'var(--theme-accent-primary, #10B981)' : 'var(--theme-text-muted, #78716c)',
            }}
          >
            <div
              className="p-1 rounded-lg transition-colors"
              style={{
                background: isActive ? 'var(--theme-accent-primary-dim, rgba(16, 185, 129, 0.15))' : 'transparent',
                color: isActive ? 'var(--theme-accent-primary, #10B981)' : 'var(--theme-text-muted, #78716c)',
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={cn("text-[9px] leading-none", isActive ? "font-bold" : "font-medium")}
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
