/**
 * Crucible Design System - Shared Dynamic Tokens & Primitives
 * Dynamically maps to active CSS theme variables while maintaining type-safety
 */

export const C = {
  // Backgrounds
  get bg() { return 'var(--theme-bg-canvas, #070505)' },
  get bgCard() { return 'var(--theme-surface-card-translucent, rgba(14,10,10,0.92))' },
  get bgPanel() { return 'var(--theme-surface-panel, rgba(20,12,12,0.88))' },

  // Borders
  get border() { return 'var(--theme-border-default, rgba(61,28,28,0.8))' },
  get borderHot() { return 'var(--theme-border-hot, rgba(220,38,38,0.5))' },
  get borderGold() { return 'var(--theme-accent-secondary, rgba(197,155,39,0.45))' },
  get borderFrost() { return 'var(--theme-accent-cyan, rgba(0,229,255,0.25))' },

  // Text
  get textPrimary() { return 'var(--theme-text-primary, #E8D5D5)' },
  get textSecondary() { return 'var(--theme-text-secondary, #9C7B7B)' },
  get textMuted() { return 'var(--theme-text-muted, #5C3E3E)' },

  // Accents
  get crimson() { return 'var(--theme-accent-primary, #DC2626)' },
  get crimsonDim() { return 'var(--theme-accent-primary-dim, rgba(220,38,38,0.15))' },

  // Gold / Hacksilver
  get gold() { return 'var(--theme-accent-secondary, #C59B27)' },
  get goldBright() { return 'var(--theme-accent-secondary, #F5D060)' },

  // Frost
  get frost() { return 'var(--theme-accent-cyan, #00E5FF)' },
  get frostDim() { return 'rgba(0,229,255,0.12)' },

  // Lava / Molten
  get lava() { return 'var(--theme-accent-glow, #FF3D00)' },
  get lavaDim() { return 'rgba(255,61,0,0.12)' },
} as const

/* Status Badge */
export function statusBadgeStyle(status: string): { bg: string; color: string; label: string; pulse: boolean } {
  switch (status) {
    case 'live':
      return { bg: 'var(--theme-status-hard-bg, rgba(220,38,38,0.2))', color: 'var(--theme-accent-glow, #FF6060)', label: 'LIVE INVASION', pulse: true }
    case 'upcoming':
      return { bg: 'var(--theme-status-med-bg, rgba(197,155,39,0.18))', color: 'var(--theme-accent-secondary, #F5D060)', label: 'UPCOMING RAGNAROK', pulse: false }
    case 'ended':
      return { bg: 'rgba(61,28,28,0.4)', color: 'var(--theme-text-muted, #9C7B7B)', label: 'FALLEN REALM', pulse: false }
    default:
      return { bg: 'rgba(61,28,28,0.3)', color: 'var(--theme-text-muted, #9C7B7B)', label: status.toUpperCase(), pulse: false }
  }
}

export function tieBreakerLabel(rule: string): string {
  switch (rule) {
    case 'fastest_time': return 'Fastest Slaughter'
    case 'least_submissions': return 'Least Sacrifices'
    case 'highest_speed_bonus': return 'Highest Speed Bonus'
    case 'earliest_submission': return 'First Blood'
    default: return rule.replace(/_/g, ' ')
  }
}

export function difficultyLabel(d: string): string {
  switch (d?.toLowerCase()) {
    case 'beginner': return 'Apprentice Smith'
    case 'intermediate': return 'Journeyman'
    case 'advanced': return 'Master Smith'
    default: return d ?? 'Apprentice Smith'
  }
}

export function relativeTime(dateStr: string, nowMs: number = Date.now()): string {
  try {
    const targetMs = new Date(dateStr).getTime()
    if (isNaN(targetMs)) return ''
    const diff = nowMs - targetMs

    // Future timestamp
    if (diff < 0) {
      const remainingSec = Math.floor(-diff / 1000)
      if (remainingSec < 60) return `in ${remainingSec}s`
      const m = Math.floor(remainingSec / 60)
      if (m < 60) return `in ${m}m`
      const h = Math.floor(m / 60)
      if (h < 24) return `in ${h}h`
      const d = Math.floor(h / 24)
      return `in ${d}d`
    }

    // Past timestamp
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch {
    return ''
  }
}

export function formatDateTime(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return isoStr
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

