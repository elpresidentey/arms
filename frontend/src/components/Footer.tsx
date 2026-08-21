import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Check,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Send,
  Twitter,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PATHS } from '../routes/paths'
import BrandLogo from './BrandLogo'

const socialLinks = [
  { name: 'Twitter / X', href: 'https://x.com', Icon: Twitter },
  { name: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
]

const Footer: React.FC = () => {
  const { user } = useAuth()
  const isStaff = Boolean(user && user.role !== 'resident')
  const isResident = !isStaff
  const currentYear = new Date().getFullYear()

  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const cta = user
    ? user.role === 'resident'
      ? {
          eyebrow: 'Resident services',
          title: 'Your bill, paid in minutes.',
          subtitle: 'Product updates, collection alerts, and recycling tips — straight to your inbox.',
        }
      : {
          eyebrow: 'Operations workspace',
          title: 'Your operations, at a glance.',
          subtitle: 'Route changes, queue updates, and platform news for the operations team.',
        }
    : {
        eyebrow: 'Automated refuse management',
        title: 'Cleaner streets, clearer records.',
        subtitle: 'Monthly product news and service updates. No spam, unsubscribe anytime.',
      }

  const linkColumns = isResident
    ? [
        {
          title: 'Resident Tools',
          links: [
            { name: 'Dashboard', href: '/app' },
            { name: 'Collection History', href: '/app/waste-history' },
            { name: 'My Recyclables', href: '/app/recyclables' },
            { name: 'Bin Locations', href: '/app/locations' },
            { name: 'Wallet', href: '/app/wallet' },
          ],
        },
        {
          title: 'Support',
          links: [
            { name: 'Help Center', href: '/help' },
            { name: 'FAQs', href: '/faqs' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'Report Refuse Issue', href: '/app/reports' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { name: 'System Status', href: '/status' },
            { name: 'API Docs', href: '/api-docs' },
            { name: 'Security', href: '/security' },
            { name: 'Changelog', href: '/changelog' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'Accessibility', href: '/accessibility' },
          ],
        },
      ]
    : [
        {
          title: 'Admin Tools',
          links: [
            { name: 'Operations', href: '/app/operations' },
            { name: 'Collections', href: '/app/waste-history' },
            { name: 'Complaints', href: '/app/reports' },
            { name: 'Resident Requests', href: '/app/service-requests' },
            { name: 'Route Schedules', href: '/app/schedules' },
          ],
        },
        {
          title: 'Oversight',
          links: [
            { name: 'Recycling Queue', href: '/app/recyclables' },
            { name: 'Locations', href: '/app/locations' },
            { name: 'Staff Profile', href: '/app/profile' },
            { name: 'Verify a Receipt', href: PATHS.verifyReceipt },
          ],
        },
        {
          title: 'Resources',
          links: [
            { name: 'System Status', href: '/status' },
            { name: 'API Docs', href: '/api-docs' },
            { name: 'Security', href: '/security' },
            { name: 'Changelog', href: '/changelog' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'Accessibility', href: '/accessibility' },
          ],
        },
      ]

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim().includes('@')) {
      setSubscribed(true)
    }
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/60 to-transparent" />

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-primary-400/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        {/* Newsletter band */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-300/10 blur-[90px]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-300/25 bg-primary-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-100">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-300" />
                {cta.eyebrow}
              </p>
              <h2 className="font-display mt-4 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                {cta.title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{cta.subtitle}</p>
            </div>

            <div>
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-2xl border border-primary-300/30 bg-primary-300/10 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300 text-slate-950">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">You&apos;re on the list.</p>
                    <p className="text-xs text-slate-400">We&apos;ll reach out at {email}.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="footer-newsletter" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="footer-newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 flex-1 rounded-full border border-white/10 bg-slate-900/80 px-5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-primary-300/60 focus:ring-2 focus:ring-primary-300/20"
                  />
                  <button
                    type="submit"
                    className="group/sub inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 text-sm font-semibold text-white shadow-lg shadow-primary-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Subscribe
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover/sub:translate-x-0.5 group-hover/sub:-translate-y-0.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Brand strip */}
        <div className="flex flex-col gap-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <BrandLogo to={user ? '/app' : '/'} variant="dark" className="mb-4" />
            <p className="text-sm leading-6 text-slate-400">
              {isResident
                ? 'Automated refuse service tracking, reporting, and recycling records for residents.'
                : 'Administrative oversight for refuse routes, resident complaints, service requests, and logistics readiness.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:support@arms.local"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:border-primary-300/40 hover:text-white"
            >
              <Mail className="h-4 w-4 text-primary-200" />
              support@arms.local
            </a>
            <a
              href="tel:+18002767"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:border-primary-300/40 hover:text-white"
            >
              <Phone className="h-4 w-4 text-primary-200" />
              1-800-ARMS
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-300/20 bg-primary-300/[0.08] px-4 py-2.5 text-xs font-medium text-primary-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-300 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-300" />
              </span>
              All systems operational
            </span>
            <div className="flex gap-2">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`ARMS on ${name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <Link
                to="/status"
                aria-label="View ARMS system status"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Activity className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Link columns — identical structure for uniform alignment */}
        <div className="grid grid-cols-1 gap-10 border-t border-white/5 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {linkColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group/link inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      <ArrowRight className="h-3 w-3 -translate-x-1 text-primary-300 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                      <span className="-ml-5 transition-all duration-200 group-hover/link:ml-0">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Giant wordmark */}
        <div aria-hidden className="pointer-events-none mt-8 select-none overflow-hidden">
          <p className="font-display bg-gradient-to-b from-white/[0.13] to-white/[0.01] bg-clip-text text-center text-[21vw] font-bold leading-[0.78] tracking-tighter text-transparent sm:text-[11rem] lg:text-[13rem]">
            ARMS
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 border-t border-white/5 py-6 md:flex-row md:justify-between">
          <p className="order-2 text-center text-xs text-slate-500 md:order-1 md:text-left">
            &copy; {currentYear} ARMS — Automated Refuse Management Systems · Built by{' '}
            <span className="font-semibold text-primary-300">IEL</span>
          </p>
          <div className="order-1 flex items-center gap-2 md:order-2">
            <Link
              to={PATHS.verifyReceipt}
              className="rounded-full px-3 py-1.5 text-xs text-slate-500 transition-colors duration-200 hover:text-white"
            >
              Verify a Receipt
            </Link>
            <span className="h-3 w-px bg-white/10" />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="group/top inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/40 hover:bg-primary-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover/top:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer