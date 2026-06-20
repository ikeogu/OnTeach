import api from './client'
import type { Upload } from './types'

export const uploadsApi = {
  upload: (sessionId: number, file: File, kind: 'content' | 'knowledge') => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    return api.post<Upload>(`/sessions/${sessionId}/uploads`, form).then((r) => r.data)
  },

  uploadUrl: (sessionId: number, url: string, kind: 'content' | 'knowledge') =>
    api.post<Upload>(`/sessions/${sessionId}/upload-url`, { url, kind }).then((r) => r.data),

  uploadText: (sessionId: number, text: string, kind: 'content' | 'knowledge') =>
    api.post<Upload>(`/sessions/${sessionId}/upload-text`, { text, kind }).then((r) => r.data),

  generate: (sessionId: number) =>
    api.post<{ status: string }>(`/sessions/${sessionId}/generate`).then((r) => r.data),

  generationStatus: (sessionId: number) =>
    api.get<{ status: string; error: string | null }>(`/sessions/${sessionId}/generate/status`).then((r) => r.data),
}
