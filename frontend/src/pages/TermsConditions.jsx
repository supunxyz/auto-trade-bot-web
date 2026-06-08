import React from 'react'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing and using Apex AutoTrader, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our service.',
  },
  {
    title: '2. Trading Risk Disclaimer',
    body: 'Trading financial instruments involves substantial risk of loss. Apex AutoTrader is a tool to assist trading, not a guarantee of profit. Past performance is not indicative of future results. You are solely responsible for all trading decisions and their financial consequences.',
  },
  {
    title: '3. Use of Service',
    body: 'You agree to use the service only for lawful purposes and in accordance with applicable financial regulations in your jurisdiction. You are responsible for ensuring that automated trading is legal in your country.',
  },
  {
    title: '4. Account Responsibility',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to immediately notify us of any unauthorized use of your account. We are not liable for losses resulting from unauthorized access.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'Apex AutoTrader shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to trading losses, data loss, or service interruptions.',
  },
  {
    title: '6. Service Availability',
    body: 'We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance, technical issues, or circumstances beyond our control may cause temporary unavailability.',
  },
  {
    title: '7. Governing Law',
    body: 'These Terms shall be governed by applicable law. Any disputes arising from these terms shall be resolved through binding arbitration.',
  },
]

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#518DC4' }}>
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">
              Apex <span style={{ color: '#518DC4' }}>AutoTrader</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#518DC4' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div
          className="rounded-2xl p-10 mb-12 text-white"
          style={{ background: 'linear-gradient(135deg, #518DC4 0%, #2d5e96 100%)' }}
        >
          <span className="text-blue-200 text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl font-bold mt-2 mb-3">Terms &amp; Conditions</h1>
          <p className="text-blue-100 text-lg">
            Please read these terms carefully before using our platform.
          </p>
          <p className="text-blue-200 text-sm mt-4">Last updated: January 2025</p>
        </div>

        {/* Risk Warning Banner */}
        <div className="mb-6 rounded-xl p-4 flex gap-3 items-start" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-orange-800 text-sm font-medium">
            <strong>Risk Warning:</strong> Trading involves substantial risk of loss and is not suitable for all investors. Only trade with money you can afford to lose.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-2xl p-8 text-center" style={{ backgroundColor: '#eef5fc', border: '1px solid #d5e8f7' }}>
          <h3 className="font-bold text-gray-900 mb-2">Questions about our terms?</h3>
          <p className="text-gray-500 text-sm mb-4">Reach out to our legal team for any clarifications.</p>
          <a
            href="mailto:legal@apexautotrader.com"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#518DC4' }}
          >
            legal@apexautotrader.com
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Apex AutoTrader. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-600">Privacy Policy</Link>
            <Link to="/terms" className="font-medium" style={{ color: '#518DC4' }}>Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
