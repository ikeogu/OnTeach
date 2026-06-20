import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MarketingNav from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    desc: 'For individuals exploring Veologue.',
    cta: 'Get Started Free',
    ctaStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    popular: false,
    features: [
      '3 Sessions',
      '1 AI Avatar',
      'Up to 50 viewers/session',
      'Basic analytics',
      'Shareable link',
      'Community support',
    ],
    limits: ['No embed support', 'No custom avatar'],
  },
  {
    name: 'Pro',
    monthlyPrice: 49,
    annualPrice: 39,
    desc: 'For creators and educators going live.',
    cta: 'Start Free Trial',
    ctaStyle: 'bg-[#5b5bd6] text-white hover:bg-[#4848b8]',
    popular: true,
    features: [
      'Unlimited Sessions',
      '3 AI Avatars',
      'Up to 500 viewers/session',
      'Advanced analytics & heatmaps',
      'Shareable + Embeddable link',
      'Priority email support',
      'Custom branding',
      'Session password protection',
    ],
    limits: [],
  },
  {
    name: 'Business',
    monthlyPrice: 149,
    annualPrice: 119,
    desc: 'For teams and enterprises at scale.',
    cta: 'Contact Sales',
    ctaStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    popular: false,
    features: [
      'Unlimited Sessions & Viewers',
      'Unlimited AI Avatars',
      'White-label embed',
      'Team management',
      'SSO / SAML',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
      'API access',
    ],
    limits: [],
  },
]

const COMPARISON_SECTIONS = [
  {
    title: 'Content & Sessions',
    rows: [
      { label: 'Sessions', free: '3', pro: 'Unlimited', biz: 'Unlimited' },
      { label: 'Viewers per session', free: '50', pro: '500', biz: 'Unlimited' },
      { label: 'File upload types', free: 'PDF', pro: 'PDF, PPTX, DOCX', biz: 'All types' },
      { label: 'AI-generated script', free: true, pro: true, biz: true },
      { label: 'Block-based editor', free: true, pro: true, biz: true },
    ],
  },
  {
    title: 'Avatar & Voice',
    rows: [
      { label: 'AI Avatars', free: '1', pro: '3', biz: 'Unlimited' },
      { label: 'Voice options', free: '2', pro: '10+', biz: '20+' },
      { label: 'Custom avatar upload', free: false, pro: false, biz: true },
      { label: 'Custom voice clone', free: false, pro: false, biz: true },
    ],
  },
  {
    title: 'Distribution',
    rows: [
      { label: 'Shareable link', free: true, pro: true, biz: true },
      { label: 'Embeddable iframe', free: false, pro: true, biz: true },
      { label: 'White-label embed', free: false, pro: false, biz: true },
      { label: 'Session password protection', free: false, pro: true, biz: true },
    ],
  },
  {
    title: 'Analytics',
    rows: [
      { label: 'Viewer count', free: true, pro: true, biz: true },
      { label: 'Raise-hand heatmap', free: false, pro: true, biz: true },
      { label: 'Question analytics', free: false, pro: true, biz: true },
      { label: 'Export data (CSV)', free: false, pro: true, biz: true },
      { label: 'Custom reporting', free: false, pro: false, biz: true },
    ],
  },
  {
    title: 'Team & Security',
    rows: [
      { label: 'Team members', free: '1', pro: '5', biz: 'Unlimited' },
      { label: 'Role-based access', free: false, pro: false, biz: true },
      { label: 'SSO / SAML', free: false, pro: false, biz: true },
      { label: 'Audit logs', free: false, pro: false, biz: true },
    ],
  },
  {
    title: 'Support',
    rows: [
      { label: 'Community support', free: true, pro: true, biz: true },
      { label: 'Priority email support', free: false, pro: true, biz: true },
      { label: 'Dedicated account manager', free: false, pro: false, biz: true },
      { label: 'SLA guarantee', free: false, pro: false, biz: true },
    ],
  },
]

const FAQS = [
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'What happens when I reach the session or viewer limit?',
    a: 'On the Free plan, you will be prompted to upgrade when you hit your session or viewer cap. No content is deleted — you can always upgrade to continue.',
  },
  {
    q: "What's included in the free trial?",
    a: 'The Pro plan free trial gives you 14 days of full access to all Pro features with no credit card required.',
  },
  {
    q: 'Do you offer educational or non-profit discounts?',
    a: 'Yes. We offer 40% off for verified educational institutions and registered non-profits. Contact us at support@veologue.io for verification.',
  },
  {
    q: 'Can I use Veologue on my own website?',
    a: 'Pro and Business plans include an embeddable iframe link so you can host your interactive sessions on any website. Business plans add white-labelling to remove all Veologue branding.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit and at rest. Business plan customers can enable SSO and audit logs for additional enterprise-grade security.',
  },
]

