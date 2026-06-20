import { useEffect, useState } from 'react'
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

  // Animate step label every 4 s
  useEffect(() => {
    const t = setInterval(() => setStepIndex((i) => (i + 1) % STEPS.length), 4000)
    return () => clearInterval(t)
  }, [])

  // Animate progress bar (fake, up to 90%, real 100 on done)
  useEffect(() => {
    const t = setInterval(() => {
      setDisplayProgress((p) => (p < 90 ? Math.min(p + 2, 90) : p))
    }, 800)
    return () => clearInterval(t)
  }, [])

  // Poll status every 3 s
  const { data } = useQuery({
    queryKey: ['generation-status', sessionId],
    queryFn: () => uploadsApi.generationStatus(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'done' || status === 'failed' ? false : 3000
    },
  })

  useEffect(() => {
    if (data?.status === 'done') {
      setDisplayProgress(100)
      setTimeout(() => navigate(`/dashboard/sessions/${sessionId}/edit`), 2500)
    }
    if (data?.status === 'failed') {
      // Let user go back
    }
  }, [data?.status, sessionId, navigate])

  const isFailed = data?.status === 'failed'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6">
        <span className="font-bold text-primary text-lg">Veologue</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Icon */}
        <div className="relative w-32 h-32 mb-10">
          <div className="absolute inset-0 rounded-2xl bg-gray-100 rotate-3" />
          <div className="absolute inset-2 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <span className="text-4xl text-primary">✦</span>
          </div>
          <div className="absolute -top-2 -right-2 w-9 h-9 bg-white shadow rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M4 6h12M4 10h8M4 14h6"/></svg>
          </div>
          <div className="absolute -bottom-2 -left-2 w-9 h-9 bg-white shadow rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 10l4 4 8-8"/></svg>
          </div>
        </div>

        {isFailed ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Generation failed</h1>
            <p className="text-gray-500 text-sm mb-2 max-w-sm text-center">{data?.error ?? 'An unexpected error occurred.'}</p>
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/upload`)}
              className="mt-4 bg-primary text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary-dark"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Generating your script…</h1>
            <p className="text-gray-500 text-sm mb-8 max-w-sm text-center">
              We're turning your content into a high-quality educational script optimised for professional delivery.
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-sm mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between w-full max-w-sm mb-10">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {STEPS[stepIndex]}
              </span>
              <span className="text-xs font-bold text-primary">{displayProgress}%</span>
            </div>

            {/* Skeleton preview cards */}
            <div className="flex gap-3 w-full max-w-sm">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 h-16 bg-white rounded-xl border border-gray-200 flex items-center gap-2 px-2 animate-pulse">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-2 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
