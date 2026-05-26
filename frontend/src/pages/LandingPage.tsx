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
  MapPin,
  Receipt,
  Recycle,
  Route,
  Truck,
  Users,
  Wallet,
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

const primaryFeatures = [
  {
    icon: Truck,
    title: 'Collection status',
    description: 'See scheduled pickups, recent collections, and service activity from one resident dashboard.',
    color: 'bg-primary-50 text-primary-700',
  },
  {
    icon: FileText,
    title: 'Refuse complaint reporting',
    description: 'Submit missed pickup, illegal dumping, truck, or bin complaints with your address details connected to your account.',
    color: 'bg-rose-50 text-rose-700',
  },
  {
    icon: Recycle,
    title: 'Recyclables tracking',
    description: 'Log recyclable items, monitor pickup requests, and keep your recycling activity organized.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Wallet,
    title: 'Wallet visibility',
    description: 'Review recycling earnings and wallet balances from your dashboard.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: Receipt,
    title: 'Bill payments',
    description: 'View monthly refuse bills, track payment history, and pay securely online.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Calendar,
    title: 'Service schedules',
    description: 'Check collection routes, view pickup schedules, and stay informed about service timing in your area.',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    icon: MapPin,
    title: 'Location finder',
    description: 'Find nearby bins and collection points on an interactive map with distance and directions.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: Bell,
    title: 'Service updates',
    description: 'Get notices about collections, payments, and service changes.',
    color: 'bg-indigo-50 text-indigo-700',
  },
]

