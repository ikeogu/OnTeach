import api from './client'

export interface User {
  id: number
  name: string
  email: string
  account_type: 'individual' | 'team'
  google_id: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/me').then((r) => r.data),

  googleRedirectUrl: () =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'}/auth/google/redirect`,
}
