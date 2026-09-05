import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export interface BadgeItem {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  category: string
  isUnlocked: boolean
  unlockedAt?: string
}

export interface AchievementItem {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  targetCount: number
  progressCount: number
  rewardXp: number
  isUnlocked: boolean
  isClaimed: boolean
  claimedAt?: string
}

export interface ActivityItem {
  id: string
  actionType: string
  title: string
  createdAt: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  icon: string
  isRead: boolean
  createdAt: string
}

function formatRelativeOrLocaleTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export async function fetchUserBadges(userId?: string): Promise<BadgeItem[]> {
  try {
    const { data: allBadges, error: badgesErr } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true })

    if (badgesErr || !allBadges || allBadges.length === 0) {
      return []
    }

    const unlockedMap = new Map<string, string>()

    if (userId) {
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', userId)

      if (userBadges) {
        userBadges.forEach((ub) => {
          unlockedMap.set(ub.badge_id, ub.unlocked_at)
        })
      }
    }

    const uniqueBadgesMap = new Map<string, any>()
    for (const b of allBadges) {
      if (!uniqueBadgesMap.has(b.slug)) {
        uniqueBadgesMap.set(b.slug, b)
      }
    }
    const uniqueBadges = Array.from(uniqueBadgesMap.values())

    return uniqueBadges.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      description: b.description || '',
      icon: b.icon || '🏅',
      category: b.category || 'general',
      isUnlocked: unlockedMap.has(b.id),
      unlockedAt: unlockedMap.get(b.id),
    }))
  } catch (err) {
    console.error('Error fetching badges:', err)
    return []
  }
}

export async function fetchUserAchievements(userId?: string): Promise<AchievementItem[]> {
  try {
    const [achRes, profileRes, progressRes, userAchRes] = await Promise.all([
      supabase.from('achievements').select('*').order('created_at', { ascending: true }),
      userId ? supabase.from('profiles').select('level, streak, daily_goal_xp, daily_xp_earned').eq('id', userId).maybeSingle() : Promise.resolve({ data: null }),
      userId ? supabase.from('lesson_progress').select('lesson_id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', true) : Promise.resolve({ count: 0 }),
      userId ? supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', userId).eq('is_unlocked', true) : Promise.resolve({ data: null })
    ])

    const claimedMap = new Map<string, string>()
    if (userAchRes.data) {
      userAchRes.data.forEach((ua) => {
        claimedMap.set(ua.achievement_id, ua.unlocked_at)
      })
    }

    const allAch = achRes.data || []
    if (allAch.length === 0) return []

    const uniqueAchMap = new Map<string, any>()
    for (const a of allAch) {
      if (!uniqueAchMap.has(a.slug)) {
        uniqueAchMap.set(a.slug, a)
      }
    }
    const uniqueAch = Array.from(uniqueAchMap.values())

    const profile = profileRes.data
    const completedLessonsCount = progressRes.count || 0

    return uniqueAch.map((a) => {
      let progressCount = 0
      let isUnlocked = false

      if (a.slug === 'novice-coder') {
        isUnlocked = (profile?.level ?? 1) >= 2
        progressCount = isUnlocked ? 1 : 0
      } else if (a.slug === 'daily-dedication') {
        isUnlocked = (profile?.daily_goal_xp ?? 50) > 0 && (profile?.daily_xp_earned ?? 0) >= (profile?.daily_goal_xp ?? 50)
        progressCount = isUnlocked ? 1 : 0
      } else if (a.slug === 'trailblazer') {
        const target = a.target_count || 3
        progressCount = Math.min(target, completedLessonsCount)
        isUnlocked = completedLessonsCount >= target
      } else {
        const target = a.target_count || 1
        progressCount = Math.min(target, completedLessonsCount)
        isUnlocked = completedLessonsCount >= target
      }

      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description || '',
        icon: a.icon || '🏆',
        targetCount: a.target_count || 1,
        progressCount,
        rewardXp: a.reward_xp || 50,
        isUnlocked,
        isClaimed: claimedMap.has(a.id),
        claimedAt: claimedMap.get(a.id),
      }
    })
  } catch (err) {
    console.error('Error fetching achievements:', err)
    return []
  }
}

export async function syncUserBadgesAndAchievements(userId: string): Promise<void> {
  if (!userId) return
  // Dynamically computed on read, no redundant writes needed
}

export async function claimAchievement(userId: string, achievementId: string): Promise<void> {
  if (!userId || !achievementId) return;
  try {
    const { error } = await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievementId,
      is_unlocked: true,
      unlocked_at: new Date().toISOString()
    });
    if (error) {
      // If it fails due to unique constraint, it means it's already claimed
      console.warn('Achievement claim might already exist', error);
    }
  } catch (err) {
    console.error('Error claiming achievement:', err)
  }
}

