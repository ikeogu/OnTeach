import { useNavigate } from 'react-router-dom'
import MarketingNav from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const STATS = [
  { value: '60%', label: 'higher knowledge retention', sub: 'vs. passive video learning' },
  { value: '300%', label: 'more viewer engagement', sub: 'vs. standard video content' },
  { value: '86%', label: 'conversion lift', sub: 'with interactive video on landing pages' },
  { value: '144%', label: 'more likely to act', sub: 'after an interactive video experience' },
]

const USE_CASES = [
  {
    tag: 'EDUCATION',
    title: 'Teach without being there',
    desc: 'Create videos your students can converse with — without you filming a single video or hosting a single live session.',
    link: 'Explore for education →',
    bg: 'from-blue-100 to-indigo-100',
  },
  {
    tag: 'SALES',
    title: 'Sales Enablement',
    desc: 'Send personalized demo videos that can answer questions and handle objections while you sleep.',
    link: 'Explore for sales →',
    bg: 'from-purple-100 to-pink-100',
  },
  {
    tag: 'SALES',
    title: '24/7 salesperson',
    desc: 'Let your prospects self qualify by conversing with videos pitching your product on your sales page — 24 hours a day.',
    link: 'Explore for sales →',
    bg: 'from-amber-100 to-orange-100',
  },
  {
    tag: 'SUPPORT',
    title: 'Help content that answers back',
    desc: 'Reduce ticket volume by letting videos answer FAQs, help documentation, and knowledge base questions your users have in real time.',
    link: 'Explore for support →',
    bg: 'from-green-100 to-teal-100',
  },
  {
    tag: 'ORGANISATION LEARNING · L&D',
    title: 'Training that sticks',
    desc: 'Replace passive e-learning with interactive video that checks comprehension, answers questions, and adapts to each learner.',
    link: 'Explore for L&D →',
    bg: 'from-sky-100 to-cyan-100',
  },
]

const WHY_FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Dialogue, not delivery',
    desc: 'Your audience doesn\'t just watch — they participate, asking questions and getting instant answers.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Always on, never tired',
    desc: 'Your video works 24/7. No scheduling, no off days.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Know what your audience is thinking',
    desc: 'Every question asked is a data point. See what confuses people and what\'s missing from your content.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    title: 'Embed anywhere instantly',
    desc: 'Publish once. Get a shareable link and embeddable link that works inside any platform.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: 'Update once, update everywhere',
    desc: 'Edit your content and republish. All existing embeds update automatically.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Live in minutes, not days',
    desc: 'No production team, no studio, no video editing software. Upload, review, publish — live within minutes.',
  },
]

const TESTIMONIALS = [
  {
    quote: '"As an educator, the ability for my students to \'chat\' with my recorded lectures has improved their comprehension scores significantly. It\'s like I\'m there with them 24/7."',
    name: 'Sarah Mitchell',
    role: 'Business Finance Coach · 2,400 students',
    initials: 'SM',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    quote: '"We embedded Veologue on our sales page and our conversion rate jumped immediately. Prospects ask questions we never thought to answer on the page — and now we can."',
    name: 'Daniel Osei',
    role: 'Founder · Apex SaaS Tools',
    initials: 'DO',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    quote: '"Veologue completely changed how we handle customer onboarding. Our support tickets dropped by nearly 40% in the first month as users found answers directly in our videos."',
    name: 'James Thornton',
    role: 'Head of L&D · Meridian Financial Group',
    initials: 'JT',
    color: 'bg-green-100 text-green-700',
  },
]

