import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'

export default function AccountType() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const [selected, setSelected] = useState<'individual' | 'team'>('individual')

  const mutation = useMutation({
    mutationFn: () =>
      fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'}/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ account_type: selected }),
      }).then((r) => r.json()),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      navigate('/onboarding/welcome')
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-2">
          Step 1 of 2
        </p>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">How will you use Veologue?</h1>
        <p className="text-gray-500 text-sm text-center mb-6">You can always change this later.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelected('individual')}
            className={`relative border-2 rounded-xl p-5 flex flex-col items-center gap-2 transition-all ${
              selected === 'individual'
                ? 'border-primary bg-primary-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selected === 'individual' && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              </span>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected === 'individual' ? 'bg-primary/10' : 'bg-gray-100'}`}>
              <UserIcon className={selected === 'individual' ? 'text-primary' : 'text-gray-400'} />
            </div>
            <span className={`font-semibold text-sm ${selected === 'individual' ? 'text-primary' : 'text-gray-700'}`}>Individual</span>
            <span className="text-xs text-gray-400 text-center">For independent creators</span>
          </button>

          <button
            onClick={() => setSelected('team')}
            className={`relative border-2 rounded-xl p-5 flex flex-col items-center gap-2 transition-all ${
              selected === 'team'
                ? 'border-primary bg-primary-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selected === 'team' && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              </span>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected === 'team' ? 'bg-primary/10' : 'bg-gray-100'}`}>
              <UsersIcon className={selected === 'team' ? 'text-primary' : 'text-gray-400'} />
            </div>
            <span className={`font-semibold text-sm ${selected === 'team' ? 'text-primary' : 'text-gray-700'}`}>Team</span>
            <span className="text-xs text-gray-400 text-center">For growing organizations</span>
          </button>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4 4 4-4 4" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6">Veologue Platform Registration</p>
    </div>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}