export async function recordUserActivity(userId: string, actionType: string, title: string): Promise<void> {
  try {
    await supabase.from('activity_history').insert({
      user_id: userId,
      action_type: actionType,
      title,
    })
  } catch (err) {
    console.error('Error recording activity:', err)
  }
}

export async function createUserNotification(userId: string, title: string, message: string, icon: string = '🔔'): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      icon,
    })
  } catch (err) {
    console.error('Error creating notification:', err)
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  } catch (err) {
    console.error('Error marking notification read:', err)
  }
}

export function useAchievementsAndNotifications(userId?: string) {
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!userId) {
      setBadges([])
      setAchievements([])
      setActivities([])
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await syncUserBadgesAndAchievements(userId)

      const [loadedBadges, loadedAchievements, notifRes, actRes] = await Promise.all([
        fetchUserBadges(userId),
        fetchUserAchievements(userId),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('activity_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setBadges(loadedBadges)
      setAchievements(loadedAchievements)

      if (notifRes.data) {
        setNotifications(
          notifRes.data.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            icon: n.icon || '🔔',
            isRead: n.is_read,
            createdAt: formatRelativeOrLocaleTime(n.created_at),
          }))
        )
      } else {
        setNotifications([])
      }

      if (actRes.data) {
        setActivities(
          actRes.data.map((a) => ({
            id: a.id,
            actionType: a.action_type,
            title: a.title,
            createdAt: formatRelativeOrLocaleTime(a.created_at),
          }))
        )
      } else {
        setActivities([])
      }
    } catch (err) {
      console.error('Error loading achievements and notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    if (userId && mounted) {
      loadData()
    } else if (!userId) {
      setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [userId, loadData])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    await markNotificationAsRead(id)
  }, [])

  const logAction = useCallback(async (actionType: string, title: string) => {
    if (!userId) return
    await recordUserActivity(userId, actionType, title)
    await loadData()
  }, [userId, loadData])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    badges,
    achievements,
    activities,
    notifications,
    unreadCount,
    loading,
    markRead,
    logAction,
    refreshAll: loadData,
  }
}

export interface AchievementTrigger {
  id: string
  achievement_id: string
  trigger_type: string
  condition_key: string
  condition_value: any
}

export async function fetchAdminAchievements(): Promise<AchievementItem[]> {
  const { data, error } = await supabase.from('achievements').select('*').order('created_at', { ascending: true })
  if (error) return []
  return (data || []).map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    icon: a.icon,
    targetCount: a.target_count,
    rewardXp: a.reward_xp,
    progressCount: 0,
    isUnlocked: false,
    isClaimed: false
  }))
}

export async function createAdminAchievement(ach: any) {
  const { data, error } = await supabase.from('achievements').insert(ach).select().single()
  if (error) {
    console.error(error)
    return null
  }
  return data
}

export async function updateAdminAchievement(id: string, updates: any) {
  const { data, error } = await supabase.from('achievements').update(updates).eq('id', id).select().single()
  if (error) return null
  return data
}

export async function deleteAdminAchievement(id: string) {
  await supabase.from('achievements').delete().eq('id', id)
}

export async function fetchAchievementTriggers(achievementId: string): Promise<AchievementTrigger[]> {
  const { data, error } = await supabase.from('achievement_triggers').select('*').eq('achievement_id', achievementId)
  if (error) return []
  return data || []
}

export async function saveAchievementTrigger(trigger: Omit<AchievementTrigger, 'id'>) {
  const { data, error } = await supabase.from('achievement_triggers').insert(trigger).select().single()
  if (error) {
    console.error(error)
    return null
  }
  return data
}

export async function deleteAchievementTrigger(id: string) {
  await supabase.from('achievement_triggers').delete().eq('id', id)
}

export async function evaluateTriggersForUser(userId: string, actionType: string, metrics: any) {
  try {
    const { data: triggers } = await supabase
      .from('achievement_triggers')
      .select('*, achievements(*)')
      .eq('condition_key', actionType)
      
    if (!triggers || triggers.length === 0) return

    for (const trig of triggers) {
      let shouldProgress = false
      if (trig.trigger_type === 'ACTION_COUNT') {
        shouldProgress = true
      } else if (trig.trigger_type === 'LEVEL_REACHED') {
        if (metrics?.level && trig.condition_value?.target && metrics.level >= trig.condition_value.target) {
          shouldProgress = true
        }
      }
      
      if (shouldProgress) {
        console.log(`[RulesEngine] Evaluated trigger ${trig.id} for user ${userId}`)
      }
    }
  } catch (err) {
    console.error('Trigger evaluation failed:', err)
  }
}