const PRICING_TIERS = [
  {
    name: 'Individual',
    price: '$19.99',
    period: '/month',
    desc: 'Perfect for creators and solo educators.',
    features: ['Unlimited students per session', 'Up to 5 Interactive Videos', 'Individual and Smarter Course modes', 'AI script and video generation', 'Share and embed links'],
    cta: 'Get started free',
    ctaStyle: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    highlight: false,
    note: '7-day free trial included',
  },
  {
    name: 'Team',
    price: '$29.99',
    period: '/member/month',
    desc: 'For growing sales and support teams.',
    features: ['Everything in Individual', 'Unlimited videos', 'Team dashboard and admin', 'Shared organisation knowledge'],
    cta: 'Start team trial',
    ctaStyle: 'border border-white/30 text-white hover:bg-white/10',
    highlight: true,
    note: '7-day free trial included',
    badge: 'MOST POPULAR',
  },
  {
    name: 'Institutions',
    price: 'Custom',
    period: '',
    desc: "Tailored to your organisation's needs.",
    features: ['Everything in Team', 'SSO & Enterprise Security', 'API Access', 'Dedicated Success Manager', 'SLA and priority support'],
    cta: 'Contact sales',
    ctaStyle: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    highlight: false,
  },
]

const TRUST_LOGOS = ['Teachable', 'Thinkific', 'Kajabi', 'Shopify', 'Notion']

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="Product" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0c0f1e] text-white pt-20 pb-0 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your video content can't<br />talk back.{' '}
            <span className="text-[#5b5bd6]">Until now.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Transform your knowledge into videos your audience can chat with in real time.
            No filming. No live sessions. No static pages that leave visitors guessing.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Get started free
            </button>
            <button className="border border-gray-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
              See how it works
            </button>
          </div>
        </div>

        {/* Video mockup */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-[#1a1d2e] rounded-t-2xl border border-gray-700 border-b-0 shadow-2xl overflow-hidden">
            {/* Browser dots */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#141726]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            </div>
            {/* Video area */}
            <div className="relative" style={{ aspectRatio: '16/9' }}>
              {/* Avatar placeholder — gradient face silhouette */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a2040] to-[#0c0f1e] flex items-end justify-center">
                <div className="w-full h-5/6 flex items-center justify-center relative">
                  {/* Silhouette */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-80">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-b from-[#c8a882] to-[#a07858] mx-auto mb-0 border-4 border-[#2a2d40]" />
                    <div className="w-56 h-52 rounded-t-full bg-gradient-to-b from-[#3a5a8a] to-[#2a3a6a] mx-auto -mt-4" />
                  </div>
                </div>
              </div>
              {/* Raise Hand button */}
              <div className="absolute bottom-4 right-4">
                <button className="flex items-center gap-2 bg-[#5b5bd6] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                  <span>🖐</span> Raise Hand
                </button>
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div className="h-full bg-[#5b5bd6] rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-5">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6 justify-center">
          <p className="text-xs text-gray-400 font-medium shrink-0">
            Trusted by educators and businesses using
          </p>
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {TRUST_LOGOS.map((logo) => (
              <span key={logo} className="text-sm font-semibold text-gray-400">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-4xl font-bold text-[#5b5bd6] mb-2">{s.value}</p>
              <p className="text-sm font-semibold text-gray-800 mb-1">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            From content to conversational video in minutes.
          </h2>
          <p className="text-gray-500">No production team. No studio. No live sessions.</p>
        </div>
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              num: '1',
              icon: (
                <svg className="w-7 h-7 text-[#5b5bd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
              title: '1. Upload Content',
              desc: 'Import your existing video library from any major platform in minutes.',
            },
            {
              num: '2',
              icon: (
                <svg className="w-7 h-7 text-[#5b5bd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              ),
              title: '2. Generate your video',
              desc: 'Our engine indexes every word, visual, and sentiment to build a knowledge base.',
            },
            {
              num: '3',
              icon: (
                <svg className="w-7 h-7 text-[#5b5bd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              ),
              title: 'Publish, share & embed',
              desc: 'Embed your talking video anywhere and start answering viewer questions instantly.',
            },
          ].map((step) => (
            <div key={step.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ebebf9] flex items-center justify-center mx-auto mb-5">
                {step.icon}
              </div>
              <p className="font-bold text-gray-900 mb-2">{step.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#5b5bd6] uppercase tracking-widest mb-3">Use Cases</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">One product. Every kind of content.</h2>
            <p className="text-gray-500 text-sm">Veologue works wherever you need your content to answer questions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {USE_CASES.slice(0, 3).map((c) => (
              <div key={c.title} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-44 bg-gradient-to-br ${c.bg} flex items-center justify-center`}>
                  <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold text-[#5b5bd6] uppercase tracking-wide">{c.tag}</span>
                  <h3 className="font-bold text-gray-900 mt-2 mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.desc}</p>
                  <button className="text-sm text-[#5b5bd6] font-semibold hover:underline">{c.link}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {USE_CASES.slice(3).map((c) => (
              <div key={c.title} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-44 bg-gradient-to-br ${c.bg} flex items-center justify-center`}>
                  <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold text-[#5b5bd6] uppercase tracking-wide">{c.tag}</span>
                  <h3 className="font-bold text-gray-900 mt-2 mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.desc}</p>
                  <button className="text-sm text-[#5b5bd6] font-semibold hover:underline">{c.link}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Veologue ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#5b5bd6] uppercase tracking-widest mb-3">Why Veologue</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Content that works while you sleep.</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Every video you publish becomes an always-on, always-accurate representative for your content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Dashboard mockup */}
            <div className="relative">
              <div className="bg-[#0c0f1e] rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-400/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <div className="w-2 h-2 rounded-full bg-green-400/60" />
                </div>
                <div className="bg-[#1a1d2e] rounded-xl p-4 text-white text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Engagement Dashboard</span>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">Live Data</span>
                  </div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Raise Hand Heatmap</p>
                  <div className="flex items-end gap-1 h-16">
                    {[30, 55, 40, 80, 60, 90, 45, 70].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-[#5b5bd6]' : 'bg-[#5b5bd6]/25'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>00:00</span><span className="text-[#5b5bd6]">Mid-Point (Confusion Peak)</span><span>End</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Most Common Questions</p>
                    <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                      <span className="text-gray-300">"Can you explain the last concept again?"</span>
                      <span className="text-[#5b5bd6] font-bold">42 times</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                      <span className="text-gray-300">"What happens if the variable is null?"</span>
                      <span className="text-[#5b5bd6] font-bold">28 times</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-300">"Are there more examples?"</span>
                      <span className="text-[#5b5bd6] font-bold">15 times</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 right-4 bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow border border-gray-200">
                  ↑ +36% engagement this week
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-6">
              {WHY_FEATURES.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ebebf9] flex items-center justify-center text-[#5b5bd6] shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{f.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#5b5bd6] uppercase tracking-widest mb-3">What People Say</p>
            <h2 className="text-3xl font-bold text-gray-900">Trusted by educators, marketers, and teams.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#5b5bd6] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Simple pricing. No surprises.</h2>
            <p className="text-gray-500 text-sm">Start free. Scale as you grow. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 relative ${
                  tier.highlight
                    ? 'bg-[#0c0f1e] text-white shadow-xl'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#5b5bd6] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <p className={`font-bold text-lg mb-1 ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>{tier.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-bold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>{tier.price}</span>
                  {tier.period && <span className={`text-xs ${tier.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{tier.period}</span>}
                </div>
                <p className={`text-xs mb-6 ${tier.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{tier.desc}</p>
                <ul className="space-y-2.5 mb-7">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-[#5b5bd6] mt-0.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3 3 7-7" />
                      </svg>
                      <span className={`text-sm ${tier.highlight ? 'text-gray-300' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(tier.highlight ? '/signup' : '/signup')}
                  className={`w-full font-semibold py-2.5 rounded-xl text-sm transition-colors ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </button>
                {tier.note && (
                  <p className={`text-xs text-center mt-3 ${tier.highlight ? 'text-gray-500' : 'text-gray-400'}`}>{tier.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#0c0f1e] py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your content has more to say.</h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Give it a voice. Publish your first interactive video today — free, no credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-gray-900 font-semibold px-7 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Get started free
            </button>
            <button className="border border-gray-600 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
              Book a demo
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
