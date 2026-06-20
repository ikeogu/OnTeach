import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = params.get('token')
    const isNew = params.get('new') === '1'
    const error = params.get('error')

    if (error || !token) {
      navigate('/login?error=google_failed', { replace: true })
      return
    }

    authApi.me(token).then((user) => {
      setAuth(user, token)
      navigate(isNew ? '/onboarding/account-type' : '/dashboard', { replace: true })
    }).catch(() => {
      navigate('/login?error=google_failed', { replace: true })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#5b5bd6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
