import { supabase } from './supabase'
import { COURSE_CHAPTERS } from './courseData/chapters'

export interface CourseProgress {
  courseId: string
  progressPercent: number
  status: 'start' | 'continue' | 'completed'
}

export interface ChapterItem {
  num: string
  title: string
  subtitle?: string
  description?: string
  status: 'completed' | 'current' | 'locked'
  xp: number
  lessonsCount?: number
  lessonId: string
}

export interface DynamicCourseProgress {
  courseId: string
  progressPercent: number
  status: 'start' | 'continue' | 'completed'
  completedChaptersCount: number
  totalChaptersCount: number
  activeChapterIndex: number
  activeLessonId: string
  activeLessonTitle: string
  chapters: ChapterItem[]
  lastAccessedAt?: string
}

// Exported for backward compatibility in parts of the app that haven't been updated yet
export const PYTHON_CHAPTERS: Array<Omit<ChapterItem, 'status'>> = COURSE_CHAPTERS['python'] || []

export async function saveCourseProgress(
  userId: string | undefined,
  courseId: string,
  progressPercent: number,
  lessonId?: string
): Promise<void> {
  const clampedPercent = Math.min(100, Math.max(0, Math.round(progressPercent)))
  const status = clampedPercent >= 100 ? 'completed' : clampedPercent > 0 ? 'continue' : 'start'
  const updatedAt = new Date().toISOString()

  // Always cache locally so guest and instant UI updates work smoothly
  try {
    const localData = {
      courseId,
      progressPercent: clampedPercent,
      status,
      lessonId,
      updatedAt,
    }
    localStorage.setItem(`olympus_course_progress_${courseId}`, JSON.stringify(localData))
  } catch {
    /* ignore local storage error */
  }

  if (!userId) return

  try {
    // 1. Insert into activity_history
    await supabase
      .from('activity_history')
      .insert({
        user_id: userId,
        action_type: 'course_progress',
        title: `Progress in ${courseId}`,
        metadata: {
          courseId,
          progressPercent: clampedPercent,
          status,
          lessonId,
          updatedAt,
        },
      })

    // 2. Try recording in enrollments if course UUID exists in Supabase
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .or(`slug.eq.${courseId},id.eq.${courseId}`)
        .limit(1)

      const courseUUID = courses?.[0]?.id
      if (courseUUID) {
        await supabase
          .from('enrollments')
          .upsert(
            {
              user_id: userId,
              course_id: courseUUID,
              last_accessed_at: updatedAt,
            },
            { onConflict: 'user_id,course_id' }
          )
      }
    } catch {
      /* ignore enrollment schema mismatch */
    }
  } catch (error) {
    console.error('Error saving course progress to Supabase:', error)
  }
}

export async function getDetailedCourseProgress(
  userId: string | undefined,
  courseId: string
): Promise<DynamicCourseProgress> {
  const baseChapters = COURSE_CHAPTERS[courseId] || COURSE_CHAPTERS['python']
  const total = baseChapters.length

  let progressPercent = 0
  let lastAccessedAt: string | undefined
  let savedLessonId: string | undefined

  // 1. Check local storage first as quick baseline
  try {
    const raw = localStorage.getItem(`olympus_course_progress_${courseId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed?.progressPercent === 'number') {
        progressPercent = parsed.progressPercent
        lastAccessedAt = parsed.updatedAt
        savedLessonId = parsed.lessonId
      }
    }
  } catch {
    /* ignore local storage error */
  }

  // 2. Query Supabase if user is logged in
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('activity_history')
        .select('metadata, created_at')
        .eq('user_id', userId)
        .eq('action_type', 'course_progress')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching course progress from Supabase:', error)
      }

      if (data && data.length > 0) {
        for (const row of data) {
          const meta = row.metadata as any
          if (meta && (meta.courseId === courseId || meta.course_id === courseId)) {
            if (typeof meta.progressPercent === 'number' && meta.progressPercent >= progressPercent) {
              progressPercent = meta.progressPercent
              lastAccessedAt = row.created_at
              if (meta.lessonId) savedLessonId = meta.lessonId
            }
          }
        }
      }
    } catch (err) {
      console.error('Exception querying Supabase course progress:', err)
    }
  }

  progressPercent = Math.min(100, Math.max(0, progressPercent))

  // Calculate chapter completion based on real progress
  // If progress is 0%, 0 completed, Chapter 1 is active
  // Each chapter represents ~16.67% of total (100 / 6)
  const completedChaptersCount =
    progressPercent >= 100
      ? total
      : Math.min(total - 1, Math.floor((progressPercent / 100) * total))

  const activeIndex = progressPercent >= 100 ? total - 1 : completedChaptersCount

  const chapters: ChapterItem[] = baseChapters.map((ch, idx) => {
    let status: 'completed' | 'current' | 'locked' = 'locked'
    if (idx < completedChaptersCount) {
      status = 'completed'
    } else if (idx === activeIndex) {
      status = progressPercent >= 100 ? 'completed' : 'current'
    } else {
      status = 'locked'
    }
    return {
      ...ch,
      status,
    }
  })

  const status: 'start' | 'continue' | 'completed' =
    progressPercent >= 100
      ? 'completed'
      : progressPercent > 0
        ? 'continue'
        : 'start'

  return {
    courseId,
    progressPercent,
    status,
    completedChaptersCount,
    totalChaptersCount: total,
    activeChapterIndex: activeIndex,
    activeLessonId: savedLessonId || baseChapters[activeIndex]?.lessonId || baseChapters[0].lessonId,
    activeLessonTitle: baseChapters[activeIndex]?.title || baseChapters[0].title,
    chapters,
    lastAccessedAt,
  }
}

export async function getCourseProgress(userId?: string): Promise<Record<string, CourseProgress>> {
  const progressMap: Record<string, CourseProgress> = {}

  // 1. Check local storage for cached progress
  const knownCourseIds = ['python', 'html-css', 'javascript', 'react', 'git', 'sql', 'command-line', 'cpp']
  for (const id of knownCourseIds) {
    try {
      const raw = localStorage.getItem(`olympus_course_progress_${id}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed?.progressPercent === 'number') {
          progressMap[id] = {
            courseId: id,
            progressPercent: parsed.progressPercent,
            status: parsed.progressPercent >= 100 ? 'completed' : parsed.progressPercent > 0 ? 'continue' : 'start',
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (!userId) return progressMap

  try {
    const { data, error } = await supabase
      .from('activity_history')
      .select('metadata, created_at')
      .eq('user_id', userId)
      .eq('action_type', 'course_progress')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching course progress from Supabase:', error)
      return progressMap
    }

    if (data) {
      for (const row of data) {
        const meta = row.metadata as CourseProgress
        if (meta && meta.courseId) {
          if (!progressMap[meta.courseId] || meta.progressPercent > progressMap[meta.courseId].progressPercent) {
            progressMap[meta.courseId] = meta
          }
        }
      }
    }
    return progressMap
  } catch (error) {
    console.error('Exception fetching course progress:', error)
    return progressMap
  }
}

