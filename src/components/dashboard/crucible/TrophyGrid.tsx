import React from 'react'
import type { BadgeItem, AchievementItem, ActivityItem } from '../../../lib/achievements'

// ─── Trophy Grid (Badges & Achievements) ────────────────────────────────────

interface TrophyGridProps {
  badges: BadgeItem[]
  achievements: AchievementItem[]
  activities: ActivityItem[]
}

function formatActivityIcon(actionType: string): string {
  switch (actionType) {
    case 'completed_lesson': return '⚔️'
    case 'earned_badge': return '🏆'
    case 'level_up': return '⚡'
    case 'streak': return '🔥'
    case 'completed_course': return '📜'
    default: return 'ᚱ'
  }
}

export const TrophyGrid: React.FC<TrophyGridProps> = ({ badges, achievements, activities }) => {
  const earnedBadges = badges.filter((b) => b.isUnlocked)
  const lockedBadges = badges.filter((b) => !b.isUnlocked)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      {/* ── Left: Trophies of War ──────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #110808 0%, #080404 100%)',
          border: '1px solid rgba(80, 30, 30, 0.9)',
          boxShadow: '0 8px 32px rgba(7,5,5,0.8)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(61, 28, 28, 0.8)' }}
        >
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: '18px' }}>🏆</span>
            <span
              className="font-bold tracking-[0.2em] uppercase text-xs"
              style={{ color: '#FF3D00', fontFamily: "'Cinzel', serif" }}
            >
              TROPHIES OF VALHALLA
            </span>
          </div>
          <span
            className="font-bold tabular-nums tracking-widest text-[11px]"
            style={{ color: '#F5D060', fontFamily: "'Cinzel', serif" }}
          >
            {earnedBadges.length}/{badges.length} CLAIMED
          </span>
        </div>

        <div className="p-5">
          {badges.length === 0 ? (
            <div className="py-12 text-center">
              <p
                className="font-bold uppercase tracking-[0.2em]"
                style={{ color: '#8A7A7A', fontSize: '10px', fontFamily: "'Cinzel', serif" }}
              >
                NO TROPHIES CLAIMED YET
              </p>
            </div>
          ) : (
            <>
              {/* Earned badges */}
              {earnedBadges.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center text-center gap-2 p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                      style={{
                        background: 'linear-gradient(135deg, #1f0e0e 0%, #110808 100%)',
                        border: '1px solid rgba(245, 208, 96, 0.4)',
                        boxShadow: '0 0 16px rgba(220, 38, 38, 0.2), inset 0 0 10px rgba(245, 208, 96, 0.06)',
                      }}
                    >
                      {/* Badge icon with crimson backlight */}
                      <div
                        className="relative w-12 h-12 flex items-center justify-center rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(245, 208, 96, 0.2) 0%, transparent 70%)',
                          boxShadow: '0 0 16px rgba(220, 38, 38, 0.4)',
                        }}
                      >
                        <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(245,208,96,0.6))' }}>
                          {badge.icon}
                        </span>
                      </div>

                      <div>
                        <div
                          className="font-bold text-xs uppercase tracking-wide leading-tight"
                          style={{ color: '#F1E5E5', fontFamily: "'Cinzel', serif", fontSize: '11px' }}
                        >
                          {badge.title}
                        </div>
                        {badge.unlockedAt && (
                          <div
                            style={{ color: '#F5D060', fontSize: '9px', marginTop: '2px', fontFamily: "'Inter', sans-serif" }}
                          >
                            {new Date(badge.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Locked badges */}
              {lockedBadges.length > 0 && (
                <>
                  <div style={{ borderTop: '1px solid rgba(61, 28, 28, 0.5)', marginBottom: '14px' }} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lockedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center text-center gap-2 p-3.5 rounded-xl"
                        style={{
                          background: '#0a0606',
                          border: '1px solid #1c1010',
                          opacity: 0.45,
                        }}
                      >
                        <div
                          className="w-12 h-12 flex items-center justify-center rounded-full"
                          style={{ background: '#120A0A', filter: 'grayscale(1)' }}
                        >
                          <span style={{ fontSize: '24px', filter: 'grayscale(1)' }}>{badge.icon}</span>
                        </div>
                        <div
                          className="font-bold text-xs uppercase tracking-wider leading-tight"
                          style={{ color: '#8A7A7A', fontSize: '10px', fontFamily: "'Cinzel', serif" }}
                        >
                          {badge.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Mythic Labors */}
              {achievements.length > 0 && (
                <div className="mt-5">
                  <div style={{ borderTop: '1px solid rgba(61, 28, 28, 0.5)', marginBottom: '14px' }} />
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontSize: '14px' }}>⚡</span>
                    <span
                      className="font-bold tracking-[0.2em] uppercase text-xs"
                      style={{ color: '#C59B27', fontFamily: "'Cinzel', serif" }}
                    >
                      MYTHIC LABORS
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {achievements.slice(0, 4).map((ach) => (
                      <div
                        key={ach.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl"
                        style={{
                          background: ach.isUnlocked ? 'rgba(245, 208, 96, 0.1)' : 'rgba(12, 6, 6, 0.85)',
                          border: ach.isUnlocked ? '1px solid rgba(245, 208, 96, 0.4)' : '1px solid #201010',
                          opacity: ach.isUnlocked ? 1 : 0.6,
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{ach.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-bold text-xs uppercase tracking-wide truncate"
                            style={{
                              color: ach.isUnlocked ? '#FFFFFF' : '#8A7A7A',
                              fontFamily: "'Cinzel', serif",
                              fontSize: '11px',
                            }}
                          >
                            {ach.title}
                          </div>
                          <div
                            className="text-xs truncate font-medium mt-0.5"
                            style={{ color: '#A89898', fontSize: '11px', fontFamily: "'Inter', sans-serif" }}
                          >
                            {ach.description}
                          </div>
                          {!ach.isUnlocked && ach.targetCount > 1 && (
                            <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: '#1c1010' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, (ach.progressCount / ach.targetCount) * 100)}%`,
                                  background: 'linear-gradient(90deg, #991B1B, #DC2626)',
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <span
                          className="font-bold shrink-0 tracking-wider"
                          style={{ color: '#F5D060', fontSize: '11px', fontFamily: "'Cinzel', serif" }}
                        >
                          +{ach.rewardXp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right: Saga Chronicles (Activity History) ──────────────── */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #110808 0%, #080404 100%)',
          border: '1px solid rgba(80, 30, 30, 0.9)',
          boxShadow: '0 8px 32px rgba(7,5,5,0.8)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-2.5"
          style={{ borderBottom: '1px solid rgba(61, 28, 28, 0.8)' }}
        >
          <span style={{ fontSize: '18px' }}>📜</span>
          <span
            className="font-bold tracking-[0.2em] uppercase text-xs"
            style={{ color: '#FF3D00', fontFamily: "'Cinzel', serif" }}
          >
            SAGA CHRONICLES (DEEDS OF VALOR)
          </span>
        </div>

        <div className="p-5">
          {activities.length === 0 ? (
            <div className="py-12 text-center">
              <p
                className="font-bold uppercase tracking-[0.2em]"
                style={{ color: '#8A7A7A', fontSize: '10px', fontFamily: "'Cinzel', serif" }}
              >
                NO CHRONICLES RECORDED YET
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col gap-0">
              {/* Vertical timeline line */}
              <div
                className="absolute left-5 top-3 bottom-3 w-0.5"
                style={{ background: 'linear-gradient(to bottom, #7F1D1D, #3D1C1C, transparent)' }}
              />

              {activities.map((act, idx) => {
                const icon = formatActivityIcon(act.actionType)
                const isEarnedBadge = act.actionType === 'earned_badge'

                return (
                  <div
                    key={act.id}
                    className="relative flex items-start gap-4 py-3.5"
                    style={{ paddingLeft: '44px' }}
                  >
                    {/* Timeline node */}
                    <div
                      className="absolute left-2 top-3 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: isEarnedBadge
                          ? 'linear-gradient(135deg, #B91C1C, #DC2626)'
                          : 'rgba(28, 16, 16, 0.9)',
                        border: isEarnedBadge
                          ? '1px solid rgba(255, 61, 0, 0.6)'
                          : '1px solid #3D1C1C',
                        boxShadow: isEarnedBadge ? '0 0 10px rgba(220, 38, 38, 0.5)' : 'none',
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>{icon}</span>
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 min-w-0">
                      {isEarnedBadge ? (
                        <div
                          className="p-2.5 rounded-lg"
                          style={{
                            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2), rgba(245, 158, 11, 0.12))',
                            border: '1px solid rgba(245, 208, 96, 0.3)',
                          }}
                        >
                          <div
                            className="font-bold text-xs uppercase tracking-wide"
                            style={{ color: '#FFFFFF', fontFamily: "'Cinzel', serif" }}
                          >
                            {act.title}
                          </div>
                          <div
                            className="text-xs mt-0.5 font-bold uppercase tracking-wider"
                            style={{ color: '#F5D060', fontSize: '9px', fontFamily: "'Cinzel', serif" }}
                          >
                            ⚡ Trophy Claimed
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="font-medium text-xs leading-tight"
                            style={{ color: '#D4C4C4', fontFamily: "'Inter', sans-serif" }}
                          >
                            {act.title}
                          </div>
                        </div>
                      )}
                      <div className="mt-1 text-[10px]" style={{ color: '#786868' }}>
                        {act.createdAt}
                      </div>
                    </div>

                    {/* Separator line */}
                    {idx < activities.length - 1 && (
                      <div
                        className="absolute bottom-0 left-10 right-0 h-px"
                        style={{ background: 'rgba(61, 28, 28, 0.4)' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
