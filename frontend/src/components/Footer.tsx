import React from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUp,
  ArrowUpRight,
  ChevronRight,
  Facebook,
  HelpCircle,
  Instagram,
  Mail,
  MapPin,
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

  const footerLinks = isResident
    ? [
        {
          title: 'Resident Tools',
          links: [
            { name: 'Dashboard', href: '/app' },
            { name: 'Collection History', href: '/app/waste-history' },
            { name: 'My Recyclables', href: '/app/recyclables' },
            { name: 'Bin Locations', href: '/app/locations' },
            { name: 'Wallet', href: '/app/wallet' },
            { name: 'Verify a Receipt', href: PATHS.verifyReceipt },
          ],
        },
        {
          title: 'Support',
          links: [
            { name: 'Help Center', href: '/help' },
            { name: 'Report Refuse Issue', href: '/app/reports' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'FAQs', href: '/faqs' },
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
            { name: 'System Status', href: '/status' },
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

  const quickCards = [
    {
      name: 'Email support',
      value: 'support@arms.local',
      href: 'mailto:support@arms.local',
      Icon: Mail,
    },
    {
      name: 'Phone line',
      value: '1-800-ARMS',
      href: 'tel:+18002767',
      Icon: Phone,
    },
    {
      name: 'Help & FAQs',
      value: '24/7 Support',
      href: '/help',
      Icon: HelpCircle,
    },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-primary-900/20 bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/70 to-transparent" />

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary-500/10 blur-[110px]" />
        <div className="absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-amber-400/10 blur-[130px]" />
        <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-400/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_2fr_0.95fr]">
          <div>
            <BrandLogo to={user ? '/app' : '/'} variant="dark" className="mb-6" />
            <p className="max-w-sm text-sm leading-6 text-slate-300">
              {isResident
                ? 'Automated refuse service tracking, reporting, and recycling records for residents.'
                : 'Administrative oversight for refuse routes, resident complaints, service requests, and logistics readiness.'}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-300/20 bg-primary-300/10 px-3 py-1.5 text-xs font-medium text-primary-100">
              <span className="h-2 w-2 rounded-full bg-primary-300 shadow-[0_0_0_4px_rgb(134_239_172_/_0.16)]" />
              {isResident ? 'Resident services online' : 'Operations workspace online'}
            </div>

            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`ARMS on ${name}`}
                  className="group/contact flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover/contact:scale-110" />
                </a>
              ))}
              <Link
                to="/status"
                aria-label="View ARMS system status"
                className="group/contact flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
              >
                <Activity className="h-4 w-4 transition-transform duration-300 group-hover/contact:scale-110" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
                  {section.title}
                  <span className="mt-2 block h-px w-9 bg-gradient-to-r from-primary-300/80 to-transparent" />
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="footer-link group/link inline-flex items-center gap-2 text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:ring-offset-slate-950"
                      >
                        <span>{link.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
              Get in touch
              <span className="mt-2 block h-px w-9 bg-gradient-to-r from-primary-300/80 to-transparent" />
            </h3>

            <div className="space-y-3">
              <Link
                to={PATHS.verifyReceipt}
                className="group/verify flex items-center justify-between gap-3 rounded-lg border border-primary-300/25 bg-primary-300/[0.06] px-3 py-3 text-sm text-primary-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-300/15 text-primary-200">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-primary-200/80">
                      Receipt authenticity
                    </span>
                    <span className="block truncate font-semibold">Verify a Receipt</span>
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60 transition-transform duration-300 group-hover/verify:-translate-y-0.5 group-hover/verify:translate-x-0.5 group-hover/verify:opacity-100" />
              </Link>

              {quickCards.map(({ name, value, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  className="group/quick flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/40 hover:bg-white/[0.07] hover:text-white focus-visible:ring-offset-slate-950"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-primary-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        {name}
                      </span>
                      <span className="block truncate font-semibold">{value}</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-300 group-hover/quick:-translate-y-0.5 group-hover/quick:translate-x-0.5 group-hover/quick:opacity-100" />
                </a>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary-200" />
              <span>Resident service records stay tied to verified street and ward details.</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-400">
                &copy; {currentYear} ARMS. All rights reserved.
              </p>
              <p className="text-xs text-slate-500">
                Built by <span className="font-semibold text-primary-300">IEL</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {utilityLinks.map((link) => (
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
      </div>
    </footer>
  )
}

export default Footer