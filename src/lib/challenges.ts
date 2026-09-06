import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export interface Challenge {
  id: string
  title: string
  slug: string
  description: string
  difficulty: string
  category: string
  course_id?: string
  lesson_id?: string
  starter_code?: string
  language?: string
  instructions?: string
  sample_input?: string
  question_type?: string
  order_index?: number
  hints?: string[]
  solution_explanation?: string
  solution_code?: string
  xp_reward?: number
  is_published: boolean
  created_at: string
}

export interface ChallengeProgress {
  challenge_id: string
  is_completed: boolean
  best_score: number
  attempts_count: number
  last_attempt_at: string
}

export interface ChallengeWithProgress {
  challenge: Challenge
  progress?: ChallengeProgress
  isCompleted: boolean
  attemptsCount: number
}

export async function fetchChallengesWithProgress(
  userId?: string,
  category?: string,
  difficulty?: string
): Promise<ChallengeWithProgress[]> {
  try {
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: true })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (difficulty && difficulty !== 'All') {
      query = query.eq('difficulty', difficulty)
    }

    const { data: challengesData, error } = await query

    if (error || !challengesData || challengesData.length === 0) {
      return []
    }

    const baseList: Challenge[] = challengesData as Challenge[]

    const progressMap = new Map<string, ChallengeProgress>()
    if (userId) {
      const { data: progressData } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressData) {
        progressData.forEach((p) => {
          progressMap.set(p.challenge_id, {
            challenge_id: p.challenge_id,
            is_completed: p.is_completed,
            best_score: p.best_score || 0,
            attempts_count: p.attempts_count || 0,
            last_attempt_at: p.last_attempt_at,
          })
        })
      }
    }

    let localCompletedList: string[] = []
    try {
      const raw = localStorage.getItem('olympus_completed_challenges')
      if (raw) localCompletedList = JSON.parse(raw)
    } catch {}

    return baseList.map((ch) => {
      const prog = progressMap.get(ch.id)
      const isLocallyCompleted = localCompletedList.includes(ch.id) || localCompletedList.includes(ch.slug)
      const isCompleted = (prog?.is_completed ?? false) || isLocallyCompleted
      return {
        challenge: ch,
        progress: prog,
        isCompleted,
        attemptsCount: prog?.attempts_count ?? (isLocallyCompleted ? 1 : 0),
      }
    })
  } catch (err) {
    console.error('Error fetching challenges with progress:', err)
    return []
  }
}

export async function fetchAdminChallenges(): Promise<Challenge[]> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (error || !data) {
      return []
    }

    return data as Challenge[]
  } catch (err) {
    console.error('Error fetching admin challenges:', err)
    return []
  }
}

export async function createAdminChallenge(challengeData: Partial<Challenge>): Promise<Challenge | null> {
  try {
    const slug = challengeData.slug || challengeData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `challenge-${Date.now()}`
    
    // First try full payload
    const fullPayload: Record<string, any> = {
      title: challengeData.title,
      slug,
      description: challengeData.description || challengeData.instructions || '',
      difficulty: challengeData.difficulty || 'Medium',
      category: challengeData.category || (challengeData.language === 'python' ? 'Python' : 'JavaScript'),
      course_id: challengeData.course_id || null,
      lesson_id: challengeData.lesson_id || null,
      starter_code: challengeData.starter_code || '',
      language: (challengeData.language || 'javascript').toLowerCase(),
      question_type: challengeData.question_type || 'code',
      instructions: challengeData.instructions || challengeData.description || '',
      sample_input: challengeData.sample_input || '',
      hints: challengeData.hints || [],
      solution_explanation: challengeData.solution_explanation || null,
      solution_code: challengeData.solution_code || '',
      xp_reward: challengeData.xp_reward ?? 75,
      order_index: challengeData.order_index ?? 0,
      is_published: challengeData.is_published ?? true,
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert(fullPayload)
      .select()
      .single()

    if (!error && data) {
      return data as Challenge
    }

    // Fallback to base table schema if extra columns are not present
    const basePayload = {
      title: challengeData.title,
      slug,
      description: challengeData.description || challengeData.instructions || '',
      difficulty: challengeData.difficulty || 'Beginner',
      category: challengeData.category || 'JavaScript',
      course_id: challengeData.course_id || null,
      lesson_id: challengeData.lesson_id || null,
      hints: challengeData.hints || [],
      solution_explanation: challengeData.solution_explanation || null,
      is_published: challengeData.is_published ?? true,
    }

    const { data: baseData, error: baseError } = await supabase
      .from('challenges')
      .insert(basePayload)
      .select()
      .single()

    if (baseError || !baseData) {
      console.error('Error creating challenge:', baseError || error)
      return null
    }

    return baseData as Challenge
  } catch (err) {
    console.error('Error creating challenge:', err)
    return null
  }
}

export async function updateAdminChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | null> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Error updating challenge:', error)
      return null
    }

    return data as Challenge
  } catch (err) {
    console.error('Error updating challenge:', err)
    return null
  }
}

