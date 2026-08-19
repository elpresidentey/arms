import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Leaf,
  Lock,
  MapPin,
  Menu,
  Receipt,
  Recycle,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Footer from '../components/Footer'
import OptimizedImage from '../components/OptimizedImage'
import BrandLogo from '../components/BrandLogo'
import { PATHS } from '../routes/paths'
import heroRecycling from '../assets/hero-waste-truck-recycling.jpg'
import heroStreet from '../assets/hero-waste-truck-street.jpg'

const heroImages = [
  {
    src: heroStreet,
    alt: 'Waste collection truck serving a city street',
    label: 'Collection route',
  },
  {
    src: heroRecycling,
    alt: 'Sanitation workers loading recyclable material into a collection truck',
    label: 'Recycling route',
  },
]

const primaryFeatures = [
  {
    icon: Truck,
    title: 'Collection status',
    description: 'See scheduled pickups, recent collections, and service activity from one resident dashboard.',
    span: 'featured' as const,
  },
  {
    icon: FileText,
    title: 'Refuse complaint reporting',
    description: 'Submit missed pickup, dumping, truck, or bin complaints with your address already connected.',
    span: 'wide' as const,
  },
  {
    icon: Recycle,
    title: 'Recyclables tracking',
    description: 'Log items, monitor pickup requests, and keep recycling activity organized.',
    span: 'wide' as const,
  },
  {
    icon: Wallet,
    title: 'Wallet visibility',
    description: 'Review recycling earnings and wallet balances in one place.',
    span: 'third' as const,
  },
  {
    icon: Receipt,
    title: 'Bill payments',
    description: 'View monthly refuse bills and pay securely online.',
    span: 'third' as const,
  },
  {
    icon: Calendar,
    title: 'Service schedules',
    description: 'Check collection routes and pickup timing for your area.',
    span: 'third' as const,
  },
  {
    icon: MapPin,
    title: 'Location finder',
    description: 'Find nearby bins and collection points with distance and directions.',
    span: 'half' as const,
  },
  {
    icon: Bell,
    title: 'Service updates',
    description: 'Get notices about collections, payments, and service changes.',
    span: 'half' as const,
  },
]

const featureSpanClass: Record<(typeof primaryFeatures)[number]['span'], string> = {
  featured: 'md:col-span-6 lg:col-span-4 lg:row-span-2',
  wide: 'md:col-span-3 lg:col-span-2',
  third: 'md:col-span-2 lg:col-span-2',
  half: 'md:col-span-3 lg:col-span-3',
}

const serviceHighlights = [
  {
    icon: Route,
    stat: '20+',
    suffix: 'routes',
    description: 'Collection routes across Amuwo Odofin communities.',
  },
  {
    icon: Users,
    stat: '1,000+',
    suffix: 'residents',
    description: 'Residents using ARMS to manage waste service.',
  },
  {
    icon: Leaf,
    stat: '5t+',
    suffix: 'recycled',
    description: 'Recyclable materials logged for collection.',
  },
  {
    icon: CheckCircle2,
    stat: '98%',
    suffix: 'on-time',
    description: 'Reported on-time collection for scheduled routes.',
  },
]

const billingFeatures = [
  {
    icon: CreditCard,
    title: 'Secure payments',
    description: 'Pay monthly refuse bills with Paystack — cards, bank transfer, or USSD.',
  },
  {
    icon: Receipt,
    title: 'Digital receipts',
    description: 'Payment receipts and billing history stay in your dashboard.',
  },
  {
    icon: Calendar,
    title: 'Payment reminders',
    description: 'Get notified before bills are due so late fees are easier to avoid.',
  },
]

const testimonials = [
  {
    name: 'Adebayo Johnson',
    role: 'Resident, Festac Town',
    content:
      'ARMS has made managing my waste service so much easier. I can track collections, pay bills, and even earn from recycling all in one place.',
  },
  {
    name: 'Chioma Okafor',
    role: 'Resident, Festac Town',
    content: 'The service updates help me know when collection is happening and let me track my recycling earnings.',
  },
  {
    name: 'Ibrahim Musa',
    role: 'Resident, Amuwo Odofin',
    content:
      'Finally, a proper system for waste management. The bill payment feature is convenient and the location finder helps me find nearby bins.',
  },
]

