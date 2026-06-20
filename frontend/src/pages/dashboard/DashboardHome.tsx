import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { sessionsApi, type Session, type DashboardStats, type ActivityItem } from '../../api/sessions'
import { useAuthStore } from '../../store/authStore'

const MODE_LABELS: Record<Session['mode'], string> = {
  smarter_video: 'Smarter Course Video',
  private_tutor: 'AI Private Tutor',
  live_classroom: 'Live Classroom',
  assistant: 'Always-On Assistant',
}

const MODE_COLORS: Record<Session['mode'], string> = {
  smarter_video: 'bg-primary-light text-primary',
  private_tutor: 'bg-blue-50 text-blue-600',
  live_classroom: 'bg-gray-100 text-gray-600',
  assistant: 'bg-green-50 text-green-600',
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.list,
  })

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: sessionsApi.dashboardStats,
  })

  const { data: activity = [] } = useQuery<ActivityItem[]>({
    queryKey: ['dashboard-activity'],
    queryFn: sessionsApi.dashboardActivity,
  })

  const retentionPct = stats?.overall_retention_pct ?? null
  const circumference = 2 * Math.PI * 38
  const strokeOffset = retentionPct != null ? circumference * (1 - retentionPct / 100) : circumference

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your sessions today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <CalendarIcon />
            Past 30 Days
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <ExportIcon />
            Export
          </button>
          <button
            onClick={() => navigate('/dashboard/sessions/new')}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M8 3v10M3 8h10" />
            </svg>
            New Session
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Sessions"
          value={stats ? stats.total_sessions.toString() : sessions.length.toString()}
          icon={<SessionsIcon />}
        />
        <StatCard
          label="Total Viewers"
          value={stats ? stats.total_students.toLocaleString() : '—'}
          icon={<StudentsIcon />}
        />
        <StatCard
          label="Questions Asked"
          value={stats ? stats.questions_asked.toLocaleString() : '—'}
          icon={<QuestionsIcon />}
        />
        <StatCard
          label="Avg. Duration"
          value={stats?.avg_duration_mins != null ? `${stats.avg_duration_mins}` : '—'}
          suffix={stats?.avg_duration_mins != null ? 'min' : undefined}
          icon={<DurationIcon />}
        />
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Recent Sessions</h2>
          <button
            onClick={() => navigate('/dashboard/sessions')}
            className="text-xs text-primary font-medium hover:underline"
          >
            View All
          </button>
        </div>

        {sessionsLoading ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-400 text-sm mb-3">No sessions yet.</p>
            <button
              onClick={() => navigate('/dashboard/sessions/new')}
              className="text-primary text-sm font-medium hover:underline"
            >
              Create your first session →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 text-left">Session</th>
                <th className="px-5 py-3 text-left">Mode</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Viewers</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.slice(0, 5).map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Engagement Insights */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary text-base">✦</span>
            <h2 className="font-semibold text-gray-900 text-sm">Engagement Insights</h2>
          </div>

          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm">Insights will appear once your sessions have viewer activity.</p>
          ) : (
            <div className="flex gap-4">
              {/* Insight cards */}
              <div className="flex-1 space-y-3">
                <div className="border border-primary/30 bg-primary-light rounded-xl p-4">
                  <p className="text-sm font-semibold text-primary mb-1">Strong Viewer Participation</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Viewers are asking questions, which signals high engagement with your content.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Grow Your Audience</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Share your sessions with more viewers to gather richer engagement data.
                  </p>
                </div>
              </div>

              {/* Retention ring */}
              <div className="flex flex-col items-center justify-center w-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e9e9f7" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="#5b5bd6" strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="-mt-20 mb-12 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {retentionPct != null ? `${retentionPct}%` : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Retention</p>
                </div>
                <p className="text-xs text-gray-400 text-center leading-tight">
                  {retentionPct != null
                    ? 'Viewer completion rate across all sessions.'
                    : 'Complete sessions will show retention.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Student Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Viewer Activity</h2>
          {activity.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 4).map((item, i) => (
                <ActivityRow key={i} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-sm font-medium text-gray-400 ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

function SessionRow({ session }: { session: Session }) {
  const navigate = useNavigate()

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
            style={
              session.cover_image_url
                ? { backgroundImage: `url(${session.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: 'linear-gradient(135deg, #3730a3, #5b5bd6)' }
            }
          >
            {!session.cover_image_url && session.name[0]}
          </div>
          <span className="font-medium text-gray-800 line-clamp-1">{session.name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${MODE_COLORS[session.mode]}`}>
          {MODE_LABELS[session.mode]}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${session.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
          {session.status === 'active' ? 'Active' : 'Draft'}
        </span>
      </td>
      <td className="px-5 py-3.5 text-gray-600 text-sm font-medium">
        {session.total_joins != null ? session.total_joins.toLocaleString() : '—'}
      </td>
      <td className="px-5 py-3.5 text-gray-500 text-sm">{timeAgo(session.created_at)}</td>
      <td className="px-5 py-3.5">
        <button className="text-gray-400 hover:text-gray-600 p-1" onClick={(e) => e.stopPropagation()}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        item.type === 'question' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-500'
      }`}>
        {item.type === 'question' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M13 3H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1v2.5L7 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="6" cy="5" r="2" /><path strokeLinecap="round" d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
            <circle cx="12" cy="5" r="1.5" /><path strokeLinecap="round" d="M10.5 13c0-1.4.8-2.6 2-3.2" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-snug">
          {item.type === 'question'
            ? `${item.student_name} asked a question`
            : `${item.student_name} joined ${item.session_name}`}
        </p>
        {item.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">"{item.description}"</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function SessionsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path strokeLinecap="round" d="M6 6.5l4 2-4 2V6.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function StudentsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="6" cy="5" r="2" />
      <path strokeLinecap="round" d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="12" cy="5" r="1.5" />
      <path strokeLinecap="round" d="M10.5 13c0-1.4.8-2.6 2-3.2" />
    </svg>
  )
}

function QuestionsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1v2.5L7 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" />
    </svg>
  )
}

function DurationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="8.5" r="6" />
      <path strokeLinecap="round" d="M8 5v3.5l2.5 1.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path strokeLinecap="round" d="M5 2v2M11 2v2M2 7h12" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M8 10V3M5 6l3-3 3 3" />
      <path strokeLinecap="round" d="M3 11v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" />
    </svg>
  )
}