export async function deleteAdminChallenge(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    return !error
  } catch (err) {
    console.error('Error deleting challenge:', err)
    return false
  }
}

export async function reorderChallenges(items: { id: string; order_index: number }[]): Promise<boolean> {
  try {
    await Promise.all(
      items.map((item) =>
        supabase.from('challenges').update({ order_index: item.order_index }).eq('id', item.id)
      )
    )
    return true
  } catch {
    return false
  }
}

import { awardXp, updateStreakAndDailyActivity } from './gamification'

export interface RecordSubmissionResult {
  success: boolean
  isCompleted: boolean
  isFirstCompletion: boolean
  attemptsCount: number
  bestScore: number
  xpEarned: number
  error?: string
}

export async function recordChallengeSubmission(
  userId: string,
  challengeId: string,
  passed: boolean,
  score: number = 100,
  submittedCode?: string,
  xpRewardOverride?: number
): Promise<RecordSubmissionResult> {
  try {
    const now = new Date().toISOString()

    // Resolve UUID if challengeId is a slug or mock id
    let actualUuid = challengeId
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId)
    let challengeData: Challenge | null = null

    if (!isUuid) {
      challengeData = await fetchChallengeById(challengeId)
      if (challengeData?.id) {
        actualUuid = challengeData.id
      }
    } else {
      challengeData = await fetchChallengeById(challengeId)
    }

    const xpAmount = xpRewardOverride ?? challengeData?.xp_reward ?? 75

    // Check existing progress in challenge_progress
    let existingProgress: any = null
    try {
      const { data } = await supabase
        .from('challenge_progress')
        .select('attempts_count, best_score, is_completed, completed_at')
        .eq('user_id', userId)
        .eq('challenge_id', actualUuid)
        .maybeSingle()
      existingProgress = data
    } catch (e) {
      console.warn('Could not fetch existing challenge progress:', e)
    }

    const wasAlreadyCompleted = existingProgress?.is_completed ?? false
    const isFirstCompletion = passed && !wasAlreadyCompleted
    const newAttemptsCount = (existingProgress?.attempts_count ?? 0) + 1
    const newBestScore = Math.max(existingProgress?.best_score ?? 0, passed ? score : 0)
    const isCompleted = wasAlreadyCompleted || passed

    // 1. Insert into challenge_attempts
    try {
      await supabase.from('challenge_attempts').insert({
        user_id: userId,
        challenge_id: actualUuid,
        attempt_number: newAttemptsCount,
        status: passed ? 'passed' : 'failed',
        score: passed ? score : 0,
        passed,
        submitted_data: submittedCode ? { code: submittedCode } : null,
        completed_at: passed ? now : null,
      })
    } catch (err) {
      console.warn('Could not insert challenge attempt:', err)
    }

    // 2. Upsert into challenge_progress
    try {
      if (existingProgress) {
        await supabase
          .from('challenge_progress')
          .update({
            is_completed: isCompleted,
            best_score: newBestScore,
            attempts_count: newAttemptsCount,
            last_attempt_at: now,
            completed_at: isCompleted ? (existingProgress.completed_at || now) : null,
          })
          .eq('user_id', userId)
          .eq('challenge_id', actualUuid)
      } else {
        await supabase
          .from('challenge_progress')
          .insert({
            user_id: userId,
            challenge_id: actualUuid,
            is_completed: isCompleted,
            best_score: newBestScore,
            attempts_count: newAttemptsCount,
            last_attempt_at: now,
            completed_at: isCompleted ? now : null,
          })
      }
    } catch (err) {
      console.warn('Could not update challenge progress in Supabase:', err)
    }

    // 3. Award XP & update streak
    const xpAwarded = passed ? (isFirstCompletion ? xpAmount : 15) : 0
    if (passed) {
      try {
        await awardXp(userId, xpAwarded, 'challenge', actualUuid)
      } catch (err) {
        console.warn('awardXp error:', err)
      }

      try {
        await updateStreakAndDailyActivity(userId)
      } catch (err) {
        console.warn('streak update error:', err)
      }

      // Directly increment profiles.xp to guarantee immediate sync
      try {
        const { data: prof } = await supabase.from('profiles').select('xp, streak').eq('id', userId).maybeSingle()
        if (prof) {
          await supabase.from('profiles').update({
            xp: (prof.xp || 0) + xpAwarded,
            last_active_date: now,
            updated_at: now,
          }).eq('id', userId)
        }
      } catch (err) {
        console.warn('Direct profile XP update error:', err)
      }
    }

    // 4. Save to local storage for instant sync across views
    try {
      const raw = localStorage.getItem('olympus_completed_challenges') || '[]'
      const list: string[] = JSON.parse(raw)
      if (passed) {
        if (!list.includes(actualUuid)) list.push(actualUuid)
        if (!list.includes(challengeId)) list.push(challengeId)
        localStorage.setItem('olympus_completed_challenges', JSON.stringify(list))
      }
    } catch {}

    // 5. Dispatch custom event for real-time app notifications
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('olympus_challenge_submission', {
          detail: {
            challengeId: actualUuid,
            passed,
            isCompleted,
            isFirstCompletion,
            score,
            xpEarned: xpAwarded,
          },
        })
      )
    }

    return {
      success: true,
      isCompleted,
      isFirstCompletion,
      attemptsCount: newAttemptsCount,
      bestScore: newBestScore,
      xpEarned: xpAwarded,
    }
  } catch (err: any) {
    console.error('Error recording challenge submission:', err)
    return {
      success: false,
      isCompleted: passed,
      isFirstCompletion: false,
      attemptsCount: 1,
      bestScore: passed ? score : 0,
      xpEarned: 0,
      error: err?.message || 'Submission error',
    }
  }
}

