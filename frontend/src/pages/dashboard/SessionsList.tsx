import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { sessionsApi, type Session } from '../../api/sessions'

const MODE_LABELS: Record<Session['mode'], string> = {
  smarter_video: 'Smarter Course Video',
  private_tutor: 'AI Private Tutor',
  live_classroom: 'Live Classroom',
  assistant: 'Always-On Assistant',
}

export default function SessionsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sessions</h1>
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-3">No sessions yet.</p>
            <button
              onClick={() => navigate('/dashboard/sessions/new')}
              className="text-primary text-sm font-medium hover:underline"
            >
              Create your first session →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3 text-left">Session</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Mode</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/dashboard/sessions/${s.id}/edit`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                          {s.name[0]}
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-1">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                        {MODE_LABELS[s.mode]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {s.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this session?')) deleteMutation.mutate(s.id) }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
