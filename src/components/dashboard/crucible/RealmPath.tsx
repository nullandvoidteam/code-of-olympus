import React from 'react'
import { Lock } from 'lucide-react'
import type { LearningPath } from '../../../lib/learning'

interface RealmPathProps {
  islands: LearningPath[]
  onSelectRealm?: (islandId: string) => void
}

const REALM_ICONS: Record<string, string> = {
  python: '🐍',
  javascript: '⚡',
  web: '🕸️',
  data: '📊',
  ai: '🤖',
  default: '🌌',
}

function getRealmIcon(island: LearningPath): string {
  const slug = (island.slug || island.island_name || '').toLowerCase()
  for (const key of Object.keys(REALM_ICONS)) {
    if (slug.includes(key)) return REALM_ICONS[key]
  }
  return REALM_ICONS.default
}

export const RealmPath: React.FC<RealmPathProps> = ({ islands, onSelectRealm }) => {
  if (!islands || islands.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: '#120808', border: '1px solid rgba(80, 30, 30, 0.85)' }}
      >
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: '#8A7A7A', fontFamily: "'Cinzel', serif" }}
        >
          NO REALMS DISCOVERED IN THE WORLD TREE
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #110808) 0%, var(--theme-surface-card, #080404) 100%)',
        border: '1px solid var(--theme-border-default, rgba(80, 30, 30, 0.9))',
        boxShadow: 'var(--theme-shadow-card, 0 8px 32px rgba(7,5,5,0.8))',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.8))' }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: '18px' }}>🌍</span>
          <span
            className="font-bold tracking-[0.2em] uppercase text-xs"
            style={{ color: 'var(--theme-accent-glow, #FF3D00)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
          >
            NINE REALMS PATH (YGGDRASIL)
          </span>
        </div>
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
        >
          {islands.filter((i) => i.isCompleted).length}/{islands.length} CONQUERED
        </span>
      </div>

      {/* Scrollable realm nodes */}
      <div className="overflow-x-auto p-4">
        <div className="flex items-stretch gap-0 min-w-max px-2 py-4">
          {islands.map((island, idx) => {
            const isCompleted = island.isCompleted
            const isActive = !isCompleted && island.completedCourses > 0
            const isLocked = !isCompleted && !isActive && island.completedCourses === 0 && idx > 0

            return (
              <React.Fragment key={island.id}>
                {/* Connecting bridge */}
                {idx > 0 && (
                  <div
                    className="self-center shrink-0 w-8 h-1 relative"
                    style={{
                      background: isCompleted
                        ? 'linear-gradient(90deg, #B45309, #F5D060)'
                        : isActive
                        ? 'linear-gradient(90deg, #DC2626, #3D1C1C)'
                        : '#1c1010',
                    }}
                  >
                    {(isCompleted || isActive) && (
                      <div
                        className="absolute inset-0 opacity-60"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,61,0,0.5), transparent)' }}
                      />
                    )}
                  </div>
                )}

                {/* Realm Node Tablet */}
                <button
                  type="button"
                  onClick={() => !isLocked && onSelectRealm?.(island.id)}
                  disabled={isLocked}
                  className="relative flex flex-col items-center gap-2.5 p-5 rounded-2xl transition-all duration-200 shrink-0 w-40 group cursor-pointer"
                  style={{
                    background: isCompleted
                      ? 'linear-gradient(135deg, #1f1008 0%, #0E0A0A 100%)'
                      : isActive
                      ? 'linear-gradient(135deg, #1c0a0a 0%, #110808 100%)'
                      : '#080505',
                    border: isCompleted
                      ? '2px solid rgba(245, 208, 96, 0.7)'
                      : isActive
                      ? '2px solid rgba(220, 38, 38, 0.8)'
                      : '1px solid #241414',
                    boxShadow: isCompleted
                      ? '0 0 20px rgba(245, 208, 96, 0.25), inset 0 0 10px rgba(245, 208, 96, 0.08)'
                      : isActive
                      ? '0 0 20px rgba(220, 38, 38, 0.3), inset 0 0 10px rgba(255, 61, 0, 0.08)'
                      : 'none',
                    opacity: isLocked ? 0.45 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Lock overlay */}
                  {isLocked && (
                    <div
                      className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.65)' }}
                    >
                      <Lock className="w-5 h-5" style={{ color: '#8A7A7A' }} />
                    </div>
                  )}

                  {/* Realm icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: isCompleted
                        ? 'rgba(245, 208, 96, 0.15)'
                        : isActive
                        ? 'rgba(220, 38, 38, 0.18)'
                        : 'rgba(28, 16, 16, 0.8)',
                      border: isCompleted
                        ? '1px solid rgba(245, 208, 96, 0.4)'
                        : isActive
                        ? '1px solid rgba(220, 38, 38, 0.4)'
                        : '1px solid #1c1010',
                    }}
                  >
                    {getRealmIcon(island)}
                  </div>

                  {/* Realm name */}
                  <div className="text-center">
                    <div
                      className="font-bold text-xs uppercase tracking-wider leading-tight"
                      style={{
                        color: isCompleted ? '#F5D060' : isActive ? '#FFFFFF' : '#8A7A7A',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '11px',
                      }}
                    >
                      {island.title}
                    </div>
                    {island.island_name && (
                      <div
                        className="text-[10px] mt-0.5 font-medium"
                        style={{ color: '#8A7A7A' }}
                      >
                        {island.island_name}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  {isCompleted && (
                    <div
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(245, 208, 96, 0.2)', border: '1px solid rgba(245, 208, 96, 0.5)' }}
                    >
                      <span
                        className="font-bold uppercase tracking-wider"
                        style={{ color: '#F5D060', fontSize: '8px', fontFamily: "'Cinzel', serif" }}
                      >
                        CONQUERED
                      </span>
                    </div>
                  )}

                  {/* Course progress for active realms */}
                  {!isCompleted && !isLocked && (
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span style={{ color: '#8A7A7A', fontSize: '9px' }}>
                          {island.completedCourses}/{island.totalCourses} sagas
                        </span>
                        <span style={{ color: '#FF3D00', fontSize: '9px', fontWeight: 700 }}>
                          {island.progressPercent}%
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: '#1c1010' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${island.progressPercent}%`,
                            background: 'linear-gradient(90deg, #991B1B, #FF3D00)',
                            boxShadow: '0 0 6px rgba(255,61,0,0.6)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <span
                      className="font-bold uppercase tracking-wider"
                      style={{ color: '#502020', fontSize: '8px', fontFamily: "'Cinzel', serif" }}
                    >
                      SEALED
                    </span>
                  )}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
