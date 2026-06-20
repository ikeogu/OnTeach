import { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'

const PUBLISH_STEPS = [
  'Saving your settings…',
  'Preparing your avatar…',
  'Activating your session…',
  'Almost ready…',
]

function PublishingScreen() {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStepIndex((i) => (i + 1) % PUBLISH_STEPS.length), 700)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p < 90 ? Math.min(p + 4, 90) : p))
    }, 100)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col z-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <span className="font-bold text-[#5b5bd6] text-lg">Veologue</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative w-24 h-24 mb-10">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#e9e9f7" strokeWidth="10" />
            <circle
              cx="48" cy="48" r="40" fill="none"
              stroke="#5b5bd6" strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.2s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-[#5b5bd6]">{progress}%</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Publishing your session…</h1>
        <p className="text-gray-400 text-sm">{PUBLISH_STEPS[stepIndex]}</p>
      </div>
    </div>
  )
}

const AVATAR_NAMES: Record<string, string> = {
  Anna_public_3_20240108: 'Sophie',
  Bryan_public_2_20240108: 'Marcus',
  Abby_public_20240108: 'Aisha',
  Raj_public_20240108: 'Rajan',
  Lin_public_20240108: 'Lin',
  James_public_20240108: 'James',
}

const VOICE_NAMES: Record<string, string> = {
  sophie_standard_en: 'Sophie — Standard',
  sophie_energetic_en: 'Sophie — Energetic',
  marcus_standard_en: 'Marcus — Standard',
  marcus_calm_en: 'Marcus — Calm',
  aisha_standard_en: 'Aisha — Standard',
  aisha_energetic_en: 'Aisha — Energetic',
  rajan_standard_en: 'Rajan — Standard',
  rajan_warm_en: 'Rajan — Warm',
  lin_standard_en: 'Lin — Standard',
  lin_energetic_en: 'Lin — Energetic',
  james_standard_en: 'James — Standard',
  james_calm_en: 'James — Calm',
}

const BACKGROUND_LABELS: Record<string, string> = {
  neutral_studio: 'Neutral Studio',
  modern_office: 'Modern Office',
  classroom: 'Classroom',
  solid_blue: 'Solid Blue',
}

const MODE_LABELS: Record<string, string> = {
  smarter_video: 'Smarter Course Video',
  private_tutor: 'AI Private Tutor',
  live_classroom: 'AI Live Classroom',
  assistant: 'Always-On Assistant',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{children}</span>
    </div>
  )
}

export default function ReviewPublish() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [publishing, setPublishing] = useState(false)

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.get(sessionId),
    enabled: !!sessionId,
  })

  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const coverMutation = useMutation({
    mutationFn: (file: File) => sessionsApi.uploadCover(sessionId, file),
    onSuccess: (updated) => {
      qc.setQueryData(['session', sessionId], updated)
      setCoverPreview(null)
    },
  })

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    coverMutation.mutate(file)
  }

  const { data: blocks } = useQuery({
    queryKey: ['blocks', sessionId],
    queryFn: () => sessionsApi.getBlocks(sessionId),
    enabled: !!sessionId,
  })

  const publishMutation = useMutation({
    mutationFn: () => sessionsApi.publish(sessionId),
    onSuccess: (published) => {
      qc.setQueryData(['session', sessionId], published)
      setPublishing(true)
      setTimeout(() => navigate(`/dashboard/sessions/${sessionId}/published`), 2500)
    },
  })

  const avatarName = session?.avatar_id ? (AVATAR_NAMES[session.avatar_id] ?? session.avatar_id) : '—'
  const voiceName = session?.voice_id ? (VOICE_NAMES[session.voice_id] ?? session.voice_id) : '—'
  const bgName = session?.background ? (BACKGROUND_LABELS[session.background] ?? session.background) : '—'
  const modeName = session?.mode ? (MODE_LABELS[session.mode] ?? session.mode) : '—'
  const blockCount = blocks?.length ?? 0

  if (publishing) return <PublishingScreen />

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-[#5b5bd6] text-lg">Veologue</span>
        <div className="flex items-center gap-3 text-gray-400">
          <button className="w-8 h-8 flex items-center justify-center hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#5b5bd6] flex items-center justify-center text-white text-sm font-semibold">
            {session?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Step 4 of 4</span>
            <span className="text-xs font-semibold text-[#5b5bd6]">100% Complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-7 overflow-hidden">
            <div className="h-full bg-[#5b5bd6] rounded-full w-full" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Review &amp; Publish</h2>
          <p className="text-gray-500 text-sm mb-7">Review your session before publishing. You can always edit it later.</p>

          {/* Two-column layout */}
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Cover image */}
            <div className="w-full sm:w-44 flex-shrink-0">
              <div
                className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#5b5bd6]/40 transition-colors overflow-hidden relative"
                onClick={() => fileRef.current?.click()}
                style={
                  coverPreview || session?.cover_image_url
                    ? { backgroundImage: `url(${coverPreview ?? session?.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }
                    : {}
                }
              >
                {coverMutation.isPending && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {!coverPreview && !session?.cover_image_url && (
                  <>
                    <svg className="w-8 h-8 text-[#5b5bd6]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-[#5b5bd6]/60 font-medium">Session Cover</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg py-1.5 flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Replace cover image
              </button>
            </div>

            {/* Summary */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Session name</p>
              <p className="text-sm font-bold text-gray-900 mb-4 truncate">{session?.name ?? '…'}</p>

              <Row label="Mode">
                <span className="inline-block bg-[#ebebf9] text-[#5b5bd6] text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                  {modeName}
                </span>
              </Row>
              <Row label="Avatar">
                <span className="flex items-center gap-1.5 justify-end">
                  <span className="w-5 h-5 rounded-full bg-[#c7d2fe] inline-flex items-center justify-center text-[10px] font-bold text-[#5b5bd6]">
                    {avatarName[0]}
                  </span>
                  {avatarName}
                </span>
              </Row>
              <Row label="Voice">{voiceName}</Row>
              <Row label="Background">{bgName}</Row>
              <Row label="Script blocks">
                <span className="text-[#5b5bd6] font-semibold">{blockCount} blocks</span>
              </Row>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/avatar-voice`)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="bg-[#5b5bd6] hover:bg-[#4a4abf] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              {publishMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Publish Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
