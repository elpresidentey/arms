import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
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
  Zap,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Footer from '../components/Footer'
import OptimizedImage from '../components/OptimizedImage'
import BrandLogo from '../components/BrandLogo'
import heroRecycling from '../assets/hero-waste-truck-recycling.jpg'
import heroStreet from '../assets/hero-waste-truck-street.jpg'

const heroImages = [
  {
    src: heroStreet,
    alt: 'Waste collection truck serving a city street',
    position: 'center',
  },
  {
    src: heroRecycling,
    alt: 'Sanitation workers loading recyclable material into a collection truck',
    position: 'center',
  },
]

type Feature = { icon: React.ComponentType<{ className?: string }>; title: string; description: string; tint: string }

const primaryFeatures: Feature[] = [
  {
    icon: Truck,
    title: 'Collection status',
    description: 'See scheduled pickups, recent collections, and service activity from one resident dashboard.',
    tint: 'forest',
  },
  {
    icon: FileText,
    title: 'Refuse complaint reporting',
    description: 'Submit missed pickup, illegal dumping, truck, or bin complaints with your address details connected to your account.',
    tint: 'rose',
  },
  {
    icon: Recycle,
    title: 'Recyclables tracking',
    description: 'Log recyclable items, monitor pickup requests, and keep your recycling activity organized.',
    tint: 'emerald',
  },
  {
    icon: Wallet,
    title: 'Wallet visibility',
    description: 'Review recycling earnings and wallet balances from your dashboard.',
    tint: 'amber',
  },
  {
    icon: Receipt,
    title: 'Bill payments',
    description: 'View monthly refuse bills, track payment history, and pay securely online.',
    tint: 'sky',
  },
  {
    icon: Calendar,
    title: 'Service schedules',
    description: 'Check collection routes, view pickup schedules, and stay informed about service timing in your area.',
    tint: 'violet',
  },
  {
    icon: MapPin,
    title: 'Location finder',
    description: 'Find nearby bins and collection points on an interactive map with distance and directions.',
    tint: 'teal',
  },
  {
    icon: Bell,
    title: 'Service updates',
    description: 'Get notices about collections, payments, and service changes.',
    tint: 'indigo',
  },
]

const featureTints: Record<Feature['tint'], string> = {
  forest: 'bg-primary-50 text-primary-700 ring-primary-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
}

const serviceHighlights = [
  {
    icon: Route,
    title: 'Collection routes',
    stat: '20+',
    suffix: 'routes',
    description: 'Collection routes focused on Amuwo Odofin communities.',
  },
  {
    icon: Users,
    title: 'Active residents',
    stat: '1000+',
    suffix: 'residents',
    description: 'Residents using ARMS to manage waste service.',
  },
  {
    icon: Leaf,
    title: 'Recycling impact',
    stat: '5t+',
    suffix: 'recycled',
    description: 'Recyclable materials logged for collection and processing.',
  },
  {
    icon: CheckCircle2,
    title: 'Service reliability',
    stat: '98%',
    suffix: 'on-time',
    description: 'Reported on-time collection rate for scheduled routes.',
  },
]

const billingFeatures = [
  {
    icon: CreditCard,
    title: 'Secure payments',
    description: 'Pay your monthly refuse bills securely with Paystack. Support for cards, bank transfers, and USSD.',
  },
  {
    icon: Receipt,
    title: 'Digital receipts',
    description: 'Payment receipts and billing history available in your dashboard anytime.',
  },
  {
    icon: Calendar,
    title: 'Payment reminders',
    description: 'Get notified before bills are due. Avoid late fees with timely payment reminders.',
  },
]

