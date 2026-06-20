import { useState, type ReactNode } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi, type QALog, type SessionStats } from '../../api/sessions'

const MODE_LABELS: Record<string, string> = {
  smarter_video: 'Smarter Course Video',
  private_tutor: 'AI Private Tutor',
  live_classroom: 'Live Classroom',
  assistant: 'Always-On Assistant',
}

type Tab = 'overview' | 'script' | 'analytics' | 'settings'

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
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
        <span className="flex-1 text-xs text-gray-600 truncate font-mono">{value || '—'}</span>
        <button onClick={copy} className="shrink-0 text-gray-400 hover:text-primary transition-colors" title="Copy">
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

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')

  const qc = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => sessionsApi.delete(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      navigate('/dashboard/sessions')
    },
  })

  function handleDelete() {
    if (confirm('Delete this session? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.get(sessionId),
    enabled: !!sessionId,
  })

  const { data: sessionStats } = useQuery<SessionStats>({
    queryKey: ['session-stats', sessionId],
    queryFn: () => sessionsApi.getStats(sessionId),
    enabled: !!sessionId,
  })

  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks', sessionId],
    queryFn: () => sessionsApi.getBlocks(sessionId),
    enabled: !!sessionId,
  })

  const { data: logs = [] } = useQuery<QALog[]>({
    queryKey: ['session-logs', sessionId],
    queryFn: () => sessionsApi.getLogs(sessionId),
    enabled: !!sessionId,
  })

  const appBase = import.meta.env.VITE_APP_URL ?? window.location.origin
  const shareUrl = session?.share_slug ? `${appBase}/s/${session.share_slug}` : ''
  const embedCode = session?.embed_slug
    ? `<iframe src="${appBase}/embed/${session.embed_slug}" width="100%" height="600" frameborder="0" allow="camera; microphone"></iframe>`
    : ''

  const spokenBlocks = blocks.filter((b) => b.type === 'spoken_text')
  const wordCount = spokenBlocks.reduce((sum, b) => {
    const text = (b.payload as any).text ?? ''
    return sum + text.trim().split(/\s+/).filter(Boolean).length
  }, 0)
  const estMins = Math.round(wordCount / 130)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm mb-3">Session not found.</p>
        <Link to="/dashboard/sessions" className="text-primary text-sm font-medium hover:underline">
          ← Back to Sessions
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back link */}
      <Link
        to="/dashboard/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
        </svg>
        Back to Sessions
      </Link>

      {/* Session header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-white text-xl font-bold overflow-hidden"
            style={
              session.cover_image_url
                ? { backgroundImage: `url(${session.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: 'linear-gradient(135deg, #3730a3, #5b5bd6)' }
            }
          >
            {!session.cover_image_url && session.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="inline-block bg-primary-light text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {MODE_LABELS[session.mode] ?? session.mode}
              </span>
              <span className="text-xs text-gray-400">{blocks.length} blocks</span>
              {estMins > 0 && <span className="text-xs text-gray-400">{estMins} min</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/dashboard/sessions/${sessionId}/edit`)}
            className="border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Session
          </button>
          <button
            onClick={() => setTab('overview')}
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Share &amp; Embed
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {(['overview', 'script', 'analytics', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <OverviewTab
          sessionStats={sessionStats}
          shareUrl={shareUrl}
          embedCode={embedCode}
          logs={logs}
        />
      )}
      {tab === 'script' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{blocks.length} blocks</p>
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/edit`)}
              className="text-sm text-primary font-medium hover:underline"
            >
              Edit in Script Editor →
            </button>
          </div>
          <div className="space-y-3">
            {blocks.map((block, idx) => (
              <ScriptBlockRow key={block.id} block={block} index={idx} />
            ))}
          </div>
        </div>
      )}
      {tab === 'analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-6 4 4 4-8" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold mb-1">Advanced Analytics</p>
          <p className="text-gray-400 text-sm">Detailed analytics coming in a future release.</p>
        </div>
      )}
      {tab === 'settings' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Session Settings</h3>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-red-600 mb-1">Danger Zone</p>
            <p className="text-xs text-gray-500 mb-3">Deleting a session cannot be undone.</p>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-sm text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {deleteMutation.isPending && (
                <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              )}
              Delete Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const BLOCK_META: Record<string, { label: string; color: string; icon: ReactNode }> = {
  spoken_text:   { label: 'Speech',  color: 'bg-blue-50 text-blue-600 border-blue-100',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z M6 10.5v1.5a6 6 0 0012 0v-1.5" /> },
  media_insert:  { label: 'Media',   color: 'bg-purple-50 text-purple-600 border-purple-100', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> },
  action_button: { label: 'Action',  color: 'bg-amber-50 text-amber-600 border-amber-100',  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" /> },
  pause:         { label: 'Pause',   color: 'bg-gray-50 text-gray-500 border-gray-100',    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /> },
}

function ScriptBlockRow({ block, index }: { block: import('../../api/sessions').ScriptBlock; index: number }) {
  const meta = BLOCK_META[block.type] ?? BLOCK_META.pause
  const p = block.payload as any

  let preview = ''
  if (block.type === 'spoken_text') preview = p.text ?? ''
  else if (block.type === 'media_insert') preview = p.spoken_text || p.url || ''
  else if (block.type === 'action_button') preview = `${p.label} → ${p.target}`
  else if (block.type === 'pause') preview = `${p.duration_seconds ?? 2}s pause`

  return (
    <div className={`flex items-start gap-3 bg-white border rounded-xl px-4 py-3.5 ${meta.color.split(' ')[2] ?? 'border-gray-100'}`}>
      <span className="text-xs text-gray-300 font-mono w-5 pt-0.5 shrink-0">{index + 1}</span>
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {meta.icon}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
          {block.bookmark_label && (
            <span className="text-xs text-gray-400 font-medium">📍 {block.bookmark_label}</span>
          )}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{preview}</p>
      </div>
    </div>
  )
}

function OverviewTab({
  sessionStats,
  shareUrl,
  embedCode,
  logs,
}: {
  sessionStats: SessionStats | undefined
  shareUrl: string
  embedCode: string
  logs: QALog[]
}) {
  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MiniStatCard label="Total Joins" value={sessionStats ? sessionStats.total_joins.toLocaleString() : '—'} icon={<SessionsIcon />} />
        <MiniStatCard label="Completions" value={sessionStats ? sessionStats.total_completions.toLocaleString() : '—'} icon={<StudentsIcon />} />
        <MiniStatCard label="Questions Asked" value={sessionStats ? sessionStats.questions_asked.toLocaleString() : '—'} icon={<QuestionsIcon />} />
        <MiniStatCard label="Avg. Completion" value={sessionStats ? `${sessionStats.avg_completion_pct}` : '—'} suffix={sessionStats ? '%' : undefined} icon={<CompletionIcon />} />
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-5 gap-5">
        {/* Left: Share & Embed + AI Insights promo */}
        <div className="col-span-3 space-y-4">
          {/* Share & Embed */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Share &amp; Embed</h3>
            <p className="text-xs text-gray-400 mb-4">Distribute your session via link or embed code.</p>
            <div className="space-y-3">
              <CopyField label="Public Link" value={shareUrl} />
              <CopyField label="Embed Code" value={embedCode} />
            </div>
            {shareUrl && (
              <p className="text-xs text-gray-400 mt-4">
                <a href={shareUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  Preview viewer experience →
                </a>
              </p>
            )}
          </div>

          {/* AI Insights promo */}
          <div className="bg-primary rounded-xl p-5 text-white">
            <p className="font-semibold text-sm mb-1">Unlock AI Insights</p>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Generate viewer performance reports and topic gap analysis with our AI Analytics module.
            </p>
            <button className="bg-white text-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
              <p className="text-xs text-gray-400">Viewer interactions &amp; questions</p>
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="text-gray-400 text-sm">No viewer activity yet.</p>
          ) : (
            <div className="space-y-4">
              {logs.slice(0, 6).map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </div>
          )}

          {logs.length > 0 && (
            <button className="mt-4 text-xs text-primary font-medium hover:underline">
              View all activity history
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function LogRow({ log }: { log: QALog }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M13 3H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1v2.5L7 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800">
          {log.student_name} asked a question{log.block_label ? ` on ${log.block_label}` : ''}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">"{log.question}"</p>
        <p className="text-xs text-gray-300 mt-0.5 uppercase tracking-wide">
          {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function MiniStatCard({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-sm font-medium text-gray-400 ml-0.5">{suffix}</span>}
      </p>
    </div>
  )
}

function SessionsIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path strokeLinecap="round" d="M6 6.5l4 2-4 2V6.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}
function StudentsIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="6" cy="5" r="2" /><path strokeLinecap="round" d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    </svg>
  )
}
function QuestionsIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1v2.5L7 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" />
    </svg>
  )
}
function CompletionIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="8.5" r="6" /><path strokeLinecap="round" d="M5.5 8.5l2 2 3-3" />
    </svg>
  )
}
