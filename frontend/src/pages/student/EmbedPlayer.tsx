import { useState, useEffect, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { studentApi, type EmbedSession, type JoinResult } from '../../api/student'
import { usePlayerStore } from '../../store/playerStore'
import { usePlayerWebSocket } from '../../hooks/usePlayerWebSocket'

type EmbedPhase = 'loading' | 'join' | 'connecting' | 'active' | 'complete' | 'error'

export default function EmbedPlayer() {
  const { embedSlug } = useParams<{ embedSlug: string }>()
  const [phase, setPhase] = useState<EmbedPhase>('loading')
  const [embedSession, setEmbedSession] = useState<EmbedSession | null>(null)
  const [joinResult, setJoinResult] = useState<JoinResult | null>(null)
  const [name, setName] = useState('')
  const [joining, setJoining] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const store = usePlayerStore()

  useEffect(() => {
    if (!embedSlug) return
    studentApi
      .getEmbed(embedSlug)
      .then((s) => {
        setEmbedSession(s)
        store.setPublicSession(s.name, s.creator_name, s.cover_image_url)
        setPhase('join')
      })
      .catch(() => {
        setErrorMsg('Session not found or no longer available.')
        setPhase('error')
      })
  }, [embedSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !embedSession?.share_slug) return
    setJoining(true)
    setErrorMsg('')
    try {
      store.setStudentName(name.trim())
      const result = await studentApi.join(embedSession.share_slug, name.trim())
      store.setJoinResult({
        sessionInstanceId: result.session_instance_id,
        livekitUrl: result.livekit_url,
        livekitToken: result.livekit_token,
        roomName: result.room_name,
      })
      setJoinResult(result)
      setPhase('connecting')
    } catch {
      setErrorMsg('Failed to join. Please try again.')
      setJoining(false)
    }
  }

  if (phase === 'loading') return <LoadingView />
  if (phase === 'error') return <ErrorView message={errorMsg} />
  if (phase === 'join') return (
    <JoinView
      session={embedSession!}
      name={name}
      setName={setName}
      joining={joining}
      error={errorMsg}
      onSubmit={handleJoin}
    />
  )
  if ((phase === 'connecting' || phase === 'active' || phase === 'complete') && joinResult) {
    return (
      <ActiveView
        joinResult={joinResult}
        onPhaseChange={setPhase}
        phase={phase}
      />
    )
  }

  return <LoadingView />
}

function LoadingView() {
  return (
    <div className="h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#5b5bd6] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <p className="text-white/50 text-sm text-center">{message}</p>
    </div>
  )
}

function JoinView({
  session,
  name,
  setName,
  joining,
  error,
  onSubmit,
}: {
  session: EmbedSession
  name: string
  setName: (v: string) => void
  joining: boolean
  error: string
  onSubmit: (e: FormEvent) => void
}) {
  return (
    <div className="h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        <div
          className="relative h-40 flex flex-col justify-end p-5"
          style={{
            background: session.cover_image_url
              ? `url(${session.cover_image_url}) center/cover no-repeat`
              : 'linear-gradient(135deg, #3730a3 0%, #5b5bd6 50%, #7c3aed 100%)',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Live Session</p>
            <h1 className="text-white text-lg font-bold mt-0.5 leading-tight">{session.name}</h1>
            <p className="text-white/60 text-xs mt-0.5">by {session.creator_name}</p>
          </div>
        </div>

        <div className="bg-white px-5 py-6">
          <h2 className="text-gray-900 text-base font-semibold">What's your name?</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              maxLength={80}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 focus:border-[#5b5bd6]"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={!name.trim() || joining}
              className="w-full bg-[#5b5bd6] hover:bg-[#4a4abf] disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
              {joining ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Join Session'}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 px-5 py-2.5 text-center border-t border-gray-100">
          <span className="text-xs text-gray-400">Powered by </span>
          <span className="text-xs font-bold text-[#5b5bd6]">Veologue</span>
        </div>
      </div>
    </div>
  )
}

function ActiveView({
  joinResult,
  onPhaseChange,
  phase,
}: {
  joinResult: JoinResult
  onPhaseChange: (p: EmbedPhase) => void
  phase: EmbedPhase
}) {
  const store = usePlayerStore()
  const send = usePlayerWebSocket(joinResult.livekit_url, joinResult.livekit_token)

  useEffect(() => {
    if (store.phase === 'active' && phase === 'connecting') onPhaseChange('active')
    if (store.phase === 'complete') onPhaseChange('complete')
  }, [store.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'complete') {
    return (
      <div className="h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/30">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">Session Complete</p>
          <p className="text-white/50 text-sm mt-1">Great work, {store.studentName}!</p>
        </div>
        <span className="text-xs text-white/30 mt-4">Powered by <span className="text-[#5b5bd6] font-semibold">Veologue</span></span>
      </div>
    )
  }

  if (phase === 'connecting') {
    return (
      <div className="h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#5b5bd6]/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#5b5bd6]/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#5b5bd6] animate-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#5b5bd6]/40 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">Connecting to session…</p>
          <p className="text-white/40 text-sm mt-1">Your AI tutor is getting ready</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Avatar / video area */}
      <div className="flex-1 flex items-center justify-center relative">
        {store.mediaOverlay ? (
          <img
            src={store.mediaOverlay.url}
            alt="media"
            className="max-h-full max-w-full object-contain rounded-xl"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-[#5b5bd6]/20 flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full bg-[#5b5bd6]/30 flex items-center justify-center ${
              store.avatarSpeaking ? 'animate-pulse' : ''
            }`}>
              <div className="w-20 h-20 rounded-full bg-[#5b5bd6] flex items-center justify-center text-white font-bold text-2xl">
                AI
              </div>
            </div>
          </div>
        )}

        {/* Q&A answer streaming */}
        {store.qaStreaming && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur rounded-xl p-4 max-h-32 overflow-y-auto">
            <p className="text-white text-sm leading-relaxed">
              {store.qaStreamingText || (
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 bg-[#0d1117]/90 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => send({ type: store.isPaused ? 'resume' : 'pause' })}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            {store.isPaused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            )}
          </button>

          {!store.qaOpen && (
            <button
              onClick={() => send({ type: 'raise_hand' })}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3" />
              </svg>
              Ask
            </button>
          )}
        </div>

        <span className="text-xs text-white/30">
          Powered by <span className="text-[#5b5bd6] font-semibold">Veologue</span>
        </span>
      </div>

      {/* Q&A input */}
      {store.qaOpen && (
        <EmbedQABar send={send} />
      )}
    </div>
  )
}

function EmbedQABar({ send }: { send: (msg: Record<string, unknown>) => void }) {
  const [text, setText] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    send({ type: 'submit_question', question: text.trim() })
    setText('')
  }

  return (
    <form onSubmit={submit} className="px-4 pb-4 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your question…"
        autoFocus
        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#5b5bd6]/60"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="bg-[#5b5bd6] disabled:opacity-40 hover:bg-[#4a4abf] text-white px-4 rounded-xl text-sm font-semibold transition-colors"
      >
        Send
      </button>
    </form>
  )
}
