import React from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, HelpCircle, ShieldCheck } from 'lucide-react'
import Footer from '../components/Footer'

const pages = {
  help: {
    eyebrow: 'Support',
    title: 'Help Center',
    description: 'Find the fastest route to common ARMS actions and support channels.',
    icon: HelpCircle,
    items: [
      'Create an account from the registration page and complete your address details.',
      'Use the dashboard to review collections, reports, recyclables, wallet activity, and service requests.',
      'Contact support when an account, collection, or wallet issue needs manual review.',
    ],
    action: { label: 'Open dashboard', href: '/app' },
  },
  contact: {
    eyebrow: 'Support',
    title: 'Contact Us',
    description: 'Reach the ARMS support desk for account, service, and operations questions.',
    icon: HelpCircle,
    items: ['Email: support@arms.local', 'Phone: 1-800-ARMS', 'Support coverage: 24/7 triage for urgent service issues.'],
    action: { label: 'Email support', href: 'mailto:support@arms.local?subject=ARMS%20support%20request', external: true },
  },
  faqs: {
    eyebrow: 'Support',
    title: 'FAQs',
    description: 'Short answers for the most common resident questions.',
    icon: HelpCircle,
    items: [
      'Collection schedules appear in the Schedules and Waste History sections.',
      'Recyclables receive an estimated value at submission and can later be marked as paid.',
      'Wallet withdrawals are checked against balance, minimum amount, and daily limits.',
    ],
    action: { label: 'Submit a request', href: '/app/service-requests' },
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    description: 'How ARMS handles resident account and service data.',
    icon: ShieldCheck,
    items: [
      'Resident records are used for collection, reporting, recycling, and wallet services.',
      'Location fields help connect service requests to the correct ward and street.',
      'Access to personal dashboard data requires authentication.',
    ],
    action: { label: 'Manage profile', href: '/app/profile' },
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    description: 'The basic operating terms for using ARMS.',
    icon: FileText,
    items: [
      'Use ARMS for accurate waste-service requests, reports, and recycling submissions.',
      'Keep account and address details current so service records remain actionable.',
      'Wallet actions and payouts may require operational or finance review.',
    ],
    action: { label: 'Create account', href: '/register' },
  },
  cookies: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    description: 'How ARMS stores session and preference data in the browser.',
    icon: FileText,
    items: [
      'ARMS stores your session token and user profile locally after sign-in.',
      'Session data is cleared when you sign out or when authentication expires.',
      'This app does not currently use advertising cookies.',
    ],
    action: { label: 'Sign in', href: '/login' },
  },
  accessibility: {
    eyebrow: 'Legal',
    title: 'Accessibility',
    description: 'ARMS aims to keep services readable, navigable, and predictable.',
    icon: CheckCircle2,
    items: [
      'Primary actions use visible labels and consistent navigation.',
      'Forms include labels and validation feedback for required resident data.',
      'Support is available if a service page blocks access to a needed task.',
    ],
    action: { label: 'Contact support', href: '/contact' },
  },
  status: {
    eyebrow: 'System',
    title: 'System Status',
    description: 'Current local development service status.',
    icon: CheckCircle2,
    items: [
      'Frontend: http://localhost:3000',
      'Backend API: http://localhost:3001',
      'Database: Supabase Postgres through the backend connection.',
    ],
    action: { label: 'Open app', href: '/app' },
  },
  'api-docs': {
    eyebrow: 'Developers',
    title: 'API Docs',
    description: 'Core API areas available from the ARMS backend.',
    icon: FileText,
    items: [
      'Auth: /auth/login, /auth/register, /auth/profile',
      'Resident services: /waste-collections, /recyclables, /service-requests',
      'Wallet and reporting: /wallet, /reports, /collection-routes',
    ],
    action: { label: 'Open dashboard', href: '/app' },
  },
  security: {
    eyebrow: 'System',
    title: 'Security',
    description: 'Current security model for account access.',
    icon: ShieldCheck,
    items: [
      'JWT authentication protects resident and operations API routes.',
      'Backend data writes use Supabase Postgres exclusively.',
      'Separate owner-admin access is the next recommended security step.',
    ],
    action: { label: 'Sign in securely', href: '/login' },
  },
  changelog: {
    eyebrow: 'System',
    title: 'Changelog',
    description: 'Recent product updates in this ARMS workspace.',
    icon: FileText,
    items: [
      'Supabase Postgres-only backend configuration.',
      'Resident auth, onboarding, profile updates, and protected dashboard pages.',
      'Hero imagery rotation, collection tracking, recyclable value, wallet, and service requests.',
    ],
    action: { label: 'View product', href: '/' },
  },
} as const

const FooterInfoPage: React.FC = () => {
  const { slug } = useParams()
  const page = slug ? pages[slug as keyof typeof pages] : null

  if (!page) {
    return <Navigate to="/" replace />
  }

  const Icon = page.icon
  const actionIsExternal = 'external' in page.action && page.action.external

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">{page.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.description}</p>

          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200">
            {page.items.map((item) => (
              <div key={item} className="flex gap-3 px-4 py-4 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {actionIsExternal ? (
            <a href={page.action.href} className="btn btn-primary mt-8 h-11 px-4">
              {page.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          ) : (
            <Link to={page.action.href} className="btn btn-primary mt-8 h-11 px-4">
              {page.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default FooterInfoPage
