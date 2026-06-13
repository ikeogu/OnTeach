import { useEffect, useRef, useCallback, useState, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlayerStore, type QAMessage, type Bookmark } from '../../store/playerStore'
import { usePlayerWebSocket, closePlayerWebSocket } from '../../hooks/usePlayerWebSocket'

// ── Sub-components ───────────────────────────────────────────────────────────

function QAPanel({
  messages,
  streaming,
  streamingText,
  onClose,
  onSubmit,
}: {
  messages: QAMessage[]
  streaming: boolean
  streamingText: string
  onClose: () => void
  onSubmit: (text: string) => void
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    onSubmit(q)
    setInput('')
  }

  return (
    <div className="absolute right-3 bottom-3 z-20 w-[300px] rounded-2xl bg-[#1a1f2e]/95 backdrop-blur-sm border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <span className="text-white text-sm font-semibold">Ask a question</span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors w-6 h-6 flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'student' ? 'flex justify-end' : 'flex gap-2'}>
              {m.role === 'avatar' && (
                <div className="w-6 h-6 rounded-full bg-[#5b5bd6] flex-shrink-0 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
                  </svg>
                </div>
              )}
              <div
                className={
                  m.role === 'student'
                    ? 'bg-white text-gray-900 rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[220px]'
                    : 'bg-[#252b3b] text-white/90 rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[220px] leading-relaxed'
                }
              >
                <p>{m.text}</p>
                <p className={`text-xs mt-1 ${m.role === 'student' ? 'text-gray-400 text-right' : 'text-white/40'}`}>
                  {m.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming avatar reply */}
          {(streaming || streamingText) && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#5b5bd6] flex-shrink-0 flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
                </svg>
              </div>
              <div className="bg-[#252b3b] text-white/90 rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[220px] leading-relaxed">
                {streamingText || (
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1 bg-white/10 text-white placeholder-white/40 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]"
          autoFocus
          disabled={streaming}
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="w-8 h-8 bg-[#5b5bd6] hover:bg-[#4a4abf] disabled:opacity-40 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
      <p className="text-white/30 text-xs text-center pb-2">Or just start speaking</p>
    </div>
  )
}

function SkipMenu({
  bookmarks,
  currentBlockId,
  onSelect,
  onClose,
}: {
  bookmarks: Bookmark[]
  currentBlockId: number | null
  onSelect: (blockId: number) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      {/* Blue border on video */}
      <div className="absolute inset-0 border-2 border-[#5b5bd6] pointer-events-none rounded-sm" />

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-1 min-w-[220px]">
        {/* Title row */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-gray-900 text-xs font-semibold uppercase tracking-wider">
            Skip to section
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors w-5 h-5 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <div className="px-1 pb-1 space-y-0.5">
          {bookmarks.map((bm) => {
            const isCurrent = bm.block_id === currentBlockId
            return (
              <button
                key={bm.block_id}
                onClick={() => onSelect(bm.block_id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isCurrent
                    ? 'bg-[#5b5bd6] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {bm.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PauseModal({ onResume }: { onResume: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-40 px-6">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-14 h-14 bg-[#ebebf9] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-[#5b5bd6]" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-gray-900 text-xl font-bold">Session paused</h3>
        <p className="text-gray-500 text-sm mt-2">
          Take your time. Resume whenever you're ready.
        </p>
        <button
          onClick={onResume}
          className="mt-6 w-full bg-[#5b5bd6] hover:bg-[#4a4abf] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
          Resume Session
        </button>
      </div>
    </div>
  )
}

function CompleteModal({
  studentName,
  sessionName,
  creatorName,
  onClose,
  onReplay,
}: {
  studentName: string
  sessionName: string
  creatorName: string
  onClose: () => void
  onReplay: () => void
}) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-40 px-6">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-gray-900 text-xl font-bold">Session complete!</h3>
        <p className="text-gray-700 text-sm mt-2 font-medium">
          Great work{studentName ? `, ${studentName}` : ''}. You've completed this session
        </p>
        {creatorName && (
          <p className="text-gray-400 text-xs mt-1">
            Taught on behalf of {creatorName}
          </p>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#5b5bd6] hover:bg-[#4a4abf] text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Close
        </button>
        <button
          onClick={onReplay}
          className="mt-3 w-full text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Replay this session
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ActiveSession() {
  const { shareSlug } = useParams<{ shareSlug: string }>()
  const navigate = useNavigate()

  const store = usePlayerStore()
  const {
    phase,
    sessionName,
    creatorName,
    studentName,
    currentBlockId,
    currentBlockIndex,
    totalBlocks,
    sectionLabel,
    chapterIndex,
    totalChapters,
    avatarSpeaking,
    heygenAccessToken,
    heygenSessionId,
    qaOpen,
    qaMessages,
    qaStreaming,
    qaStreamingText,
    bookmarks,
    skipMenuOpen,
    isPaused,
    mediaOverlay,
    actionOverlay,
  } = store

  const send = usePlayerWebSocket()
  const videoRef = useRef<HTMLVideoElement>(null)
  const avatarInitialized = useRef(false)

  // Note: WS lifecycle is managed explicitly — closed in handleReplay and the phase
  // error/idle effect below. No automatic cleanup here to avoid React StrictMode
  // running the cleanup on the dev "simulate unmount" and closing the socket mid-send.

  // Guard: redirect on phase change
  useEffect(() => {
    if (phase === 'error' || phase === 'idle') {
      closePlayerWebSocket()
      navigate(`/s/${shareSlug}`, { replace: true })
    }
  }, [phase, shareSlug, navigate])

  // Init HeyGen SDK when credentials arrive from session_connecting
  useEffect(() => {
    if (!heygenAccessToken || avatarInitialized.current) return
    avatarInitialized.current = true
    initHeyGen(heygenAccessToken, heygenSessionId)
  }, [heygenAccessToken, heygenSessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function initHeyGen(accessToken: string, sessionId: string | null) {
    // Production: initialise @heygen/streaming-avatar SDK here.
    //
    //   import StreamingAvatar, { StreamingEvents } from '@heygen/streaming-avatar'
    //   const avatar = new StreamingAvatar({ token: accessToken })
    //   avatar.on(StreamingEvents.STREAM_READY, (e) => {
    //     if (videoRef.current) videoRef.current.srcObject = e.detail
    //   })
    //   avatar.on(StreamingEvents.AVATAR_START_TALKING, () =>
    //     send({ type: 'avatar_event', event: 'AVATAR_START_TALKING' }))
    //   avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () =>
    //     send({ type: 'avatar_event', event: 'AVATAR_STOP_TALKING' }))
    //   await avatar.startAvatarSession({ sessionId })
    //   send({ type: 'webrtc_ready' })
    //
    // Dev / mock path:
    if (!accessToken || accessToken === 'mock-access-token') {
      send({ type: 'webrtc_ready' })
    }
  }

  const progressPercent =
    totalBlocks > 0 ? Math.round(((currentBlockIndex + 1) / totalBlocks) * 100) : 0

  const handlePause = useCallback(() => {
    send({ type: 'pause' })
    store.setPaused(true)
  }, [send, store])

  const handleResume = useCallback(() => {
    send({ type: 'resume' })
    store.setPaused(false)
  }, [send, store])

  const handleRaiseHand = useCallback(() => {
    if (qaOpen) {
      store.closeQA()
    } else {
      send({ type: 'raise_hand' })
    }
  }, [qaOpen, send, store])

  const handleSubmitQuestion = useCallback(
    (text: string) => {
      store.submitQuestion(text)
      send({ type: 'submit_question', text })
    },
    [send, store],
  )

  const handleSkip = useCallback(
    (blockId: number) => {
      send({ type: 'skip_to_section', block_id: blockId })
      store.closeSkipMenu()
    },
    [send, store],
  )

  const handleReplay = useCallback(() => {
    closePlayerWebSocket()
    store.reset()
    navigate(`/s/${shareSlug}`, { replace: true })
  }, [store, shareSlug, navigate])

  // Chapter label for top bar
  const chapterLabel =
    chapterIndex > 0 && totalChapters > 0
      ? `Chapter ${chapterIndex} of ${totalChapters}`
      : null

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col select-none overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center px-4 py-3 bg-[#0d1117] border-b border-white/5 z-10 gap-3">
        <button
          onClick={() => navigate(`/s/${shareSlug}`)}
          className="text-white/50 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-white text-sm font-medium truncate flex-1 min-w-0">
          {sessionName}
        </span>

        {/* Chapter / section pill */}
        {(chapterLabel || sectionLabel) && (
          <button
            onClick={() => bookmarks.length > 0 && store.openSkipMenu()}
            className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white/80 text-xs px-3 py-1.5 rounded-full transition-colors flex-shrink-0 cursor-pointer"
          >
            {chapterLabel && <span className="text-white/50">{chapterLabel}</span>}
            {chapterLabel && sectionLabel && <span className="text-white/30">·</span>}
            {sectionLabel && <span className="font-semibold">{sectionLabel}</span>}
          </button>
        )}

        <div className="flex items-center gap-3 text-white/40 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </header>

      {/* ── Video + overlays ── */}
      <div className="flex-1 relative overflow-hidden bg-[#111827]">
        {/* Avatar video (hidden in mock mode — no stream) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Mock avatar placeholder — visible when no HeyGen video stream exists */}
        {(!heygenAccessToken || heygenAccessToken === 'mock-access-token') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#0d1117] to-[#1a1a3e]">
            {/* Animated avatar ring */}
            <div className="relative">
              {avatarSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#5b5bd6]/20 animate-ping" />
                  <div className="absolute -inset-3 rounded-full border border-[#5b5bd6]/30 animate-pulse" />
                </>
              )}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#5b5bd6] to-[#4a4abf] flex items-center justify-center shadow-2xl shadow-[#5b5bd6]/30">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
                </svg>
              </div>
            </div>

            {/* Speaking waveform */}
            {avatarSpeaking && (
              <div className="flex items-end gap-1 h-8">
                {[3, 6, 9, 5, 8, 4, 7, 3, 6, 9, 5].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#5b5bd6] rounded-full"
                    style={{
                      height: `${h * 3}px`,
                      animation: `soundwave 0.8s ease-in-out ${i * 0.07}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="text-center">
              <p className="text-white/60 text-sm font-medium">
                {avatarSpeaking ? 'Instructor is speaking…' : 'Instructor'}
              </p>
              {creatorName && (
                <p className="text-white/30 text-xs mt-1">{creatorName}</p>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes soundwave {
            from { transform: scaleY(0.4); }
            to   { transform: scaleY(1); }
          }
        `}</style>

        {/* Media overlay */}
        {mediaOverlay && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            {mediaOverlay.mediaType === 'image' ? (
              <img src={mediaOverlay.url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              <video
                src={mediaOverlay.url}
                autoPlay
                className="max-w-full max-h-full rounded-lg"
                onEnded={store.dismissMediaOverlay}
              />
            )}
          </div>
        )}

        {/* Action button overlay */}
        {actionOverlay && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
            <a
              href={actionOverlay.target}
              target="_blank"
              rel="noopener noreferrer"
              onClick={store.dismissActionOverlay}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors text-sm"
            >
              {actionOverlay.label}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Skip-to-section menu */}
        {skipMenuOpen && bookmarks.length > 0 && (
          <SkipMenu
            bookmarks={bookmarks}
            currentBlockId={currentBlockId}
            onSelect={handleSkip}
            onClose={store.closeSkipMenu}
          />
        )}

        {/* Q&A panel */}
        {qaOpen && (
          <QAPanel
            messages={qaMessages}
            streaming={qaStreaming}
            streamingText={qaStreamingText}
            onClose={store.closeQA}
            onSubmit={handleSubmitQuestion}
          />
        )}

        {/* Pause modal */}
        {isPaused && <PauseModal onResume={handleResume} />}

        {/* Complete modal */}
        {phase === 'complete' && (
          <CompleteModal
            studentName={studentName}
            sessionName={sessionName}
            creatorName={creatorName}
            onClose={() => navigate(`/s/${shareSlug}`, { replace: true })}
            onReplay={handleReplay}
          />
        )}

        {/* Instructor label */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
            {avatarSpeaking ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Instructor
              </span>
            ) : (
              'Instructor'
            )}
          </div>
        </div>
      </div>

      {/* ── Control bar ── */}
      <div className="bg-[#111827] border-t border-white/5 px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Pause / Resume */}
          <button
            onClick={isPaused ? handleResume : handlePause}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-[#5b5bd6] transition-colors flex-shrink-0"
          >
            {isPaused ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/50 text-xs">
                {currentBlockIndex + 1} / {totalBlocks || '–'}
              </span>
              <div className="flex items-center gap-2">
                {sectionLabel && (
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider truncate max-w-[140px]">
                    {sectionLabel}
                  </span>
                )}
                {/* Skip-to-section trigger */}
                {bookmarks.length > 0 && (
                  <button
                    onClick={store.openSkipMenu}
                    className="text-white/30 hover:text-white/60 transition-colors"
                    title="Skip to section"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </button>
                )}
                <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9.172 16.828A4 4 0 016.343 14H4a1 1 0 01-1-1v-2a1 1 0 011-1h2.343a4 4 0 012.829-2.829" />
                </svg>
              </div>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5b5bd6] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Raise Hand */}
          <button
            onClick={handleRaiseHand}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 ${
              qaOpen
                ? 'bg-[#5b5bd6]/20 text-[#5b5bd6] border border-[#5b5bd6]/40'
                : 'bg-[#5b5bd6] hover:bg-[#4a4abf] text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            {qaOpen ? 'Hand Raised' : 'Raise Hand'}
          </button>
        </div>
      </div>
    </div>
  )
}