export function useChallenges(userId?: string, category?: string, difficulty?: string) {
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await fetchChallengesWithProgress(userId, category, difficulty)
    setChallenges(result)
    setLoading(false)
  }, [userId, category, difficulty])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadData()
    }
    return () => {
      mounted = false
    }
  }, [loadData])

  const submitAttempt = useCallback(
    async (challengeId: string, passed: boolean, score: number = 100) => {
      if (!userId) return
      await recordChallengeSubmission(userId, challengeId, passed, score)
      await loadData()
    },
    [userId, loadData]
  )

  return {
    challenges,
    loading,
    submitAttempt,
    refreshChallenges: loadData,
  }
}

export async function fetchArcadeEligibleQuestions(params?: {
  language?: string
  difficulty?: string
  publishedOnly?: boolean
}): Promise<Challenge[]> {
  try {
    let query = supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })

    if (params?.publishedOnly !== false) {
      query = query.eq('is_published', true)
    }

    if (params?.language && params.language !== 'all' && params.language !== 'any') {
      query = query.ilike('language', params.language)
    }

    if (params?.difficulty && params.difficulty !== 'all' && params.difficulty !== 'any') {
      const d = params.difficulty.toLowerCase()
      if (d === 'easy') {
        query = query.in('difficulty', ['Easy', 'Beginner', 'easy', 'beginner'])
      } else if (d === 'medium') {
        query = query.in('difficulty', ['Medium', 'Intermediate', 'medium', 'intermediate'])
      } else if (d === 'hard') {
        query = query.in('difficulty', ['Hard', 'Advanced', 'hard', 'advanced'])
      } else {
        query = query.ilike('difficulty', params.difficulty)
      }
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    return data as Challenge[]
  } catch (err) {
    console.error('Error fetching arcade eligible questions:', err)
    return []
  }
}

// ─── SAVED CHALLENGES ────────────────────────────────────────────────────────

export async function checkIsChallengeSaved(userId: string, challengeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('saved_challenges')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()
    return !!data && !error
  } catch {
    return false
  }
}

export async function saveChallenge(userId: string, challengeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_challenges')
      .insert({ user_id: userId, challenge_id: challengeId })
    
    if (error && error.code !== '23505') { // Ignore unique violation
      console.error('Error saving challenge:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Error saving challenge:', err)
    return false
  }
}

export async function unsaveChallenge(userId: string, challengeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_challenges')
      .delete()
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      
    if (error) {
      console.error('Error unsaving challenge:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Error unsaving challenge:', err)
    return false
  }
}

export async function fetchSavedChallenges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('saved_challenges')
      .select('challenge_id')
      .eq('user_id', userId)
      
    if (error || !data) return []
    return data.map(row => row.challenge_id)
  } catch {
    return []
  }
}

export async function fetchChallengeById(idOrSlug: string): Promise<Challenge | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    const { data, error } = isUuid
      ? await supabase.from('challenges').select('*').eq('id', idOrSlug).maybeSingle()
      : await supabase.from('challenges').select('*').eq('slug', idOrSlug).maybeSingle()
    if (!error && data) {
      return data as Challenge
    }
    return null
  } catch (err) {
    console.error('Error fetching challenge by id/slug:', err)
    return null
  }
}

