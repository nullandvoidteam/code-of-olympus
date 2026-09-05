import { supabase } from './supabase'

// ─── CONTENT VERSIONING ──────────────────────────────────────────────────────

export interface ContentVersion {
  id: string
  target_type: 'challenge' | 'lesson' | 'project'
  target_id: string
  version: number
  payload: any
  created_by: string
  created_at: string
}

export async function saveContentVersion(
  targetType: 'challenge' | 'lesson' | 'project',
  targetId: string,
  payload: any,
  adminUserId: string
): Promise<ContentVersion | null> {
  try {
    const existing = await getContentVersions(targetType, targetId)
    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1

    const { data, error } = await supabase
      .from('content_versions')
      .insert({
        target_type: targetType,
        target_id: targetId,
        version: nextVersion,
        payload,
        created_by: adminUserId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving content version:', error)
      return null
    }
    return data as ContentVersion
  } catch {
    return null
  }
}

export async function getContentVersions(
  targetType: 'challenge' | 'lesson' | 'project',
  targetId: string
): Promise<ContentVersion[]> {
  try {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('version', { ascending: false })

    if (error || !data) return []
    return data as ContentVersion[]
  } catch {
    return []
  }
}

export async function rollbackContentVersion(
  targetType: 'challenge' | 'lesson' | 'project',
  targetId: string,
  versionId: string
): Promise<boolean> {
  try {
    const { data: versionData, error: versionError } = await supabase
      .from('content_versions')
      .select('payload')
      .eq('id', versionId)
      .single()

    if (versionError || !versionData) return false

    const tableName = targetType === 'challenge' ? 'challenges' : targetType === 'lesson' ? 'lessons' : 'projects'
    const { error: updateError } = await supabase
      .from(tableName)
      .update(versionData.payload)
      .eq('id', targetId)

    return !updateError
  } catch {
    return false
  }
}

// ─── XP / LEVEL CONFIGURATION ────────────────────────────────────────────────

export interface XpLevelConfig {
  level: number
  required_xp: number
  reward_multiplier: number
  updated_at: string
}

export async function getXpConfig(): Promise<XpLevelConfig[]> {
  try {
    const { data, error } = await supabase
      .from('xp_level_config')
      .select('*')
      .order('level', { ascending: true })

    if (error || !data) return []
    return data as XpLevelConfig[]
  } catch {
    return []
  }
}

export async function updateLevelXp(level: number, requiredXp: number, multiplier = 1.0): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('xp_level_config')
      .upsert({ level, required_xp: requiredXp, reward_multiplier: multiplier, updated_at: new Date().toISOString() })
    
    return !error
  } catch {
    return false
  }
}

// ─── HINT MANAGEMENT ─────────────────────────────────────────────────────────

export interface ChallengeHint {
  id: string
  challenge_id: string
  hint_text: string
  display_order: number
  created_at: string
  updated_at: string
}

export async function getChallengeHints(challengeId: string): Promise<ChallengeHint[]> {
  try {
    const { data, error } = await supabase
      .from('challenge_hints')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('display_order', { ascending: true })

    if (error || !data) return []
    return data as ChallengeHint[]
  } catch {
    return []
  }
}

export async function saveChallengeHint(
  challengeId: string,
  hintText: string,
  displayOrder: number,
  hintId?: string
): Promise<ChallengeHint | null> {
  try {
    const payload = {
      challenge_id: challengeId,
      hint_text: hintText,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    }

    let query
    if (hintId) {
      query = supabase.from('challenge_hints').update(payload).eq('id', hintId).select().single()
    } else {
      query = supabase.from('challenge_hints').insert(payload).select().single()
    }

    const { data, error } = await query
    if (error) return null
    return data as ChallengeHint
  } catch {
    return null
  }
}

export async function deleteChallengeHint(hintId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('challenge_hints').delete().eq('id', hintId)
    return !error
  } catch {
    return false
  }
}

// ─── CONTENT STATUS & FILTERING ──────────────────────────────────────────────

export type ContentStatus = 'draft' | 'in_review' | 'published' | 'archived'

export async function updateContentStatus(
  targetType: 'challenge' | 'lesson' | 'project',
  targetId: string,
  status: ContentStatus
): Promise<boolean> {
  try {
    const tableName = targetType === 'challenge' ? 'challenges' : targetType === 'lesson' ? 'lessons' : 'projects'
    const { error } = await supabase
      .from(tableName)
      .update({ content_status: status })
      .eq('id', targetId)
    return !error
  } catch {
    return false
  }
}

export async function fetchContentByAdvancedFilters(
  targetType: 'challenge' | 'lesson' | 'project',
  filters: { status?: ContentStatus; category?: string; difficulty?: string }
): Promise<any[]> {
  try {
    const tableName = targetType === 'challenge' ? 'challenges' : targetType === 'lesson' ? 'lessons' : 'projects'
    let query = supabase.from(tableName).select('*')

    if (filters.status) {
      query = query.eq('content_status', filters.status)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.difficulty && (targetType === 'challenge' || targetType === 'project')) {
      query = query.eq('difficulty', filters.difficulty)
    }

    const { data, error } = await query
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
