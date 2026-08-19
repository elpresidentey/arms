import React from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Facebook,
  Instagram,
  Mail,
  Phone,
  ShieldCheck,
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

  const cta = user
    ? user.role === 'resident'
      ? {
          eyebrow: 'Resident services',
          title: 'Your bill, paid in minutes.',
          subtitle: 'View your billing period, pay securely, and keep an instantly verifiable receipt.',
          primary: { label: 'Pay your bill', href: '/app/bills' },
          secondary: { label: 'Verify a receipt', href: PATHS.verifyReceipt },
        }
      : {
          eyebrow: 'Operations workspace',
          title: 'Your operations, at a glance.',
          subtitle: 'Manage routes, complaints, service requests, and resident billing from one place.',
          primary: { label: 'Open Operations', href: '/app/operations' },
          secondary: { label: 'System status', href: '/status' },
        }
    : {
        eyebrow: 'Automated refuse management',
        title: 'Cleaner streets, clearer records.',
        subtitle: 'Track collections, manage billing, and verify every payment receipt — all in one place.',
        primary: { label: 'Explore ARMS', href: '/' },
        secondary: { label: 'Verify a receipt', href: PATHS.verifyReceipt },
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

  const utilityLinks = [
    { name: 'Verify a Receipt', href: PATHS.verifyReceipt },
    { name: 'System Status', href: '/status' },
    { name: 'API Docs', href: '/api-docs' },
    { name: 'Security', href: '/security' },
    { name: 'Changelog', href: '/changelog' },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-primary-900/30 bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/70 to-transparent" />

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-28 h-96 w-96 rounded-full bg-primary-500/10 blur-[130px]" />
        <div className="absolute -bottom-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-400/5 blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {/* CTA band */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-primary-300/25 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-6 py-10 sm:px-10 sm:py-12">
          <div aria-hidden className="hero-hover-grid pointer-events-none absolute inset-0 opacity-40" />
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary-300/20 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-amber-300/10 blur-[90px]" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100">
                {cta.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                {cta.title}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-primary-100/90">{cta.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={cta.primary.href}
                className="group/cta inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-primary-800 shadow-lg shadow-primary-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-50"
              >
                {cta.primary.label}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                to={cta.secondary.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/15"
              >
                {cta.secondary.label}
              </Link>
            </div>
          </div>
        </div>

        {/* Brand strip */}
        <div className="flex flex-col gap-8 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <BrandLogo to={user ? '/app' : '/'} variant="dark" className="mb-4" />
            <p className="max-w-md text-sm leading-6 text-slate-300">
              {isResident
                ? 'Automated refuse service tracking, reporting, and recycling records for residents.'
                : 'Administrative oversight for refuse routes, resident complaints, service requests, and logistics readiness.'}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="mailto:support@arms.local"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition-colors duration-200 hover:border-primary-300/40 hover:bg-primary-300/10 hover:text-white"
            >
              <Mail className="h-4 w-4 text-primary-200" />
              support@arms.local
            </a>
            <a
              href="tel:+18002767"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition-colors duration-200 hover:border-primary-300/40 hover:bg-primary-300/10 hover:text-white"
            >
              <Phone className="h-4 w-4 text-primary-200" />
              1-800-ARMS
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-300/20 bg-primary-300/10 px-4 py-2.5 text-xs font-medium text-primary-100">
              <span className="h-2 w-2 rounded-full bg-primary-300 shadow-[0_0_0_4px_rgb(134_239_172_/_0.16)]" />
              {isResident ? 'Resident services online' : 'Operations workspace online'}
            </span>
            <div className="flex gap-2">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`ARMS on ${name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                </a>
              ))}
              <Link
                to="/status"
                aria-label="View ARMS system status"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
              >
                <Activity className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
              </Link>
            </div>
          </div>
        </div>

        {/* Link columns — identical structure for uniform alignment */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {linkColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
                {column.title}
                <span className="mt-2 block h-px w-9 bg-gradient-to-r from-primary-300/80 to-transparent" />
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group/link inline-flex items-center gap-2 text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:ring-offset-slate-950"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary-300/0 transition-colors duration-200 group-hover/link:bg-primary-300" />
                      <span className="footer-link">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} ARMS <span className="text-slate-600">·</span>{' '}
            <span className="text-slate-500">Automated Refuse Management Systems</span>{' '}
            <span className="text-slate-600">·</span>{' '}
            <span className="text-slate-500">Built by</span>{' '}
            <span className="font-semibold text-primary-300">IEL</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link
              to={PATHS.verifyReceipt}
              className="inline-flex items-center gap-1.5 text-slate-400 transition-colors duration-200 hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="footer-link">Verify a Receipt</span>
            </Link>
            {utilityLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="footer-link text-slate-400 transition-colors duration-200 hover:text-white focus-visible:ring-offset-slate-950"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="group/top inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/40 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover/top:-translate-y-0.5" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer