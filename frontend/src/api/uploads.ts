import api from './client'
import type { Upload } from './types'

export const uploadsApi = {
  upload: (sessionId: number, file: File, kind: 'content' | 'knowledge') => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    return api.post<Upload>(`/sessions/${sessionId}/uploads`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  generate: (sessionId: number) =>
    api.post<{ status: string }>(`/sessions/${sessionId}/generate`).then((r) => r.data),

  generationStatus: (sessionId: number) =>
    api.get<{ status: string; error: string | null }>(`/sessions/${sessionId}/generate/status`).then((r) => r.data),
}
