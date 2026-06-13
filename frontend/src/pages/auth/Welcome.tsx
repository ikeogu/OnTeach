import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Welcome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">✦ ✦</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Onteach, {firstName}</h1>
        <p className="text-gray-500 text-sm mb-8">
          You're all set. Create your first session and see how it works.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-between bg-primary-light hover:bg-primary/10 rounded-xl px-4 py-4 mb-4 transition-colors group"
        >
          <div className="text-left">
            <p className="text-primary font-semibold text-sm">Create your first session</p>
            <p className="text-gray-400 text-xs">Takes less than 5 minutes</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center group-hover:border-primary transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4 4 4-4 4" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
        >
          Take a quick tour instead
        </button>
      </div>
    </div>
  )
}
