import React, { useState, useEffect } from 'react'
import '../styles/LandingPage.css'

const SIGS = [
  { pair: 'EUR/USD', dir: 'BUY', entry: '1.08542', tp: '1.09100', sl: '1.08200', rr: '1:2.6', st: 'active', pips: null },
  { pair: 'BTC/USD', dir: 'BUY', entry: '67,240', tp: '69,500', sl: '66,100', rr: '1:2.0', st: 'active', pips: null },
  { pair: 'GBP/JPY', dir: 'SELL', entry: '198.45', tp: '196.80', sl: '199.20', rr: '1:2.1', st: 'tp1', pips: '+165' },
  { pair: 'XAU/USD', dir: 'BUY', entry: '2,318', tp: '2,345', sl: '2,302', rr: '1:1.7', st: 'active', pips: null },
  { pair: 'ETH/USD', dir: 'SELL', entry: '3,480', tp: '3,290', sl: '3,570', rr: '1:2.1', st: 'closed', pips: '+190' },
]

const TICKER_PAIRS = [
  { p: 'EUR/USD', v: '+0.21%', d: 1 },
  { p: 'BTC/USD', v: '+1.84%', d: 1 },
  { p: 'GBP/JPY', v: '−0.37%', d: -1 },
  { p: 'XAU/USD', v: '+0.52%', d: 1 },
  { p: 'ETH/USD', v: '−0.98%', d: -1 },
  { p: 'USD/JPY', v: '+0.14%', d: 1 },
  { p: 'LTC/USD', v: '+2.11%', d: 1 },
  { p: 'EUR/GBP', v: '−0.18%', d: -1 },
  { p: 'SOL/USD', v: '+3.44%', d: 1 },
  { p: 'NAS/USD', v: '+0.77%', d: 1 },
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

const HERO_SLIDES = [
  { img: '/slide1.png', label: 'AI SIGNAL ENGINE' },
  { img: '/slide2.png', label: 'REAL-TIME ANALYTICS' },
  { img: '/slide3.png', label: 'CRYPTO MARKETS' },
  { img: '/slide4.png', label: 'SIGNAL RADAR' },
  { img: '/slide5.png', label: 'PREMIUM EXECUTION' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
    return () => clearInterval(slideInterval)
  }, [])

  // Confidence bar progress animation on mount
  useEffect(() => {
    let currentVal = 0
    const interval = setInterval(() => {
      currentVal += 1.5
      if (currentVal >= 94) {
        currentVal = 94
        clearInterval(interval)
      }
      setConfidence(Math.floor(currentVal))
    }, 18)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="landing-page-root">
      {/* ─────────────────────────── NAV ─────────────────────────── */}
      <nav>
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 10L6 6.5L9 8.5L13 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="13" cy="4" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="dsp" style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-.025em' }}>
            Apex AutoTrader
          </span>
        </div>
        
        <div className="nav-links">
          <a href="#signals">Signals</a>
          <a href="#about">About</a>
          <a href="#pricing">Pricing</a>
        </div>
        
        <div className="nav-end">
          <a href="/login">Sign in</a>
          <a href="/login" className="btn-p" style={{ fontSize: '14px', padding: '8px 18px' }}>
            Start Free Trial
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Nav Overlay */}
      {menuOpen && (
        <div className="mobile-menu">
          <a href="#signals" onClick={() => setMenuOpen(false)}>Signals</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="/login" onClick={() => setMenuOpen(false)} style={{ borderTop: '1px solid rgba(47,209,247,.1)', paddingTop: '15px' }}>Sign in</a>
          <a href="/login" className="btn-p" onClick={() => setMenuOpen(false)} style={{ fontSize: '14px', padding: '10px 18px', width: '100%', textAlign: 'center' }}>
            Start Free Trial
          </a>
        </div>
      )}

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="hero" id="home">
        {/* Background Slides */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-bg-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.img})` }}
          />
        ))}

        {/* Ambient Dark Mask overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(6, 11, 24, 0.4) 0%, rgba(6, 11, 24, 0.92) 80%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}></div>

        {/* Hero content wrapper to sit on top of slides */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', gap: '64px', width: '100%', alignItems: 'center' }}>
          {/* LEFT: Copy */}
          <div style={{ flex: '1 1 440px', maxWidth: '560px' }}>
            <div className="eyebrow rise1">
              <span className="blink" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--profit)', display: 'block', flexShrink: 0 }}></span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500, letterSpacing: '.04em' }}>
                87.4% WIN RATE · {HERO_SLIDES[currentSlide].label} ACTIVE
              </span>
            </div>
            <h1 className="dsp hero-h1 rise2">
              Stop guessing.<br />
              <span style={{ color: 'var(--accent)' }}>Start winning.</span>
            </h1>
            <p className="hero-sub rise3">
              AI-powered forex &amp; crypto trade signals with precision entry, take-profit, and
              stop-loss — delivered in under 2 seconds. Trusted by 12,000+ active traders.
            </p>
            <div className="hero-btns rise3">
              <a href="/login" className="btn-p">Start Free Trial →</a>
              <a href="#about" className="btn-g">View Performance</a>
            </div>
            <div className="hero-stats">
              <div>
                <div className="dsp" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>87.4%</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Win rate</div>
              </div>
              <div>
                <div className="dsp" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>12K+</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Active traders</div>
              </div>
              <div>
                <div className="dsp" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>3.2M+</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Signals sent</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Signal Card */}
          <div className="sig-wrap">
            <div className="sig-glow"></div>
            <div className="sig-card glowcard">
              <div className="sig-topline"></div>

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span className="blink" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--profit)', display: 'block' }}></span>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--profit)', fontWeight: 600, letterSpacing: '.07em' }}>LIVE SIGNAL</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  2 min ago
                </span>
              </div>

              {/* Pair + Direction */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div className="dsp" style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>EUR/USD</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Forex Major · H4 timeframe</div>
                </div>
                <div className="dir-buy" style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  ▲ BUY
                </div>
              </div>

              {/* Micro Chart */}
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden' }}>
                <svg width="100%" height="50" viewBox="0 0 292 50" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D07A" stopOpacity=".25" />
                      <stop offset="100%" stopColor="#22D07A" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 40 C40 40 50 36 80 32 S110 26 140 23 S170 19 200 16 S240 12 270 8 L292 6 L292 50 L0 50Z" fill="url(#cg)" />
                  <path className="draw-ln" d="M0 40 C40 40 50 36 80 32 S110 26 140 23 S170 19 200 16 S240 12 270 8 L292 6" fill="none" stroke="#22D07A" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Data Fields */}
              <div className="data-grid">
                <div className="data-cell full">
                  <span className="mono" style={{ fontSize: '9.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em' }}>ENTRY</span>
                  <span className="mono" style={{ fontSize: '15px', fontWeight: 600 }}>1.08542</span>
                </div>
                <div className="data-cell">
                  <span className="mono" style={{ fontSize: '9.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>TAKE PROFIT 1</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--profit)' }}>1.09100</span>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--profit)', opacity: .75 }}>+51 pips</span>
                  </div>
                </div>
                <div className="data-cell">
                  <span className="mono" style={{ fontSize: '9.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>TAKE PROFIT 2</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--profit)' }}>1.09450</span>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--profit)', opacity: .75 }}>+91 pips</span>
                  </div>
                </div>
                <div className="data-cell">
                  <span className="mono" style={{ fontSize: '9.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>STOP LOSS</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--loss)' }}>1.08200</span>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--loss)', opacity: .75 }}>−34 pips</span>
                  </div>
                </div>
                <div className="data-cell">
                  <span className="mono" style={{ fontSize: '9.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>RISK / REWARD</span>
                  <span className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold)' }}>1 : 2.6</span>
                </div>
              </div>

              {/* Confidence Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>AI Confidence</span>
                  <span className="mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>{confidence}%</span>
                </div>
                <div style={{ height: '5px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, var(--accent), #1A8FFF)', width: `${confidence}%`, transition: 'width .04s' }}></div>
                </div>
              </div>
            </div>

            {/* Floating Pill */}
            <div className="pill-float mono" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)', display: 'block', flexShrink: 0 }}></span>
              <span style={{ fontSize: '11px' }}>TP1 hit · GBP/JPY +165 pips</span>
            </div>
          </div>
        </div>

        {/* Hero Slider Dot Indicators */}
        <div className="hero-indicators">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`indicator-btn ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>

      {/* ─────────────────────────── TICKER ─────────────────────────── */}
      <div className="ticker-outer">
        <div className="ticker-inner">
          {[...TICKER_PAIRS, ...TICKER_PAIRS].map((item, idx) => {
            const isProfit = item.d > 0
            return (
              <div className="ticker-item" key={idx}>
                <span className="dsp" style={{ fontSize: '13px', fontWeight: 600 }}>{item.p}</span>
                <span className="mono" style={{ fontSize: '12px', color: isProfit ? 'var(--profit)' : 'var(--loss)' }}>
                  {isProfit ? '▲' : '▼'} {item.v}
                </span>
                <span style={{ width: '1px', height: '14px', background: 'var(--border)', display: 'inline-block', marginLeft: '8px' }}></span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─────────────────────────── STATS BAR ─────────────────────────── */}
      <div className="wrap">
        <div className="stats-bar">
          <div className="stat-cell">
            <div className="dsp" style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '3px' }}>87.4%</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '3px' }}>Historical win rate</div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>+2.1% vs last month</div>
          </div>
          <div className="stat-cell">
            <div className="dsp" style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '3px' }}>23</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '3px' }}>Active signals today</div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>Updated live</div>
          </div>
          <div className="stat-cell">
            <div className="dsp" style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '3px' }}>&lt; 2s</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '3px' }}>Signal delivery</div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>Avg. latency</div>
          </div>
          <div className="stat-cell">
            <div className="dsp" style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '3px' }}>$0</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '3px' }}>Setup cost</div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>No hidden fees</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────── FEATURES ─────────────────────────── */}
      <section className="wrap section" id="about">
        <div className="section-head" style={{ marginBottom: '48px' }}>
          <div className="s-eyebrow">WHY APEX AUTOTRADER</div>
          <h2 className="s-h2">Built for traders who<br />demand precision</h2>
        </div>
        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-glow" style={{ background: 'var(--accent)' }}></div>
            <div className="feat-icon" style={{ background: 'rgba(47,209,247,.12)', border: '1px solid rgba(47,209,247,.25)', color: 'var(--accent)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 14L6 10L9 12L14 7L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 5h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 class="dsp" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-.01em', marginBottom: '10px' }}>Real-Time AI Signals</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--muted)', marginBottom: '14px' }}>
              ML models scan 50+ indicators across 40 instruments, triggering high-probability setups the instant patterns confirm.
            </p>
            <span className="mono" style={{ fontSize: '10.5px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '.05em' }}>&lt; 2s delivery</span>
          </div>

          <div className="feat-card">
            <div className="feat-glow" style={{ background: 'var(--gold)' }}></div>
            <div className="feat-icon" style={{ background: 'rgba(255,200,87,.1)', border: '1px solid rgba(255,200,87,.22)', color: 'var(--gold)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <h3 class="dsp" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-.01em', marginBottom: '10px' }}>Multi-Asset Coverage</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--muted)', marginBottom: '14px' }}>
              Forex majors, crypto pairs, and commodities — all in one unified dashboard. Never miss a cross-market opportunity again.
            </p>
            <span className="mono" style={{ fontSize: '10.5px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '.05em' }}>40+ instruments</span>
          </div>

          <div className="feat-card">
            <div className="feat-glow" style={{ background: 'var(--profit)' }}></div>
            <div className="feat-icon" style={{ background: 'rgba(34,208,122,.1)', border: '1px solid rgba(34,208,122,.22)', color: 'var(--profit)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3C6.13 3 3 6.13 3 10s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 class="dsp" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-.01em', marginBottom: '10px' }}>Risk-First Every Time</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--muted)', marginBottom: '14px' }}>
              Each signal ships with a defined SL and two TP targets. Position sizing is calculated automatically — zero guesswork, every trade.
            </p>
            <span className="mono" style={{ fontSize: '10.5px', color: 'var(--profit)', fontWeight: 600, letterSpacing: '.05em' }}>Avg R/R: 1 : 2.3</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SIGNAL TABLE ─────────────────────────── */}
      <section className="wrap section" id="signals">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '26px' }}>
          <div>
            <div className="s-eyebrow">SIGNAL FEED</div>
            <h2 className="dsp" style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-.03em' }}>Recent signals</h2>
          </div>
          <a href="/login" className="btn-g sm">View all signals →</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>Pair</th>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>Direction</th>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>Entry</th>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>Take Profit</th>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>Stop Loss</th>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>R/R</th>
                <th className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.07em' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {SIGS.map((s, idx) => {
                const isBuy = s.dir === 'BUY'
                let statusBadge
                if (s.st === 'active') {
                  statusBadge = (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--profit)', display: 'block' }}></span>
                      <span className="mono" style={{ fontSize: '11.5px', color: 'var(--profit)', fontWeight: 600 }}>Active</span>
                    </div>
                  )
                } else if (s.st === 'tp1') {
                  statusBadge = <span className="mono" style={{ fontSize: '11.5px', color: 'var(--profit)' }}>✓ TP1 {s.pips}</span>
                } else {
                  statusBadge = <span className="mono" style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Closed {s.pips}</span>
                }

                return (
                  <tr key={idx}>
                    <td><span className="dsp" style={{ fontWeight: 600, fontSize: '14px' }}>{s.pair}</span></td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: isBuy ? 'rgba(34,208,122,.1)' : 'rgba(255,77,77,.1)',
                        color: isBuy ? 'var(--profit)' : 'var(--loss)',
                        border: isBuy ? '1px solid rgba(34,208,122,.25)' : '1px solid rgba(255,77,77,.25)',
                      }}>
                        {isBuy ? '▲ BUY' : '▼ SELL'}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '13px' }}>{s.entry}</td>
                    <td className="mono" style={{ fontSize: '13px', color: 'var(--profit)' }}>{s.tp}</td>
                    <td className="mono" style={{ fontSize: '13px', color: 'var(--loss)' }}>{s.sl}</td>
                    <td className="mono" style={{ fontSize: '12px', color: 'var(--gold)' }}>{s.rr}</td>
                    <td>{statusBadge}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────── PRICING ─────────────────────────── */}
      <section className="wrap section" id="pricing">
        <div className="section-head" style={{ marginBottom: '48px' }}>
          <div className="s-eyebrow">PRICING</div>
          <h2 className="s-h2">Simple, transparent pricing</h2>
          <p style={{ color: 'var(--muted)', marginTop: '14px', fontSize: '15px' }}>
            Start trading today. Choose the plan that fits your strategy.
          </p>
        </div>
        <div className="plan-grid">
          {PLANS.map((plan, idx) => {
            return (
              <div className={`plan-card ${plan.highlight ? 'hot' : ''}`} key={idx}>
                {plan.highlight && <div className="pop-badge">MOST POPULAR</div>}
                <div className="mono" style={{ fontSize: '11px', color: plan.highlight ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.08em', marginBottom: '10px', marginTop: plan.highlight ? '10px' : '0' }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '22px' }}>
                  <span className="dsp" style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-.04em' }}>{plan.price}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{plan.period}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '22px', marginBottom: '24px', flex: 1 }}>
                  {plan.features.map((feat, fidx) => (
                    <div className="check-row" key={fidx}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke={plan.highlight ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.4" />
                        <path d="M4.5 7l2 2 3-3" stroke={plan.highlight ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: '13.5px', color: plan.highlight ? 'var(--text)' : 'var(--muted)' }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
                <a href="/login" className={plan.highlight ? 'btn-p' : 'btn-g'} style={{ width: '100%', fontSize: '14px' }}>
                  {plan.cta}
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─────────────────────────── CTA STRIP ─────────────────────────── */}
      <div className="wrap">
        <div className="cta-strip">
          <div className="cta-glow"></div>
          <div>
            <h2 className="dsp" style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '10px' }}>Trade with a real edge</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Start your free trial. Connect your broker in under 5 minutes.</p>
          </div>
          <a href="/login" className="btn-p" style={{ fontSize: '15px', padding: '14px 36px', flexShrink: 0 }}>
            Start Free Trial →
          </a>
        </div>
      </div>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent), #1A8FFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 8.5L4.5 5.5L7 7.5L10.5 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="dsp" style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-.02em' }}>Apex AutoTrader</span>
          <span style={{ color: 'var(--muted)', fontSize: '12px', marginLeft: '14px' }}>
            © {new Date().getFullYear()} Apex AutoTrader. All rights reserved.
          </span>
        </div>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/login">Support</a>
        </div>
      </footer>
    </div>
  )
}
