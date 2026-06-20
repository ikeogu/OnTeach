import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setDone(true)
      setTimeout(() => navigate('/login?reset=1'), 2500)
    },
    onError: (err: any) => {
      setErrors(err.response?.data?.errors ?? { email: ['Invalid or expired reset link.'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match.'] })
      return
    }

    mutation.mutate({ token, email, ...form })
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-3">This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-primary text-sm font-medium hover:underline">
            Request a new link →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-primary inline-block" />
        <span className="font-semibold text-gray-900 text-lg">Veologue</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Password updated!</h1>
            <p className="text-gray-500 text-sm">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Set new password</h1>
            <p className="text-gray-500 text-sm text-center mb-7">
              Choose a strong password for <span className="font-medium text-gray-700">{email}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>
                )}
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2.5">{errors.email[0]}</p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || !form.password || !form.password_confirmation}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {mutation.isPending ? 'Saving…' : 'Reset password'}
              </button>
            </form>
          </>
        )}

        {!done && (
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">
              ← Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}
