import api from './client'

export interface Session {
  id: number
  name: string
  mode: 'smarter_video' | 'private_tutor' | 'live_classroom' | 'assistant'
  status: 'draft' | 'active'
  avatar_id: string | null
  voice_id: string | null
  background: string
  cover_image_url: string | null
  share_slug: string | null
  embed_slug: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  total_joins?: number
}

export type BlockType = 'spoken_text' | 'media_insert' | 'action_button' | 'pause'

export interface SpokenTextPayload {
  text: string
  reading_speed: number
  voice_emphasis: 'neutral' | 'warm' | 'energetic'
  auto_pause_after: boolean
}

export interface MediaInsertPayload {
  url: string
  media_type: 'image' | 'video' | 'gif'
  display_duration: number
  spoken_text: string
}

export interface ActionButtonPayload {
  label: string
  action_type: 'link' | 'skip_to_section' | 'download'
  target: string
}

export interface PausePayload {
  duration_seconds: number
}

export type BlockPayload = SpokenTextPayload | MediaInsertPayload | ActionButtonPayload | PausePayload

export interface ScriptBlock {
  id: number
  session_id: number
  order: number
  type: BlockType
  payload: BlockPayload
  bookmark_label: string | null
  created_at: string
  updated_at: string
}

export interface DraftBlock {
  clientId: string
  type: BlockType
  payload: BlockPayload
  bookmark_label: string | null
}

export interface DashboardStats {
  total_sessions: number
  total_students: number
  questions_asked: number
  avg_duration_mins: number | null
  overall_retention_pct: number | null
}

export interface ActivityItem {
  type: 'question' | 'join'
  student_name: string
  session_name: string
  description: string | null
  created_at: string
}

export interface SessionStats {
  total_joins: number
  unique_students: number
  total_completions: number
  questions_asked: number
  avg_completion_pct: number
  most_asked_block_label: string | null
  most_asked_block_order: number | null
}

export interface StudentRecord {
  id: string
  student_name: string
  session_id: number
  session_name: string
  started_at: string
  completed_at: string | null
}

export interface QALog {
  id: number
  student_name: string
  question: string
  answer: string
  block_context_id: number | null
  block_label: string | null
  input_mode: 'text' | 'voice'
  created_at: string
}

export const sessionsApi = {
  list: () => api.get<Session[]>('/sessions').then((r) => r.data),

  create: (data: { name: string; mode: Session['mode'] }) =>
    api.post<Session>('/sessions', data).then((r) => r.data),

  get: (id: number) => api.get<Session>(`/sessions/${id}`).then((r) => r.data),

  update: (id: number, data: Partial<Session>) =>
    api.patch<Session>(`/sessions/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/sessions/${id}`),

  publish: (id: number) => api.post<Session>(`/sessions/${id}/publish`).then((r) => r.data),

  getBlocks: (id: number) => api.get<ScriptBlock[]>(`/sessions/${id}/blocks`).then((r) => r.data),

  replaceBlocks: (id: number, blocks: Omit<DraftBlock, 'clientId'>[]) =>
    api.put<ScriptBlock[]>(`/sessions/${id}/blocks`, { blocks }).then((r) => r.data),

  getStats: (id: number) =>
    api.get<SessionStats>(`/sessions/${id}/stats`).then((r) => r.data),

  getLogs: (id: number) =>
    api.get<QALog[]>(`/sessions/${id}/logs`).then((r) => r.data),

  dashboardStats: () =>
    api.get<DashboardStats>('/dashboard/stats').then((r) => r.data),

  dashboardActivity: () =>
    api.get<ActivityItem[]>('/dashboard/activity').then((r) => r.data),

  dashboardStudents: () =>
    api.get<StudentRecord[]>('/dashboard/students').then((r) => r.data),

  uploadCover: (id: number, file: File) => {
    const form = new FormData()
    form.append('cover', file)
    return api.post<Session>(`/sessions/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  uploadMedia: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ url: string }>(`/sessions/${id}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
