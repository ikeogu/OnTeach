import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'

// ── Static avatar + voice catalogue ─────────────────────────────────────────
// HeyGen avatar IDs — swap preview images for real CDN URLs when integrated.

const AVATARS = [
  { id: 'Anna_public_3_20240108', name: 'Sophie', initials: 'S', color: '#c7d2fe' },
  { id: 'Bryan_public_2_20240108', name: 'Marcus', initials: 'M', color: '#bfdbfe' },
  { id: 'Abby_public_20240108', name: 'Aisha', initials: 'A', color: '#d1fae5' },
  { id: 'Raj_public_20240108', name: 'Rajan', initials: 'R', color: '#fde68a' },
  { id: 'Lin_public_20240108', name: 'Lin', initials: 'L', color: '#fbcfe8' },
  { id: 'James_public_20240108', name: 'James', initials: 'J', color: '#e9d5ff' },
]

const VOICES_BY_AVATAR: Record<string, { id: string; name: string; desc: string }[]> = {
  Anna_public_3_20240108: [
    { id: 'sophie_standard_en', name: 'Sophie — Standard', desc: 'Natural, professional tone' },
    { id: 'sophie_energetic_en', name: 'Sophie — Energetic', desc: 'Vibrant, upbeat delivery' },
  ],
  Bryan_public_2_20240108: [
    { id: 'marcus_standard_en', name: 'Marcus — Standard', desc: 'Clear, authoritative tone' },
    { id: 'marcus_calm_en', name: 'Marcus — Calm', desc: 'Measured, thoughtful delivery' },
  ],
  Abby_public_20240108: [
    { id: 'aisha_standard_en', name: 'Aisha — Standard', desc: 'Warm, engaging tone' },
    { id: 'aisha_energetic_en', name: 'Aisha — Energetic', desc: 'Dynamic, enthusiastic delivery' },
  ],
  Raj_public_20240108: [
    { id: 'rajan_standard_en', name: 'Rajan — Standard', desc: 'Precise, knowledgeable tone' },
    { id: 'rajan_warm_en', name: 'Rajan — Warm', desc: 'Friendly, approachable delivery' },
  ],
  Lin_public_20240108: [
    { id: 'lin_standard_en', name: 'Lin — Standard', desc: 'Crisp, focused tone' },
    { id: 'lin_energetic_en', name: 'Lin — Energetic', desc: 'Lively, engaging delivery' },
  ],
  James_public_20240108: [
    { id: 'james_standard_en', name: 'James — Standard', desc: 'Confident, experienced tone' },
    { id: 'james_calm_en', name: 'James — Calm', desc: 'Steady, reassuring delivery' },
  ],
}

const BACKGROUNDS = [
  { id: 'neutral_studio', label: 'Neutral Studio', color: '#e8e4f0' },
  { id: 'modern_office', label: 'Modern Office', color: '#dbeafe' },
  { id: 'classroom', label: 'Classroom', color: '#dcfce7' },
  { id: 'solid_blue', label: 'Solid Blue', color: '#bfdbfe' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AvatarVoice() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.get(sessionId),
    enabled: !!sessionId,
  })

  const [avatarId, setAvatarId] = useState(() => session?.avatar_id ?? AVATARS[0].id)
  const [voiceId, setVoiceId] = useState(() => session?.voice_id ?? VOICES_BY_AVATAR[AVATARS[0].id][0].id)
  const [background, setBackground] = useState(() => session?.background ?? 'neutral_studio')

  // Keep local state in sync with loaded session (first load)
  const [synced, setSynced] = useState(false)
  if (session && !synced) {
    if (session.avatar_id) setAvatarId(session.avatar_id)
    if (session.voice_id) setVoiceId(session.voice_id)
    if (session.background) setBackground(session.background)
    setSynced(true)
  }

  const voices = VOICES_BY_AVATAR[avatarId] ?? VOICES_BY_AVATAR[AVATARS[0].id]

  const updateMutation = useMutation({
    mutationFn: (data: { avatar_id: string; voice_id: string; background: string }) =>
      sessionsApi.update(sessionId, data),
    onSuccess: (updated) => {
      qc.setQueryData(['session', sessionId], updated)
      navigate(`/dashboard/sessions/${sessionId}/review`)
    },
  })

  function handleAvatarSelect(id: string) {
    setAvatarId(id)
    // Auto-select first voice for new avatar
    const firstVoice = VOICES_BY_AVATAR[id]?.[0]
    if (firstVoice) setVoiceId(firstVoice.id)
  }

  function handleContinue() {
    updateMutation.mutate({ avatar_id: avatarId, voice_id: voiceId, background })
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-[#5b5bd6] text-lg">Veologue</span>
        <div className="flex items-center gap-3 text-gray-400">
          <button className="w-8 h-8 flex items-center justify-center hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#5b5bd6] flex items-center justify-center text-white text-sm font-semibold">
            {session?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Step 3 of 4</span>
            <span className="text-xs font-semibold text-[#5b5bd6]">75% Complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-7 overflow-hidden">
            <div className="h-full bg-[#5b5bd6] rounded-full" style={{ width: '75%' }} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your avatar</h2>
          <p className="text-gray-500 text-sm mb-6">Select the digital persona that best represents your teaching style.</p>

          {/* Avatar grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {AVATARS.map((av) => {
              const selected = av.id === avatarId
              return (
                <button
                  key={av.id}
                  onClick={() => handleAvatarSelect(av.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    selected
                      ? 'border-[#5b5bd6] bg-[#ebebf9]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* Avatar photo placeholder */}
                  <div
                    className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                      selected ? '' : 'grayscale opacity-60'
                    }`}
                    style={{ backgroundColor: av.color }}
                  >
                    {av.initials}
                  </div>
                  <span className={`text-xs font-semibold ${selected ? 'text-[#5b5bd6]' : 'text-gray-600'}`}>
                    {av.name}
                  </span>
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#5b5bd6] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Voice settings */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Voice settings</h3>
          <div className="space-y-2 mb-8">
            {voices.map((v) => {
              const selected = v.id === voiceId
              return (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    selected ? 'border-[#5b5bd6] bg-[#ebebf9]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#5b5bd6]' : 'bg-gray-100'}`}>
                    <svg className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${selected ? 'text-[#5b5bd6]' : 'text-gray-800'}`}>{v.name}</p>
                    <p className="text-xs text-gray-400">{v.desc}</p>
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-medium flex items-center gap-1 ${selected ? 'text-[#5b5bd6]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Preview
                  </button>
                </button>
              )
            })}
          </div>

          {/* Studio background */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Studio background</h3>
          <div className="flex gap-3 flex-wrap mb-8">
            {BACKGROUNDS.map((bg) => {
              const selected = bg.id === background
              return (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.id)}
                  className={`flex flex-col items-center gap-1.5 group`}
                >
                  <div
                    className={`w-16 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                      selected ? 'border-[#5b5bd6]' : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: bg.color }}
                  >
                    {bg.id === 'modern_office' && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${selected ? 'text-[#5b5bd6]' : 'text-gray-500'}`}>
                    {bg.label}
                  </span>
                </button>
              )
            })}
            {/* Upload New */}
            <button className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-12 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Upload New</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/edit`)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={updateMutation.isPending}
              className="bg-[#5b5bd6] hover:bg-[#4a4abf] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              {updateMutation.isPending && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
