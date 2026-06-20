import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { sessionsApi, type StudentRecord } from '../../api/sessions'

export default function StudentsPage() {
  const navigate = useNavigate()

  const { data: students = [], isLoading } = useQuery<StudentRecord[]>({
    queryKey: ['dashboard-students'],
    queryFn: sessionsApi.dashboardStudents,
  })

  const total = students.length
  const completed = students.filter((s) => s.completed_at).length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Viewers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Everyone who has joined your sessions.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Total Joins</p>
          <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Completions</p>
          <p className="text-2xl font-bold text-gray-900">{completed.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{completionPct}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="9" cy="7" r="4" /><path strokeLinecap="round" d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm mb-1">No viewers yet.</p>
            <p className="text-gray-400 text-xs">Share a published session to get your first viewer.</p>
            <button
              onClick={() => navigate('/dashboard/sessions')}
              className="mt-3 text-primary text-sm font-medium hover:underline"
            >
              Go to Sessions →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3 text-left">Viewer</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Session</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <StudentRow key={s.id} student={s} onSessionClick={() => navigate(`/dashboard/sessions/${s.session_id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StudentRow({ student, onSessionClick }: { student: StudentRecord; onSessionClick: () => void }) {
  const duration = student.completed_at
    ? durationMins(student.started_at, student.completed_at)
    : null

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {student.student_name[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-gray-800">{student.student_name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <button
          onClick={onSessionClick}
          className="text-primary hover:underline text-sm font-medium line-clamp-1 text-left"
        >
          {student.session_name}
        </button>
      </td>
      <td className="px-5 py-3.5 text-gray-500 text-sm hidden md:table-cell">{timeAgo(student.started_at)}</td>
      <td className="px-5 py-3.5">
        {student.completed_at ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            In progress
          </span>
        )}
      </td>
      <td className="px-5 py-3.5 text-gray-500 text-sm hidden md:table-cell">
        {duration != null ? `${duration} min` : '—'}
      </td>
    </tr>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function durationMins(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000))
}