const testimonials = [
  {
    name: 'Adebayo Johnson',
    role: 'Resident, Festac Town',
    content: 'ARMS has made managing my waste service so much easier. I can track collections, pay bills, and even earn from recycling all in one place.',
  },
  {
    name: 'Chioma Okafor',
    role: 'Resident, Festac Town',
    content: 'The service updates help me know when collection is happening and let me track my recycling earnings.',
  },
  {
    name: 'Ibrahim Musa',
    role: 'Resident, Amuwo Odofin',
    content: 'Finally, a proper system for waste management. The bill payment feature is convenient and the location finder helps me find nearby bins.',
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
    title: 'Sign in and open your dashboard',
    description: 'Access one place for collection updates, recent activity, and your address-linked service history.',
  },
  {
    step: '03',
    title: 'Report refuse issues or manage recyclables',
    description: 'Use the complaints and recyclables sections to submit refuse records and track each status.',
  },
  {
    step: '04',
    title: 'Review wallet and history',
    description: 'Check recycling earnings and past service activity whenever you need a clear record.',
  },
]

const SectionHeading: React.FC<{ eyebrow: string; title: React.ReactNode; description: string; tone?: 'light' | 'dark' }> = ({
  eyebrow,
  title,
  description,
  tone = 'light',
}) => (
  <div className="mx-auto max-w-2xl space-y-4 text-center">
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
        tone === 'light' ? 'bg-primary-50 text-primary-800 ring-1 ring-primary-100' : 'bg-white/10 text-primary-100 ring-1 ring-white/15'
      }`}
    >
      {eyebrow}
    </span>
    <h2
      className={`text-3xl font-bold tracking-tight sm:text-4xl ${
        tone === 'light' ? 'text-slate-950' : 'text-white'
      }`}
    >
      {title}
    </h2>
    <p className={`text-base leading-relaxed sm:text-lg ${tone === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
      {description}
    </p>
  </div>
)

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Get started'
  const activeHeroImageIndex = heroImageIndex
  const isSmallViewport = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Services', href: '#services' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length)
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
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
    <div className="min-h-screen bg-white text-slate-950 antialiased">
      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? 'border-slate-200 bg-white/90 shadow-lg shadow-slate-950/5 backdrop-blur-xl'
            : 'border-slate-200/80 bg-white/80 backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <BrandLogo to="/" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Landing page">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group/nav relative rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                {link.label}
                <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary-600 transition-transform duration-300 group-hover/nav:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="md" className="font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950">
                Sign in
              </Button>
            </Link>
            <Link to={primaryHref} className="hidden sm:block">
              <Button size="md" className="font-semibold shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-expanded={isMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="landing-mobile-menu"
          className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        >
          <nav aria-label="Mobile" className="border-t border-slate-200/80 bg-white/95 px-4 pb-6 pt-3 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" size="lg" fullWidth>
                  Sign in
                </Button>
              </Link>
              <Link to={primaryHref} onClick={() => setIsMenuOpen(false)}>
                <Button size="lg" fullWidth>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section
          className="group/hero relative min-h-[calc(100svh-77px)] overflow-hidden border-b border-slate-200 bg-slate-950"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          onFocus={() => setIsHeroHovered(true)}
          onBlur={() => setIsHeroHovered(false)}
        >
          <div className="absolute inset-0">
            {heroImages.map((image, index) => {
              const isActive = index === activeHeroImageIndex

              return (
                <OptimizedImage
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  priority={index === 0}
                  shouldLoad={index === activeHeroImageIndex || (index === 0 && !isSmallViewport)}
                  className={`absolute inset-0 h-full w-full object-cover transition-all ease-in-out ${
                    isActive
                      ? 'opacity-100 scale-105 saturate-110 duration-[2000ms]'
                      : 'opacity-0 scale-100 saturate-90 duration-[1500ms]'
                  } ${isHeroHovered && isActive ? 'hero-hover-focus brightness-110' : 'brightness-100'}`}
                  style={{ objectPosition: image.position }}
                />
              )
            })}
            <div
              className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                isHeroHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            >
              <div className="hero-hover-grid absolute inset-0" />
              <div className="hero-sweep absolute inset-y-0 left-[-35%] w-1/2 bg-gradient-to-r from-transparent via-white/24 to-transparent" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/78 to-slate-950/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-slate-950/20" />
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(720px 360px at 12% 8%, rgba(244,213,161,0.14), transparent 60%), radial-gradient(560px 300px at 78% 96%, rgba(109,143,98,0.16), transparent 60%)',
              }}
            />
            <div className="absolute bottom-5 right-5 hidden items-center gap-3 rounded-full border border-white/15 bg-slate-950/45 px-4 py-2 text-xs font-medium text-white shadow-2xl shadow-slate-950/20 backdrop-blur-md sm:flex">
              <span>{activeHeroImageIndex === 0 ? 'Collection route' : 'Recycling route'}</span>
              <span className="flex gap-1.5" aria-hidden="true">
                {heroImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Show ${image.alt}`}
                    aria-current={index === activeHeroImageIndex ? 'true' : undefined}
                    aria-pressed={index === activeHeroImageIndex}
                    onClick={() => setHeroImageIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeHeroImageIndex ? 'w-6 bg-primary-300' : 'w-1.5 bg-white/45'
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex min-h-[calc(100svh-77px)] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-8 py-10">
              <div className="space-y-6">
                <span className="stagger-enter inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-primary-200" />
                  Waste service, simplified
                </span>
                <h1 className="stagger-enter text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_16px_rgba(15,23,42,0.45)] sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                  Track collections, report issues, and{' '}
                  <span className="bg-gradient-to-r from-amber-200 via-emerald-200 to-primary-200 bg-clip-text text-transparent">
                    manage recycling
                  </span>
                </h1>
                <p className="stagger-enter max-w-2xl text-lg leading-8 text-slate-100 drop-shadow-[0_1px_8px_rgba(15,23,42,0.4)] sm:text-xl">
                  ARMS brings your waste history, service requests, recyclables, and wallet into one clear
                  dashboard. Sign in with your account to stay updated on collection schedules and earnings.
                </p>
              </div>

              <div className="stagger-enter flex flex-wrap items-center gap-4">
                <Link to={primaryHref}>
                  <Button size="lg">
                    {primaryLabel}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/30 bg-slate-950/40 text-white backdrop-blur-md hover:bg-slate-950/55 hover:text-white">
                    Sign in to your account
                  </Button>
                </Link>
              </div>

              <div className="stagger-enter flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-200">
                {['Collection updates', 'Secure payments', 'Recycling earnings'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <a
              href="#features"
              aria-label="Scroll to features"
              className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-300 transition-colors hover:text-white sm:flex"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Explore</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </a>
          </div>
        </section>

        {/* Service stats band */}
        <section id="services" className="relative overflow-hidden border-b border-slate-200 bg-[#0f1a12]">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(900px 420px at 12% 0%, rgba(74,107,65,0.4), transparent 60%), radial-gradient(700px 380px at 88% 100%, rgba(109,143,98,0.26), transparent 62%)',
            }}
          />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {serviceHighlights.map((highlight) => {
                const Icon = highlight.icon
                return (
                  <div key={highlight.title} className="group">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-primary-200 ring-1 ring-white/15 transition-colors duration-300 group-hover:bg-primary-400/20 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 font-display text-4xl font-bold tracking-tight text-white tabular-nums">
                      {highlight.stat}
                      <span className="text-xl font-semibold text-primary-300/90"> {highlight.suffix}</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{highlight.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{highlight.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <SectionHeading
              eyebrow="Features"
              title="Core tools for residents"
              description="Everything you need to manage your waste service in one place."
            />

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {primaryFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/40 to-primary-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${featureTints[feature.tint]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="border-b border-slate-200 bg-slate-50/70">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-800 ring-1 ring-primary-100">
                  Billing & payments
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Pay your bills with ease
                </h2>
                <p className="text-lg leading-relaxed text-slate-600">
                  Monthly refuse bills delivered to your dashboard. Pay securely online with cards, bank
                  transfers, or USSD.
                </p>

                <div className="space-y-5 pt-2">
                  {billingFeatures.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <div key={feature.title} className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 ring-1 ring-slate-200 shadow-sm">
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

                <div className="pt-4">
                  <Link to={primaryHref}>
                    <Button size="lg">
                      View billing dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary-100 to-emerald-50 opacity-60 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Current billing period</p>
                      <p className="text-xl font-bold text-slate-950">This month</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      Paid
                    </span>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Residential rate</span>
                      <span className="text-sm font-semibold text-slate-950 tabular-nums">₦2,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Late fee</span>
                      <span className="text-sm font-semibold text-slate-950 tabular-nums">₦0</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="font-semibold text-slate-950">Total amount</span>
                      <span className="font-display text-2xl font-bold tracking-tight text-primary-700 tabular-nums">
                        ₦2,000
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button size="lg" fullWidth>
                      <Lock className="h-4 w-4" />
                      Pay with Paystack
                    </Button>
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

        {/* Service updates */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="relative mx-auto max-w-md">
                  <div
                    className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-slate-100 to-primary-50 opacity-70 blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="panel-shell relative space-y-3 rounded-2xl p-4">
                    <div className="flex items-start gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-900">Collection completed</p>
                        <p className="mt-0.5 text-sm leading-5 text-emerald-700">
                          Your scheduled pickup for Festac Town has been completed.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary-900">Payment confirmed</p>
                        <p className="mt-0.5 text-sm leading-5 text-primary-700">
                          Your monthly refuse bill payment was successful.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm ring-1 ring-amber-100">
                        <Recycle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-amber-900">Recyclables valued</p>
                        <p className="mt-0.5 text-sm leading-5 text-amber-700">
                          Your plastic bottles have been valued. Pickup scheduled.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 space-y-6 lg:order-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-100">
                  <Zap className="h-3.5 w-3.5" />
                  Service updates
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Stay informed every step
                </h2>
                <p className="text-lg leading-relaxed text-slate-600">
                  Get updates about collections, payment confirmations, recyclable values, and service changes.
                </p>

                <ul className="space-y-3.5 pt-1">
                  {[
                    'Collection status updates',
                    'Payment confirmations',
                    'Recyclable pickup alerts',
                    'Service schedule changes',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-b border-slate-200 bg-slate-50/70">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <SectionHeading
              eyebrow="Testimonials"
              title="Trusted by residents across Amuwo Odofin"
              description="See what residents are saying about their experience with ARMS."
            />

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5"
                >
                  <svg className="h-8 w-8 text-primary-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="mt-4 flex-1 text-[15px] leading-7 text-slate-700">"{testimonial.content}"</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-800 ring-1 ring-primary-100">
                      {testimonial.name.split(' ').map((part) => part[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{testimonial.name}</p>
                      <p className="truncate text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <SectionHeading
              eyebrow="How it works"
              title="Resident journey in four steps"
              description="Simple steps that match your actual service experience."
            />

            <div className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div
                className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 hidden border-t border-dashed border-primary-200 lg:block"
                aria-hidden="true"
              />
              {residentFlow.map((step) => (
                <article
                  key={step.step}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5"
                >
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white shadow-lg shadow-primary-600/25 transition-transform duration-300 group-hover:scale-105">
                    {step.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#0f1a12]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(820px 400px at 18% 20%, rgba(74,107,65,0.45), transparent 62%), radial-gradient(660px 380px at 84% 84%, rgba(109,143,98,0.3), transparent 62%)',
            }}
          />
          <div
            className="hero-hover-grid pointer-events-none absolute inset-0 opacity-60"
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to get started?
                </h2>
                <p className="text-lg leading-relaxed text-slate-300">
                  Join residents who are managing their waste service more effectively.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link to={primaryHref}>
                  <Button size="lg" variant="secondary">
                    Create your account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
                    Already have an account?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}

export default LandingPage