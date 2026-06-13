import client from './client'

export interface PublicSession {
  id: number
  name: string
  creator_name: string
  cover_image_url: string | null
  avatar_id: string | null
}

export interface EmbedSession {
  name: string
  creator_name: string
  cover_image_url: string | null
  share_slug: string
}

export interface JoinResult {
  session_instance_id: string
  ws_url: string
  student_token: string
}

export const studentApi = {
  getSession: (shareSlug: string): Promise<PublicSession> =>
    client.get(`/public/s/${shareSlug}`).then((r) => r.data),

  join: (shareSlug: string, studentName: string): Promise<JoinResult> =>
    client
      .post(`/public/s/${shareSlug}/join`, { student_name: studentName })
      .then((r) => r.data),

  getEmbed: (embedSlug: string): Promise<EmbedSession> =>
    client.get(`/public/embed/${embedSlug}`).then((r) => r.data),
}
