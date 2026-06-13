import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlayerStore } from '../../store/playerStore'
import { usePlayerWebSocket, closePlayerWebSocket } from '../../hooks/usePlayerWebSocket'

export default function SessionLoading() {
  const { shareSlug } = useParams<{ shareSlug: string }>()
  const navigate = useNavigate()
  const { phase, studentName, sessionName, errorMessage } = usePlayerStore()
  const didConnect = useRef(false)

  // Opens the WebSocket as soon as wsUrl + studentToken are in the store
  const send = usePlayerWebSocket()

  // When server sends session_connecting, reply with webrtc_ready so the
  // orchestrator proceeds (real HeyGen would set up WebRTC first; mock mode skips it)
  useEffect(() => {
    if (phase === 'connecting') {
      send({ type: 'webrtc_ready' })
    }
  }, [phase, send])

  // Navigate once the server signals ready
  useEffect(() => {
    if (phase === 'active' || phase === 'ready') {
      navigate(`/s/${shareSlug}/play`, { replace: true })
    }
    // Don't auto-redirect on error — show the message so the user knows what happened
  }, [phase, shareSlug, navigate])

  // Guard: if no session data (e.g. direct URL hit), go back to join
  useEffect(() => {
    if (!didConnect.current && !sessionName) {
      navigate(`/s/${shareSlug}`, { replace: true })
    }
    didConnect.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-6 px-4">
      {/* Avatar circle placeholder */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-[#5b5bd6] animate-ping opacity-30" />
        <div className="w-24 h-24 rounded-full border-2 border-[#5b5bd6] bg-[#1a1a3e] flex items-center justify-center overflow-hidden">
          {/* Avatar image would go here once session_connecting provides it */}
          <svg className="w-10 h-10 text-[#5b5bd6]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-white text-xl font-semibold">
          Getting your session ready{studentName ? `, ${studentName}` : ''}…
        </h2>
        <p className="text-white/50 text-sm mt-2">
          {sessionName
            ? `Your tutor is preparing to teach ${sessionName}.`
            : 'Connecting…'}
        </p>
        {phase === 'error' && (
          <div className="text-center space-y-3">
            <p className="text-red-400 text-sm">{errorMessage ?? 'Connection failed.'}</p>
            <p className="text-white/30 text-xs">Make sure the AI service is running, then try again.</p>
            <button
              onClick={() => { closePlayerWebSocket(); navigate(`/s/${shareSlug}`, { replace: true }) }}
              className="text-[#5b5bd6] text-sm font-medium hover:underline"
            >
              ← Back to join
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#5b5bd6] rounded-full animate-[loading-bar_2s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0%   { width: 0%; margin-left: 0%; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
