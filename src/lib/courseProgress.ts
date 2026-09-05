import { supabase } from './supabase'

export interface CourseProgress {
  courseId: string
  progressPercent: number
  status: 'start' | 'continue' | 'completed'
}

export async function saveCourseProgress(userId: string, courseId: string, progressPercent: number): Promise<void> {
  const status = progressPercent >= 100 ? 'completed' : progressPercent > 0 ? 'continue' : 'start'

  try {
    await supabase
      .from('activity_history')
      .insert({
        user_id: userId,
        action_type: 'course_progress',
        title: `Progress in ${courseId}`,
        metadata: { courseId, progressPercent, status }
      })
  } catch (error) {
    console.error('Error saving course progress:', error)
  }
}

export async function getCourseProgress(userId: string): Promise<Record<string, CourseProgress>> {
  try {
    const { data, error } = await supabase
      .from('activity_history')
      .select('metadata, created_at')
      .eq('user_id', userId)
      .eq('action_type', 'course_progress')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching course progress:', error)
      return {}
    }

    // Since we're inserting a new row for each progress update, 
    // we only want the most recent progress for each course.
    const progressMap: Record<string, CourseProgress> = {}
    if (data) {
      for (const row of data) {
        const meta = row.metadata as CourseProgress
        if (meta && meta.courseId && !progressMap[meta.courseId]) {
          progressMap[meta.courseId] = meta
        }
      }
    }
    return progressMap
  } catch (error) {
    console.error('Exception fetching course progress:', error)
    return {}
  }
}