const residentFlow = [
  {
    step: '01',
    title: 'Register your resident account',
    description: 'Create an account with your name, contact details, address, and street information.',
  },
  {
    step: '02',
    title: 'Open your dashboard',
    description: 'See collection updates, recent activity, and address-linked service history in one place.',
  },
  {
    step: '03',
    title: 'Report issues or log recyclables',
    description: 'Submit refuse complaints and recyclable records, then follow each status as it moves.',
  },
  {
    step: '04',
    title: 'Review wallet and history',
    description: 'Check recycling earnings and past service activity whenever you need a clear record.',
  },
]

const collectionPreview = [
  { street: 'Festac Town · 5th Avenue', status: 'On route', tone: 'live' as const },
  { street: 'Amuwo Odofin · Mile 2', status: 'Scheduled', tone: 'soon' as const },
  { street: 'Satellite Town', status: 'Completed', tone: 'done' as const },
]

const SectionHeading: React.FC<{
  eyebrow: string
  title: React.ReactNode
  description: string
  align?: 'center' | 'left'
}> = ({ eyebrow, title, description, align = 'center' }) => (
  <div className={clsx('max-w-2xl space-y-4', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
    <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-800 ring-1 ring-primary-100">
      {eyebrow}
    </span>
    <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
      {title}
    </h2>
    <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
  </div>
)

const ProductPreview: React.FC = () => (
  <div className="landing-float relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
    <div
      className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary-300/30 via-amber-200/10 to-transparent blur-2xl"
      aria-hidden="true"
    />
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Truck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">Resident dashboard</p>
            <p className="text-[11px] text-slate-500">Festac Town · Amuwo Odofin</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-2xl bg-[#f4f7f2] p-4 ring-1 ring-primary-100/80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700">Next collection</p>
          <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-slate-950">Thursday, 7:00–10:00 AM</p>
          <p className="mt-1 text-sm text-slate-600">Truck assigned to 5th Avenue route</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">Wallet</p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums text-slate-950">₦4,250</p>
            <p className="mt-0.5 text-[11px] text-emerald-700">Recycling earnings</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">This month</p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums text-slate-950">₦2,000</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Recent activity</p>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-100">
              <Truck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">Collection completed</p>
              <p className="text-[11px] text-slate-500">Festac Town · today</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-amber-700 ring-1 ring-amber-100">
              <Recycle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">Recyclables valued</p>
              <p className="text-[11px] text-slate-500">Pickup scheduled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const primaryHref = user ? PATHS.app : PATHS.residentRegister
  const primaryLabel = user ? 'Open dashboard' : 'Create free account'
  const loginHref = PATHS.residentLogin

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Billing', href: '#billing' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Stories', href: '#testimonials' },
  ]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return undefined

    const intervalId = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length)
    }, 6500)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-slate-950 antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 p-3 sm:p-4">
        <div
          className={clsx(
            'mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border transition-all duration-300',
            isScrolled || isMenuOpen
              ? 'border-slate-200/80 bg-white/90 shadow-lg shadow-slate-950/10 backdrop-blur-xl'
              : 'border-white/20 bg-white/75 shadow-lg shadow-slate-950/10 backdrop-blur-xl',
          )}
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
            <BrandLogo to={PATHS.home} density="compact" />

            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Landing page">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {!user ? (
                <Link to={loginHref} className="hidden sm:block">
                  <Button variant="ghost" size="md" className="font-medium text-slate-700">
                    Sign in
                  </Button>
                </Link>
              ) : null}
              <Link to={primaryHref} className="hidden sm:block">
                <Button size="md" className="font-semibold shadow-md shadow-primary-600/20">
                  {user ? 'Open dashboard' : 'Get started'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                aria-expanded={isMenuOpen}
                aria-controls="landing-mobile-menu"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div id="landing-mobile-menu" className={clsx('lg:hidden', isMenuOpen ? 'block' : 'hidden')}>
            <nav aria-label="Mobile" className="border-t border-slate-200/80 px-3 pb-4 pt-2">
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
                {!user ? (
                  <Link to={loginHref} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="secondary" size="lg" fullWidth>
                      Sign in
                    </Button>
                  </Link>
                ) : null}
                <Link to={primaryHref} onClick={() => setIsMenuOpen(false)}>
                  <Button size="lg" fullWidth>
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="relative min-h-[100svh] overflow-hidden bg-[#0b140e]">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => {
              const isActive = index === heroImageIndex
              return (
                <OptimizedImage
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  priority={index === 0}
                  shouldLoad={isActive || index === 0}
                  className={clsx(
                    'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out',
                    isActive ? 'opacity-100 landing-kenburns-active' : 'opacity-0',
                  )}
                />
              )
            })}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b140e] via-[#0b140e]/88 to-[#0b140e]/42" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b140e] via-[#0b140e]/20 to-[#0b140e]/35" />
            <div className="landing-noise pointer-events-none absolute inset-0" aria-hidden="true" />
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(720px 380px at 12% 18%, rgba(109,143,98,0.22), transparent 60%), radial-gradient(560px 300px at 88% 88%, rgba(194,120,59,0.12), transparent 62%)',
              }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-start px-4 pb-10 pt-28 sm:px-6 lg:justify-center lg:px-8 lg:pt-32">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
              <div className="max-w-2xl space-y-8">
                <div className="space-y-5">
                  <span className="stagger-enter inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-primary-200" />
                    Live in Amuwo Odofin
                    <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                    <span className="hidden text-white/70 sm:inline">Waste service, simplified</span>
                  </span>
                  <h1 className="stagger-enter font-display text-[2.35rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                    Your street&apos;s refuse service,{' '}
                    <span className="bg-gradient-to-r from-amber-200 via-emerald-200 to-primary-200 bg-clip-text text-transparent">
                      finally in one place.
                    </span>
                  </h1>
                  <p className="stagger-enter max-w-xl text-lg leading-8 text-slate-200 sm:text-xl">
                    Track collections, pay bills, report issues, and earn from recycling — a single dashboard for
                    residents in Amuwo Odofin.
                  </p>
                </div>

                <div className="stagger-enter flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to={primaryHref}>
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-2xl px-6 text-[15px] font-semibold shadow-lg shadow-primary-900/30 sm:w-auto"
                    >
                      {primaryLabel}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  {!user ? (
                    <Link to={loginHref}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-full rounded-2xl border-white/20 bg-white/10 px-6 text-[15px] text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:w-auto"
                      >
                        Sign in
                      </Button>
                    </Link>
                  ) : null}
                </div>

                <div className="stagger-enter flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                  {['Collection updates', 'Paystack billing', 'Recycling wallet'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary-300" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:pt-2">
                <ProductPreview />
              </div>
            </div>

            <div id="services" className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
              {serviceHighlights.map((highlight) => {
                const Icon = highlight.icon
                return (
                  <div key={highlight.suffix} className="bg-[#0b140e]/55 px-5 py-5 backdrop-blur-md sm:px-6">
                    <Icon className="h-4 w-4 text-primary-300" />
                    <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white tabular-nums">
                      {highlight.stat}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-200">{highlight.suffix}</p>
                    <p className="mt-1 hidden text-xs leading-5 text-slate-400 sm:block">{highlight.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-white/60">
              <span>{heroImages[heroImageIndex].label}</span>
              <span className="flex gap-1.5" aria-hidden="true">
                {heroImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Show ${image.alt}`}
                    aria-pressed={index === heroImageIndex}
                    onClick={() => setHeroImageIndex(index)}
                    className={clsx(
                      'h-1.5 rounded-full transition-all duration-500',
                      index === heroImageIndex ? 'w-6 bg-primary-300' : 'w-1.5 bg-white/40 hover:bg-white/70',
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
        </section>

        <section id="features" className="landing-mesh border-b border-slate-200/80">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <SectionHeading
              eyebrow="Features"
              title="Everything a resident needs, without the runaround"
              description="Collection status, complaints, recycling, bills, and a wallet — designed around the street you live on."
            />

            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
              {primaryFeatures.map((feature) => {
                const Icon = feature.icon
                const featured = feature.span === 'featured'
                return (
                  <article
                    key={feature.title}
                    className={clsx(
                      'group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5 sm:p-7',
                      featureSpanClass[feature.span],
                      featured && 'bg-gradient-to-br from-white via-white to-primary-50/70',
                    )}
                  >
                    <div
                      className={clsx(
                        'flex items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100 transition-transform duration-300 group-hover:scale-105',
                        featured ? 'h-14 w-14' : 'h-11 w-11',
                      )}
                    >
                      <Icon className={featured ? 'h-7 w-7' : 'h-5 w-5'} />
                    </div>
                    <h3 className={clsx('mt-5 font-semibold text-slate-950', featured ? 'text-2xl' : 'text-lg')}>
                      {feature.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-slate-600">{feature.description}</p>

                    {featured ? (
                      <ul className="mt-6 space-y-2">
                        {collectionPreview.map((row) => (
                          <li
                            key={row.street}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 px-3.5 py-3"
                          >
                            <span className="truncate text-sm font-medium text-slate-800">{row.street}</span>
                            <span
                              className={clsx(
                                'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                                row.tone === 'live' && 'bg-emerald-50 text-emerald-700',
                                row.tone === 'soon' && 'bg-amber-50 text-amber-800',
                                row.tone === 'done' && 'bg-slate-100 text-slate-600',
                              )}
                            >
                              {row.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="billing" className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              <div className="space-y-6">
                <SectionHeading
                  align="left"
                  eyebrow="Billing & payments"
                  title="Pay refuse bills the same way you pay everything else"
                  description="Monthly bills land in your dashboard. Pay with cards, bank transfer, or USSD — receipts stay with you."
                />

                <div className="space-y-4 pt-2">
                  {billingFeatures.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <div key={feature.title} className="flex gap-4 rounded-2xl p-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4f7f2] text-primary-700 ring-1 ring-primary-100">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-950">{feature.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{feature.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2">
                  <Link to={primaryHref}>
                    <Button size="lg" className="h-12 rounded-2xl px-6 text-[15px] font-semibold">
                      {user ? 'View billing' : 'Open billing dashboard'}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary-100 to-amber-50 opacity-80 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Current billing period</p>
                      <p className="font-display text-xl font-bold text-slate-950">This month</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      Paid
                    </span>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Residential rate</span>
                      <span className="text-sm font-semibold tabular-nums text-slate-950">₦2,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Late fee</span>
                      <span className="text-sm font-semibold tabular-nums text-slate-950">₦0</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="font-semibold text-slate-950">Total amount</span>
                      <span className="font-display text-2xl font-bold tracking-tight text-primary-700 tabular-nums">
                        ₦2,000
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link to={primaryHref}>
                      <Button size="lg" fullWidth className="h-12 rounded-2xl font-semibold">
                        <Lock className="h-4 w-4" />
                        Pay with Paystack
                      </Button>
                    </Link>
                  </div>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Secure payment handled by Paystack
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-mesh border-b border-slate-200/80">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <SectionHeading
              eyebrow="How it works"
              title="Four steps from signup to a clear service record"
              description="The same path residents actually use — no extra jargon, no extra apps."
            />

            <div className="relative mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div
                className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent lg:block"
                aria-hidden="true"
              />
              {residentFlow.map((step) => (
                <article
                  key={step.step}
                  className="group relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5"
                >
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 font-display text-lg font-bold text-white shadow-lg shadow-primary-600/25">
                    {step.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <SectionHeading
              eyebrow="Resident stories"
              title="Trusted on streets across Amuwo Odofin"
              description="What residents say about collections, bills, and recycling in one dashboard."
            />

            <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.name}
                  className={clsx(
                    'flex flex-col rounded-3xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-900/5',
                    index === 0
                      ? 'border-primary-200 bg-[#f4f7f2] lg:col-span-1'
                      : 'border-slate-200/80 bg-white',
                  )}
                >
                  <p className="font-display text-5xl leading-none text-primary-300" aria-hidden="true">
                    “
                  </p>
                  <p className="mt-2 flex-1 text-[15px] leading-7 text-slate-700">{testimonial.content}</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-200/70 pt-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                      {testimonial.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{testimonial.name}</p>
                      <p className="truncate text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0b140e]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(820px 400px at 18% 20%, rgba(74,107,65,0.45), transparent 62%), radial-gradient(660px 380px at 84% 84%, rgba(194,120,59,0.18), transparent 62%)',
            }}
          />
          <div className="landing-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl space-y-8 text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
                Ready for a clearer waste service?
              </h2>
              <p className="text-lg leading-relaxed text-slate-300">
                Join residents in Amuwo Odofin who already track collections, pay bills, and manage recycling in ARMS.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to={primaryHref}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 w-full rounded-2xl px-6 text-[15px] font-semibold sm:w-auto"
                  >
                    {primaryLabel}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                {!user ? (
                  <Link to={loginHref}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-full rounded-2xl border-white/20 bg-white/10 px-6 text-[15px] text-white hover:bg-white/20 hover:text-white sm:w-auto"
                    >
                      Already have an account?
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
