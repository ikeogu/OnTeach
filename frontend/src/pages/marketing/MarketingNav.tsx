import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Product', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Solutions', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/' },
  { label: 'Company', href: '/' },
]

export default function MarketingNav({ activePage = '' }: { activePage?: string }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="font-bold text-[#5b5bd6] text-xl shrink-0">Veologue</Link>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm transition-colors pb-0.5 ${
                activePage === link.label
                  ? 'text-[#5b5bd6] font-medium border-b-2 border-[#5b5bd6]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="hidden md:block text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-[#5b5bd6] hover:bg-[#4848b8] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </button>
          <button
            className="md:hidden p-2 text-gray-500"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.href} className="block text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-700 py-2 font-medium">Sign In</button>
            <button onClick={() => navigate('/signup')} className="bg-[#5b5bd6] text-white text-sm font-semibold py-2 rounded-lg">Get Started</button>
          </div>
        </div>
      )}
    </header>
  )
}
