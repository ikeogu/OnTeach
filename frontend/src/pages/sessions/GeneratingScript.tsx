import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { uploadsApi } from '../../api/uploads'

const STEPS = [
  'Analysing your content…',
  'Structuring the curriculum…',
  'Writing spoken segments…',
  'Polishing script tone…',
  'Finalising blocks…',
]

export default function GeneratingScript() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()

  const [stepIndex, setStepIndex] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const navigated = useRef(false)

  // Animate step label every 4 s (stop when done)
  useEffect(() => {
    if (isDone) return
    const t = setInterval(() => setStepIndex((i) => (i + 1) % STEPS.length), 4000)
    return () => clearInterval(t)
  }, [isDone])

  // Animate fake progress bar up to 90%; snap to 100 when done
  useEffect(() => {
    if (isDone) return
    const t = setInterval(() => {
      setDisplayProgress((p) => (p < 90 ? Math.min(p + 2, 90) : p))
    }, 800)
    return () => clearInterval(t)
  }, [isDone])

  // Poll every 3 s until terminal status
  const { data } = useQuery({
    queryKey: ['generation-status', sessionId],
    queryFn: () => uploadsApi.generationStatus(sessionId),
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'done' || s === 'failed' ? false : 3000
    },
  })

  useEffect(() => {
    if (navigated.current) return
    if (data?.status === 'done') {
      setIsDone(true)
      setDisplayProgress(100)
      navigated.current = true
      setTimeout(() => navigate(`/dashboard/sessions/${sessionId}/edit`), 2500)
    }
  }, [data?.status, sessionId, navigate])

  const isFailed = data?.status === 'failed'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6">
        <span className="font-bold text-primary text-lg">Veologue</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Icon */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8 sm:mb-10">
          <div className="absolute inset-0 rounded-2xl bg-gray-100 rotate-3" />
          <div
            className={`absolute inset-2 rounded-xl shadow-sm flex items-center justify-center transition-colors duration-500 ${
              isDone ? 'bg-green-50' : 'bg-white'
            }`}
          >
            {isDone ? (
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-3xl sm:text-4xl text-primary">✦</span>
            )}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 bg-white shadow rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M4 6h12M4 10h8M4 14h6"/>
            </svg>
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 sm:w-9 sm:h-9 bg-white shadow rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 10l4 4 8-8"/>
            </svg>
          </div>
        </div>

        {isFailed ? (
          <div className="text-center max-w-sm w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Generation failed</h1>
            <p className="text-gray-500 text-sm mb-6">{data?.error ?? 'An unexpected error occurred.'}</p>
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/upload`)}
              className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary-dark"
            >
              Try again
            </button>
          </div>
        ) : isDone ? (
          /* ── Done state ── */
          <div className="text-center max-w-sm w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Script ready!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your script has been generated. Taking you to the editor…
            </p>
            <div className="w-full mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700 w-full" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <span className="text-xs text-gray-400">Redirecting to editor…</span>
            </div>
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/edit`)}
              className="mt-5 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Go to Editor now
            </button>
          </div>
        ) : (
          /* ── Generating state ── */
          <div className="w-full max-w-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">Generating your script…</h1>
            <p className="text-gray-500 text-sm mb-7 text-center">
              We're turning your content into a high-quality educational script.
            </p>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {STEPS[stepIndex]}
              </span>
              <span className="text-xs font-bold text-primary">{displayProgress}%</span>
            </div>

            {/* Skeleton cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 sm:h-16 bg-white rounded-xl border border-gray-200 flex items-center gap-2 px-2 animate-pulse">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-2 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
