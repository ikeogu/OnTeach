import { Link } from 'react-router-dom'

export default function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <p className="font-bold text-gray-900 text-lg mb-2">Veologue</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Video content that talks back. Built for educators, sales teams, and support heroes.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Platform</p>
            <ul className="space-y-2.5">
              {['Features', 'Solutions', 'Pricing', 'Releases'].map((l) => (
                <li key={l}><Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About', 'Careers', 'Contact', 'Partners'].map((l) => (
                <li key={l}><Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Resources</p>
            <ul className="space-y-2.5">
              {['Documentation', 'Help Center', 'Community', 'Blog'].map((l) => (
                <li key={l}><Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Legal</p>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <li key={l}><Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2024 Veologue Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-700">Privacy Policy</Link>
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-700">Terms of Service</Link>
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-700">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