function Check() {
  return (
    <svg className="w-5 h-5 text-[#5b5bd6] mx-auto" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
      <circle cx="10" cy="10" r="8" className="stroke-[#ebebf9] fill-[#ebebf9]" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10l2.5 2.5 5-5" className="stroke-[#5b5bd6]" />
    </svg>
  )
}

function Cross() {
  return <span className="block text-center text-gray-300 text-lg">—</span>
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') return value ? <Check /> : <Cross />
  return <span className="block text-center text-sm text-gray-700">{value}</span>
}

export default function PricingPage() {
  const navigate = useNavigate()
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="Pricing" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 text-center bg-gray-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, transparent pricing.</h1>
          <p className="text-gray-500 text-lg mb-10">Start free. Scale when you're ready.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${!annual ? 'bg-[#5b5bd6] text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${annual ? 'bg-[#5b5bd6] text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Annual
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${annual ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Tier Cards ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice
            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  tier.popular
                    ? 'bg-[#5b5bd6] text-white shadow-xl shadow-[#5b5bd6]/20'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
                  </div>
                )}

                <div className="mb-6">
                  <p className={`font-bold text-lg mb-1 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>{tier.name}</p>
                  <p className={`text-sm mb-5 ${tier.popular ? 'text-white/70' : 'text-gray-500'}`}>{tier.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                      {price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm mb-1.5 ${tier.popular ? 'text-white/60' : 'text-gray-400'}`}>/mo</span>
                    )}
                  </div>
                  {annual && price > 0 && (
                    <p className={`text-xs mt-1 ${tier.popular ? 'text-white/60' : 'text-gray-400'}`}>
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => navigate(tier.name === 'Business' ? '/' : '/signup')}
                  className={`w-full font-semibold py-2.5 rounded-xl text-sm mb-7 transition-colors ${
                    tier.popular
                      ? 'bg-white text-[#5b5bd6] hover:bg-gray-100'
                      : tier.ctaStyle
                  }`}
                >
                  {tier.cta}
                </button>

                <ul className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg
                        className={`w-4 h-4 mt-0.5 shrink-0 ${tier.popular ? 'text-white' : 'text-[#5b5bd6]'}`}
                        fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3 3 7-7" />
                      </svg>
                      <span className={`text-sm ${tier.popular ? 'text-white/90' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                  {tier.limits.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" d="M4 8h8" />
                      </svg>
                      <span className="text-sm text-gray-400">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Compare all features</h2>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-gray-100">
              <div className="col-span-1 p-4" />
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`p-4 text-center border-l border-gray-100 ${t.popular ? 'bg-[#5b5bd6]/5' : ''}`}
                >
                  <p className={`font-bold text-sm ${t.popular ? 'text-[#5b5bd6]' : 'text-gray-900'}`}>{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.monthlyPrice === 0 ? 'Free' : `$${annual ? t.annualPrice : t.monthlyPrice}/mo`}
                  </p>
                </div>
              ))}
            </div>

            {COMPARISON_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{section.title}</p>
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-4 border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                  >
                    <div className="col-span-1 p-4 text-sm text-gray-700">{row.label}</div>
                    <div className="p-4 border-l border-gray-100"><CellValue value={row.free} /></div>
                    <div className="p-4 border-l border-gray-100 bg-[#5b5bd6]/3"><CellValue value={row.pro} /></div>
                    <div className="p-4 border-l border-gray-100"><CellValue value={row.biz} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-1">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Still Deciding CTA ───────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still deciding?</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Start with the Free plan — no credit card required. Upgrade to Pro when you're ready. Or reach out and we'll find the right plan together.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#5b5bd6] hover:bg-[#4848b8] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Start for Free
            </button>
            <button className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* ── Dark Footer CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#0c0f1e] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Join thousands already using Veologue.</h2>
          <p className="text-gray-400 mb-10 text-sm leading-relaxed">
            Start publishing interactive video sessions today. Free forever. No card required.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            Get started free →
          </button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
