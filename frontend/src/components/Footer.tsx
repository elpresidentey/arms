import React from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowUpRight, ChevronRight, HelpCircle, Mail, MapPin, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import BrandLogo from './BrandLogo'

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
    { name: 'System Status', href: '/status' },
    { name: 'API Docs', href: '/api-docs' },
    { name: 'Security', href: '/security' },
    { name: 'Changelog', href: '/changelog' },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-primary-900/20 bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/70 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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
              <a
                href="mailto:support@arms.local?subject=ARMS%20support%20request"
                aria-label="Email ARMS support"
                className="group/contact flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
              >
                <Mail className="h-4 w-4 transition-transform duration-300 group-hover/contact:-rotate-6" />
              </a>
              <a
                href="tel:+18002767"
                aria-label="Call ARMS support"
                className="group/contact flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/50 hover:bg-primary-300/10 hover:text-white focus-visible:ring-offset-slate-950"
              >
                <Phone className="h-4 w-4 transition-transform duration-300 group-hover/contact:rotate-6" />
              </a>
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
                <h3 className="mb-4 text-sm font-semibold text-white">{section.title}</h3>
                <ul className="space-y-3">
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
            <h3 className="mb-4 text-sm font-semibold text-white">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="mailto:support@arms.local"
                className="group/quick flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/40 hover:bg-white/[0.07] hover:text-white focus-visible:ring-offset-slate-950"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary-200" />
                  <span className="truncate">support@arms.local</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-300 group-hover/quick:-translate-y-0.5 group-hover/quick:translate-x-0.5 group-hover/quick:opacity-100" />
              </a>
              <a
                href="tel:+18002767"
                className="group/quick flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/40 hover:bg-white/[0.07] hover:text-white focus-visible:ring-offset-slate-950"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary-200" />
                  1-800-ARMS
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-300 group-hover/quick:-translate-y-0.5 group-hover/quick:translate-x-0.5 group-hover/quick:opacity-100" />
              </a>
              <Link
                to="/help"
                className="group/quick flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/40 hover:bg-white/[0.07] hover:text-white focus-visible:ring-offset-slate-950"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 flex-shrink-0 text-primary-200" />
                  24/7 Support
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-300 group-hover/quick:-translate-y-0.5 group-hover/quick:translate-x-0.5 group-hover/quick:opacity-100" />
              </Link>
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
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
