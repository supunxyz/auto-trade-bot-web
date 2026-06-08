import React, { useState, useEffect } from 'react'

const SLIDES = [
  {
    title: 'Smart Trading Signals',
    subtitle: 'AI-powered forex & crypto signals with 65%+ confidence threshold',
    desc: 'Our engine analyzes EURUSD, GBPUSD, BTCUSDT and more — generating trade signals every 2–5 minutes.',
    icon: '📈',
  },
  {
    title: 'Intelligent Risk Management',
    subtitle: 'Configurable risk per trade, R:R ratios, and basket auto-close',
    desc: 'Set your risk tolerance once. The system handles position sizing, stop-loss and take-profit automatically.',
    icon: '🛡️',
  },
  {
    title: 'Real-Time Execution',
    subtitle: 'Connects to MT5 & Binance — trades execute in milliseconds',
    desc: 'Seamless broker integration. Once a signal qualifies, your trade is placed instantly with no manual steps.',
    icon: '⚡',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    highlight: false,
    features: ['1 broker account', '2 forex pairs', '1 crypto pair', 'Manual trade execution', 'Basic dashboard', 'Community support'],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    highlight: true,
    features: ['3 broker accounts', 'All forex pairs', 'All crypto pairs', 'Auto-execution', 'Basket management', 'Priority support'],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    highlight: false,
    features: ['Unlimited accounts', 'Custom pairs', 'Custom intervals', 'API access', 'White-label option', 'Dedicated support'],
    cta: 'Contact Sales',
  },
]

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

function Navbar({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#518DC4' }}>
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">
              Apex <span style={{ color: '#518DC4' }}>AutoTrader</span>
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeSection === link.href.replace('#', '') ? '#518DC4' : '#4B5563',
                  backgroundColor: activeSection === link.href.replace('#', '') ? '#eef5fc' : 'transparent',
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="ml-4 px-5 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#518DC4' }}
            >
              Get Started
            </a>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-2">
              <a
                href="/login"
                className="block text-center px-5 py-2 rounded-lg text-white text-sm font-semibold"
                style={{ backgroundColor: '#518DC4' }}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function Hero() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = (idx) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 300)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [current])

  const slide = SLIDES[current]

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'rgba(5, 20, 50, 0.45)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className={`transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {slide.title}
          </h1>
          <p className="text-xl sm:text-2xl font-medium mb-4" style={{ color: '#bfdbfe' }}>
            {slide.subtitle}
          </p>
          <p className="text-base sm:text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#93c5fd' }}>
            {slide.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-colors hover:bg-blue-50"
              style={{ backgroundColor: 'white', color: '#2d5e96' }}
            >
              Start Trading Free
            </a>
            <a
              href="#about"
              className="px-8 py-4 rounded-xl font-semibold text-lg text-white transition-colors hover:bg-white/10"
              style={{ border: '2px solid rgba(255,255,255,0.5)' }}
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="flex justify-center space-x-3 mt-12">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="rounded-full transition-all duration-300"
              style={{
                width: idx === current ? '2rem' : '0.75rem',
                height: '0.75rem',
                backgroundColor: idx === current ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/30"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/30"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#about">
          <svg className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  )
}

function About() {
  const features = [
    { icon: '/icons/secure.png', title: 'Secure', desc: 'JWT auth + encrypted broker credentials', bg: '#f0fdf4', border: '#bbf7d0' },
    { icon: '/icons/lightning.png', title: 'Fast', desc: 'Sub-second signal-to-execution pipeline', bg: '#fff7ed', border: '#fed7aa' },
    { icon: '/icons/donut-chart.png', title: 'Analytical', desc: 'Real-time P&L tracking and statistics', bg: '#eff6ff', border: '#bfdbfe' },
    { icon: '/icons/globe.png', title: 'Multi-broker', desc: 'MT5 for forex, Binance for crypto', bg: '#fff1f2', border: '#fecdd3' },
  ]

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#518DC4' }}>About Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              Built for traders who want results, not complexity
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Apex AutoTrader was built to give every trader access to institutional-grade automation.
              We combine technical signal analysis with smart risk controls and multi-broker execution
              into one seamless platform.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you trade forex on MetaTrader 5 or crypto on Binance, our system monitors
              the markets 24/7, identifies high-confidence opportunities, and executes trades
              automatically — so you don't have to.
            </p>
            <a
              href="/login"
              className="inline-block mt-8 px-6 py-3 text-white rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#518DC4' }}
            >
              Create Free Account
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border hover:shadow-md transition-shadow"
                style={{ backgroundColor: f.bg, borderColor: f.border }}
              >
                <img src={f.icon} alt={f.title} className="w-12 h-12 mb-3 object-contain" />
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#518DC4' }}>Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-8 flex flex-col"
              style={{
                backgroundColor: plan.highlight ? '#518DC4' : 'white',
                color: plan.highlight ? 'white' : 'inherit',
                boxShadow: plan.highlight ? '0 25px 50px -12px rgba(81,141,196,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                transform: plan.highlight ? 'scale(1.05)' : 'scale(1)',
                border: plan.highlight ? 'none' : '1px solid #e5e7eb',
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <div
                className="text-sm font-semibold uppercase tracking-widest mb-2"
                style={{ color: plan.highlight ? '#bfdbfe' : '#518DC4' }}
              >
                {plan.name}
              </div>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-bold" style={{ color: plan.highlight ? 'white' : '#111827' }}>
                  {plan.price}
                </span>
                <span className="mb-2" style={{ color: plan.highlight ? '#93c5fd' : '#9ca3af' }}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: plan.highlight ? '#bfdbfe' : '#518DC4' }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: plan.highlight ? '#eff6ff' : '#4B5563' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/login"
                className="block text-center py-3 px-6 rounded-xl font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: plan.highlight ? 'white' : '#518DC4',
                  color: plan.highlight ? '#2d5e96' : 'white',
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#518DC4' }}>
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg">Apex AutoTrader</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automated trading for serious traders. Connecting your strategy to the markets 24/7.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/login" className="text-gray-400 text-sm hover:text-white transition-colors">Login</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#518DC4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Trading Street, Financial District,<br />New York, NY 10004</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#518DC4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@apexautotrader.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#518DC4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +1 (800) APEX-TRD
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Apex AutoTrader. All rights reserved.</p>
          <p className="text-gray-500 text-xs">Trading involves risk. Past performance is not indicative of future results.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const ids = ['home', 'about', 'pricing']
    const observers = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)

    return () => observers.forEach(obs => obs.disconnect())
  }, [])

  return (
    <div className="font-sans">
      <Navbar activeSection={activeSection} />
      <Hero />
      <About />
      <Pricing />
      <Footer />
    </div>
  )
}
