import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/dashboard/sessions', label: 'Sessions', icon: SessionsIcon, end: false },
  { to: '/dashboard/analytics', label: 'Analytics', icon: AnalyticsIcon, end: false },
  { to: '/dashboard/students', label: 'Viewers', icon: StudentsIcon, end: false },
  { to: '/dashboard/settings', label: 'Settings', icon: SettingsIcon, end: false },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-primary inline-block" />
            <span className="font-bold text-primary text-lg">Veologue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Creator Studio</p>
              <p className="text-xs text-gray-400">Individual Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors">
            <HelpIcon /> Help Center
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors"
          >
            <LogoutIcon /> Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <div className="flex-1 max-w-sm">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                <circle cx="7" cy="7" r="4" /><path strokeLinecap="round" d="m10.5 10.5 2.5 2.5" />
              </svg>
              <input placeholder="Search" className="bg-transparent text-sm outline-none w-full text-gray-600 placeholder-gray-400" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" d="M10 2a6 6 0 0 1 6 6v2l1.5 2.5h-15L4 10V8a6 6 0 0 1 6-6Z" /><path strokeLinecap="round" d="M8 17a2 2 0 0 0 4 0" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="10" cy="10" r="7" /><path strokeLinecap="round" d="M10 7v.01M10 10v4" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
}
function SessionsIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="5"/><path strokeLinecap="round" d="M6 6l4 2-4 2V6z" fill="currentColor" stroke="none"/></svg>
}
function AnalyticsIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 13l3-4 3 2 3-5 3 3"/></svg>
}
function StudentsIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="6" cy="5" r="2"/><path strokeLinecap="round" d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="12" cy="5" r="1.5"/><path strokeLinecap="round" d="M10.5 13c0-1.4.8-2.6 2-3.2"/></svg>
}
function SettingsIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="2"/><path strokeLinecap="round" d="M8 2v1m0 10v1M2 8h1m10 0h1m-2.1-3.9-.7.7M5.8 10.2l-.7.7m0-5.6.7.7m4.4 4.4.7.7"/></svg>
}
function HelpIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="6"/><path strokeLinecap="round" d="M6.5 6a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.5-1.5 2.5"/><circle cx="8" cy="12" r=".5" fill="currentColor"/></svg>
}
function LogoutIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"/><path strokeLinecap="round" d="M10 11l3-3-3-3M13 8H6"/></svg>
}
