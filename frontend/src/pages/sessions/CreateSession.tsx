import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { sessionsApi, type Session } from '../../api/sessions'

type Mode = Session['mode']

interface ModeOption {
  value: Mode
  label: string
  description: string
  icon: React.ReactNode
  available: boolean
}

const MODE_OPTIONS: ModeOption[] = [
  {
    value: 'smarter_video',
    label: 'Smarter Course Video',
    description: '1-on-1 Interactive video playback session with real-time conversations',
    icon: <VideoIcon />,
    available: true,
  },
  {
    value: 'live_classroom',
    label: 'AI Live Classroom Session',
    description: 'Simulated multi-student environment with dynamic AI participant responses.',
    icon: <ClassroomIcon />,
    available: false,
  },
  {
    value: 'assistant',
    label: 'Always-On Assistant',
    description: 'Passive background AI ready to answer queries without structured flow.',
    icon: null,
    available: false,
  },
  {
    value: 'private_tutor',
    label: 'AI Private Tutor',
    description: 'One-on-one conversational interface for deep-dive personalized learning.',
    icon: null,
    available: false,
  },
]

export default function CreateSession() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<Mode>('smarter_video')
  const [nameError, setNameError] = useState('')

  const mutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (session) => {
      navigate(`/dashboard/sessions/${session.id}/edit`)
    },
  })

  const handleContinue = () => {
    if (!name.trim()) {
      setNameError('Please enter a session name.')
      return
    }
    setNameError('')
    mutation.mutate({ name: name.trim(), mode })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6">
        <span className="font-bold text-primary text-lg">Veologue</span>
        <div className="ml-auto flex items-center gap-3">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M10 2a6 6 0 0 1 6 6v2l1.5 2.5h-15L4 10V8a6 6 0 0 1 6-6Z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Step 1 of 4</span>
            <span className="text-xs font-semibold text-primary">25% Complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-7 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Name your session</h1>
          <p className="text-gray-500 text-sm mb-6">
            Provide a clear name and select the session type that best fits your teaching goals.
          </p>

          {/* Name input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Session name</label>
            <input
              type="text"
              placeholder="e.g. Introduction to Financial Modelling"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError('') }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Mode selection */}
          <div className="mb-7">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select session mode</label>

            {/* Top 2: available modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {MODE_OPTIONS.filter((m) => m.available).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`text-left border-2 rounded-xl p-4 transition-all ${
                    mode === opt.value
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 text-gray-400">{opt.icon}</div>
                  <p className={`font-semibold text-sm mb-1 ${mode === opt.value ? 'text-primary' : 'text-gray-800'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 leading-snug">{opt.description}</p>
                </button>
              ))}
            </div>

            {/* Coming soon modes */}
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-3 space-y-2">
              {MODE_OPTIONS.filter((m) => !m.available).map((opt) => (
                <div key={opt.value} className="flex items-start gap-3 px-1 py-1.5">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                    <circle cx="8" cy="8" r="6" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8l2 2 3-3" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? 'Creating…' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="5" width="14" height="14" rx="2" /><path strokeLinecap="round" d="M17 9l4-2v10l-4-2" />
    </svg>
  )
}

function ClassroomIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="9" cy="7" r="2.5" /><circle cx="16" cy="7" r="2" />
      <path strokeLinecap="round" d="M4 19c0-3 2-5 5-5h2c3 0 5 2 5 5" /><path strokeLinecap="round" d="M15 14c1.5 0 3 1 3 3" />
    </svg>
  )
}
