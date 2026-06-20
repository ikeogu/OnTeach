import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => setSent(true),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ email })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-primary inline-block" />
        <span className="font-semibold text-gray-900 text-lg">Veologue</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              If <span className="font-medium text-gray-700">{email}</span> has an account, you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-gray-400 mb-6">Didn't get it? Check your spam folder or try again.</p>
            <button
              onClick={() => { setSent(false); mutation.reset() }}
              className="text-primary text-sm font-medium hover:underline"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Reset your password</h1>
            <p className="text-gray-500 text-sm text-center mb-7">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {mutation.isError && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2.5">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || !email}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {mutation.isPending ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary font-medium hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