const serviceHighlights = [
  {
    icon: Route,
    title: 'Collection routes',
    stat: '20+ routes',
    description: 'Collection routes focused on Amuwo Odofin communities.',
  },
  {
    icon: Users,
    title: 'Active residents',
    stat: '1000+',
    description: 'Residents using ARMS to manage waste service.',
  },
  {
    icon: Leaf,
    title: 'Recycling impact',
    stat: '5 tons+',
    description: 'Recyclable materials logged for collection and processing.',
  },
  {
    icon: CheckCircle2,
    title: 'Service reliability',
    stat: '98%',
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
    rating: 5,
  },
  {
    name: 'Chioma Okafor',
    role: 'Resident, Festac Town',
    content: 'The service updates help me know when collection is happening and let me track my recycling earnings.',
    rating: 5,
  },
  {
    name: 'Ibrahim Musa',
    role: 'Resident, Amuwo Odofin',
    content: 'Finally, a proper system for waste management. The bill payment feature is convenient and the location finder helps me find nearby bins.',
    rating: 5,
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

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)

  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Get started'
  const activeHeroImageIndex = heroImageIndex
  const isSmallViewport = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length)
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <BrandLogo to="/" />

          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className="group/nav relative px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg hover:bg-slate-50">
              Features
              <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary-600 transition-transform duration-300 group-hover/nav:scale-x-100" />
            </a>
            <a href="#services" className="group/nav relative px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg hover:bg-slate-50">
              Services
              <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary-600 transition-transform duration-300 group-hover/nav:scale-x-100" />
            </a>
            <a href="#how-it-works" className="group/nav relative px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg hover:bg-slate-50">
              How it works
              <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary-600 transition-transform duration-300 group-hover/nav:scale-x-100" />
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="md" className="hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-medium">
                Sign in
              </Button>
            </Link>
            <Link to={primaryHref}>
              <Button size="md" className="shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 font-semibold">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/62 to-slate-950/18" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/42 via-transparent to-slate-950/16" />
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
                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                  Track collections, report issues, and manage recycling
                </h1>
                <p className="max-w-2xl text-xl leading-8 text-slate-100">
                  ARMS brings your waste history, service requests, recyclables, and wallet into one clear dashboard. 
                  Sign in with your account to stay updated on collection schedules and earnings.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to={primaryHref}>
                  <Button size="lg">
                    {primaryLabel}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary">
                    Sign in to your account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-4 text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">Features</p>
              <h2 className="text-4xl font-bold text-slate-950">Core tools for residents</h2>
              <p className="text-lg text-slate-600">
                Everything you need to manage your waste service in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {primaryFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    className="group rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md hover:border-slate-300"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Service Highlights Section */}
        <section id="services" className="border-b border-slate-200 bg-gradient-to-br from-primary-50 to-emerald-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-4 text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">Service area</p>
              <h2 className="text-4xl font-bold text-slate-950">Built for Amuwo Odofin</h2>
              <p className="text-lg text-slate-600">
                Clear collection records, nearby bins, and payment tools for local residents.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {serviceHighlights.map((highlight) => {
                const Icon = highlight.icon
                return (
                  <article
                    key={highlight.title}
                    className="group relative overflow-hidden rounded-2xl border border-primary-200 bg-white p-8 shadow-sm transition hover:shadow-lg hover:border-primary-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent rounded-bl-full opacity-50" />
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <Icon className="h-7 w-7" />
                      </div>
                      <p className="mt-6 text-4xl font-bold text-slate-950">{highlight.stat}</p>
                      <h3 className="mt-3 text-lg font-semibold text-slate-950">{highlight.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Billing & Payments Section */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">Billing & Payments</p>
                  <h2 className="text-4xl font-bold text-slate-950">Pay your bills with ease</h2>
                  <p className="text-lg text-slate-600">
                    Monthly refuse bills delivered to your dashboard. Pay securely online with cards, bank transfers, or USSD.
                  </p>
                </div>

                <div className="space-y-4">
                  {billingFeatures.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <div key={feature.title} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-950">{feature.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
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
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Current billing period</p>
                        <p className="text-2xl font-bold text-slate-950">May 2026</p>
                      </div>
                      <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        Paid
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 pt-6">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Residential rate</span>
                        <span className="font-semibold text-slate-950">NGN 2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Late fee</span>
                        <span className="font-semibold text-slate-950">NGN 0</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-3">
                        <span className="font-semibold text-slate-950">Total amount</span>
                        <span className="text-2xl font-bold text-primary-700">NGN 2,000</span>
                      </div>
                    </div>

                    <button className="w-full rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700">
                      Pay with Paystack
                    </button>

                    <p className="text-center text-xs text-slate-500">
                      Secure payment handled by Paystack
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Updates Section */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
                  <div className="flex items-start gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Truck className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-900">Collection completed</p>
                      <p className="mt-1 text-sm text-emerald-700">Your scheduled pickup for Festac Town has been completed.</p>
                      <p className="mt-2 text-xs text-emerald-600">2 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Receipt className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">Payment confirmed</p>
                      <p className="mt-1 text-sm text-blue-700">Your May 2026 refuse bill payment of NGN 2,000 was successful.</p>
                      <p className="mt-2 text-xs text-blue-600">1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Recycle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900">Recyclables valued</p>
                      <p className="mt-1 text-sm text-amber-700">Your plastic bottles have been valued at NGN 450. Pickup scheduled.</p>
                      <p className="mt-2 text-xs text-amber-600">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                    <Zap className="h-4 w-4" />
                    Service updates
                  </div>
                  <h2 className="text-4xl font-bold text-slate-950">Stay informed every step</h2>
                  <p className="text-lg text-slate-600">
                    Get updates about collections, payment confirmations, recyclable values, and service changes.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <span className="text-slate-700">Collection status updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <span className="text-slate-700">Payment confirmations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <span className="text-slate-700">Recyclable pickup alerts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <span className="text-slate-700">Service schedule changes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-4 text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">Testimonials</p>
              <h2 className="text-4xl font-bold text-slate-950">Trusted by residents across Amuwo Odofin</h2>
              <p className="text-lg text-slate-600">
                See what residents are saying about their experience with ARMS.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-700 leading-7 mb-6">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-slate-950">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-4 text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">How it works</p>
              <h2 className="text-4xl font-bold text-slate-950">Resident journey in four steps</h2>
              <p className="text-lg text-slate-600">
                Simple steps that match your actual service experience.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {residentFlow.map((step) => (
                <article
                  key={step.step}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-primary-600 to-primary-700">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white">Ready to get started?</h2>
                <p className="text-lg text-primary-50">
                  Join residents who are managing their waste service more effectively.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link to={primaryHref}>
                  <Button
                    size="lg"
                    variant="secondary"
                  >
                    Create your account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <button className="h-11 w-full rounded-lg border-2 border-white bg-transparent px-6 font-medium text-white transition hover:bg-white/10 sm:w-auto">
                    Already have an account?
                  </button>
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
