import { useNavigate } from 'react-router-dom'
import MarketingNav from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const SESSION_MODES = [
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="5" width="14" height="14" rx="2" /><path strokeLinecap="round" d="M17 9l4-2v10l-4-2" /></svg>,
    title: 'Smarter Video',
    desc: "Avatar delivers your scripted content. Viewers can ask questions at anypoint. Embeds like a YouTube video but talks back.",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" /></svg>,
    title: 'Private Tutor',
    desc: 'Every viewer gets their own private 1-on-1 session. Fully personalised, fully automated.',
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="9" cy="7" r="2.5" /><circle cx="16" cy="7" r="2" /><path strokeLinecap="round" d="M4 19c0-3 2-5 5-5h2c3 0 5 2 5 5" /><path strokeLinecap="round" d="M15 14c1.5 0 3 1 3 3" /></svg>,
    title: 'Live Classroom',
    desc: 'Multiple viewers join one video-led session, interact with the AI tutor, and learn like in a real live classroom.',
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
    title: 'Always-On Assistant',
    desc: 'Viewers return anytime to ask questions. The video answers from your content around the clock.',
  },
]

const ENGAGE_FEATURES = [
  {
    title: 'Raise Hand',
    desc: 'Viewers can signal for clarification at any moment.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l-.001-5.925a1.575 1.575 0 00-3.15 0v.175" /></svg>,
  },
  {
    title: 'Text & Voice Input',
    desc: 'Viewers ask questions by typing or speaking. The video responds naturally to either format.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>,
  },
  {
    title: 'Brain',
    desc: 'The AI answers based strictly on your source material, ensuring pedagogical accuracy.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  },
  {
    title: 'Seamless Resume',
    desc: 'System remembers viewer history to personalize explanations.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  },
]

const DISTRIBUTION_FEATURES = [
  { label: 'YouTube-style shareable link' },
  { label: 'Embeddable iframe link' },
  { label: 'Automatic link updates' },
  { label: 'Interactions work in embeds' },
]

const EDITOR_FEATURES = [
  'Text-to-Video Workflow',
  'Visual Asset Library Integration',
  'Dynamic Trigger Placement',
  'Avatar & Voice Personalization',
  'Drag-and-Drop Scene Blocks',
]

export default function FeaturesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="Features" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 text-center bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Everything you need to make<br className="hidden md:block" />
            your content talk back.
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Transform static materials into dynamic, interactive video experiences
            that engage, teach, or convert automatically.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#5b5bd6] hover:bg-[#4848b8] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Get Started Free
            </button>
            <button className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              See Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature 1: Upload ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#ebebf9] flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-[#5b5bd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Effortless Content to Video</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Turn your knowledge into 2-way interactive videos in minutes. No writing experience required. No camera. No production team.
            </p>
            <ul className="space-y-3">
              {[
                'Human in the Loop: Fine-tune the output with our intuitive editor.',
                'Let your video interact using your knowledge in your absence',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
                    <circle cx="10" cy="10" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10l2.5 2.5 5-5" />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upload UI mockup */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">Upload Content</p>
              <button className="text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#ebebf9] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#5b5bd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#5b5bd6] mb-1">Drag & drop files here</p>
                <p className="text-xs text-gray-400">Support for PDF, PPTX, and DOCX (Max 100MB)</p>
              </div>
              {/* File upload progress */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 font-medium truncate">Bio_Lecture_01.pdf</span>
                    <span className="text-xs text-[#5b5bd6] font-semibold ml-2">85%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5b5bd6] rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 2: Script Editor ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Editor mockup */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <svg className="w-4 h-4 text-[#5b5bd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700">Video Script Editor</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[#ebebf9] rounded-lg p-3 border-l-2 border-[#5b5bd6]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#5b5bd6] uppercase tracking-wide">Segment 01: Introduction</span>
                  <span className="text-xs text-gray-400 font-mono">00:45</span>
                </div>
                <p className="text-xs text-gray-700 italic">"Welcome to the module on Advanced Robotics…"</p>
              </div>
              <div className="rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Segment 02: Core Concepts</span>
                  <span className="text-xs text-gray-400 font-mono">02:15</span>
                </div>
                <p className="text-xs text-gray-400 italic">"Let's begin with the fundamentals…"</p>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-[#5b5bd6] hover:text-[#5b5bd6] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16M4 12h16" /></svg>
                Add Interaction Block
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#5b5bd6] uppercase tracking-widest mb-4">Block-Based Editor</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Edit video like a document.</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Our revolutionary block-based editor makes complex video production as simple as writing a blog post.
            </p>
            <ul className="space-y-3">
              {EDITOR_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#ebebf9] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#5b5bd6]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3 3 7-7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Feature 3: Engage ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Engage viewers like never before.</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Turn passive watching into active participation. Veologue enables real-time dialogue between your students and your content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Viewer mockup */}
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
                    </svg>
                  </div>
                  {/* Raise hand badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    <span>🖐</span> Raised Hand
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-7">
              {ENGAGE_FEATURES.map((f) => (
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

      {/* ── Session Modes ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">One platform. Multiple ways to engage.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {SESSION_MODES.map((m) => (
              <div key={m.title} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#ebebf9] flex items-center justify-center text-[#5b5bd6] mb-4">
                  {m.icon}
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-2">{m.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Distribution ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Works everywhere your audience already is.</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Publish your video and get a shareable link you can send directly to your audience, or embed inside any platform.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DISTRIBUTION_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#5b5bd6] shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3 3 7-7" />
                  </svg>
                  <span className="text-sm text-gray-600">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Published mockup */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-gray-900">Content Published!</p>
              <p className="text-xs text-gray-400 mt-1">Your interactive session is now live and ready for learners.</p>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 mb-4">
              <span className="flex-1 text-xs text-gray-500 font-mono truncate">veologue.io/v/biochem-mastery-101</span>
              <button className="shrink-0 text-gray-400 hover:text-[#5b5bd6]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <button className="w-full bg-[#5b5bd6] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#4848b8] transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── Analytics ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Analytics mockup */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 text-sm">Engagement Dashboard</p>
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">Live Data</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Raise Hand Heatmap</p>
            <div className="flex items-end gap-1.5 h-20 mb-1">
              {[25, 45, 35, 90, 60, 75, 40, 55].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${i === 3 ? 'bg-[#5b5bd6]' : 'bg-[#5b5bd6]/20'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-5">
              <span>00:00</span><span className="text-[#5b5bd6] font-medium">Mid-Point (Confusion Peak)</span><span>End</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Most Common Questions</p>
            <div className="space-y-2">
              {[
                ['"Can you explain the last concept again?"', '42 times'],
                ['"What happens if the variable is null?"', '28 times'],
                ['"Are there more examples?"', '15 times'],
              ].map(([q, count]) => (
                <div key={q} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-700 truncate flex-1">{q}</span>
                  <span className="text-xs text-[#5b5bd6] font-bold ml-3 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligence that informs strategy.</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Stop guessing. See exactly where your viewers are confused, what questions they're asking, and how to improve your content flow.
              Engagement analytics show you where hands are raised, and which questions are being asked most.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 mb-1">94%</p>
                <p className="text-xs text-gray-400">Resolution rate</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 mb-1">12s</p>
                <p className="text-xs text-gray-400">Avg. Interaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#0c0f1e] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make your content talk back?</h2>
          <p className="text-gray-400 mb-10 text-sm leading-relaxed">
            Join thousands of creators, educators, and businesses building the future with interactive videos.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-gray-900 font-semibold px-7 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Get started free
            </button>
            <button className="border border-gray-600 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
              See how it works
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
