import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentApi } from '../../api/student'
import { usePlayerStore } from '../../store/playerStore'

export default function JoinPage() {
  const { shareSlug } = useParams<{ shareSlug: string }>()
  const navigate = useNavigate()
  const store = usePlayerStore()

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shareSlug) return
    store.setShareSlug(shareSlug)
    studentApi
      .getSession(shareSlug)
      .then((s) => {
        store.setPublicSession(s.name, s.creator_name, s.cover_image_url)
        setLoading(false)
      })
      .catch(() => {
        setError('Session not found or no longer available.')
        setLoading(false)
      })
  }, [shareSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !shareSlug) return
    setJoining(true)
    setError(null)
    try {
      store.setStudentName(name.trim())
      const result = await studentApi.join(shareSlug, name.trim())
      store.setJoinResult({
        sessionInstanceId: result.session_instance_id,
        wsUrl: result.ws_url,
        studentToken: result.student_token,
      })
      navigate(`/s/${shareSlug}/loading`)
    } catch {
      setError('Failed to join. Please try again.')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5b5bd6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !store.sessionName) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <p className="text-white/60 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl">
        {/* Cover / hero */}
        <div
          className="relative h-[220px] flex flex-col justify-end p-6"
          style={{
            background: store.coverImageUrl
              ? `url(${store.coverImageUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #3730a3 0%, #5b5bd6 50%, #7c3aed 100%)',
          }}
        >
          {/* dark scrim */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10">
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">
              Live Session
            </span>
            <h1 className="text-white text-2xl font-bold mt-1 leading-tight">
              {store.sessionName}
            </h1>
            <p className="text-white/60 text-sm mt-1">by {store.creatorName}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white px-6 py-7">
          <h2 className="text-gray-900 text-xl font-semibold">What's your name?</h2>
          <p className="text-gray-500 text-sm mt-1">So your tutor knows who they're teaching.</p>

          <form onSubmit={handleJoin} className="mt-5 flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 focus:border-[#5b5bd6] text-sm"
              autoFocus
              maxLength={80}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!name.trim() || joining}
              className="w-full bg-[#5b5bd6] hover:bg-[#4a4abf] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
            >
              {joining ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Join <span className="text-lg leading-none">→</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
