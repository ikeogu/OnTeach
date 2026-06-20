import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { sessionsApi } from '../../api/sessions'

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p className="text-xs text-gray-500 font-medium mb-1.5">{label}</p>
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
        <span className="flex-1 text-sm text-gray-700 truncate font-mono">{value}</span>
        <button
          onClick={copy}
          className="flex-shrink-0 text-gray-400 hover:text-[#5b5bd6] transition-colors"
          title="Copy"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function SessionPublished() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.get(sessionId),
    enabled: !!sessionId,
  })

  const appBase = import.meta.env.VITE_APP_URL ?? window.location.origin
  const shareUrl = session?.share_slug ? `${appBase}/s/${session.share_slug}` : '…'
  const embedCode = session?.embed_slug
    ? `<iframe src="${appBase}/embed/${session.embed_slug}" width="100%" height="600" frameborder="0" allow="camera; microphone"></iframe>`
    : '…'

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-[#5b5bd6] text-lg">Onteach</span>
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

      {/* Content */}
      <div className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-[440px]">
          {/* Badge + heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Your session is live 🎉</h1>
            <p className="text-gray-600 font-semibold mt-1">{session?.name ?? '…'}</p>
          </div>

          {/* Cover preview */}
          <div
            className="w-full h-48 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative"
            style={
              session?.cover_image_url
                ? { backgroundImage: `url(${session.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: 'linear-gradient(135deg, #3730a3 0%, #5b5bd6 50%, #7c3aed 100%)' }
            }
          >
            <div className="absolute inset-0 bg-black/20" />
            <button className="relative z-10 w-14 h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors">
              <svg className="w-6 h-6 text-[#5b5bd6] translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Share text */}
          <p className="text-center text-gray-500 text-sm mb-5">
            Share the link with your viewers or embed it<br />directly into your course platform.
          </p>

          {/* Share / Embed fields */}
          <div className="space-y-4 mb-7">
            <CopyField label="Share link" value={shareUrl} />
            <CopyField label="Embed link" value={embedCode} />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#5b5bd6] hover:bg-[#4a4abf] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard/sessions/new')}
              className="w-full border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Create another session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
