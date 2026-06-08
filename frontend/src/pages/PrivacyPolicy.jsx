import React from 'react'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly, including your name, email address, and broker credentials encrypted at rest. We also collect usage data such as trade history and platform interactions to improve the service.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used solely to provide and improve the Apex AutoTrader service. We do not sell, trade, or otherwise transfer your personal information to outside parties. Broker credentials are used exclusively to execute trades on your behalf.',
  },
  {
    title: '3. Data Security',
    body: 'We implement industry-standard security measures including AES-256 encryption for stored credentials, TLS for data in transit, and regular security audits. However, no method of transmission over the Internet is 100% secure.',
  },
  {
    title: '4. Third-Party Services',
    body: 'Our platform integrates with MetaTrader 5 and Binance. Your use of these platforms is governed by their respective privacy policies. We are not responsible for the privacy practices of these third parties.',
  },
  {
    title: '5. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@apexautotrader.com. We will respond within 30 days.',
  },
  {
    title: '6. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on our platform. Last updated: January 2025.',
  },
]

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mt-2 mb-3">Privacy Policy</h1>
          <p className="text-blue-100 text-lg">
            How we collect, use, and protect your personal information.
          </p>
          <p className="text-blue-200 text-sm mt-4">Last updated: January 2025</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ color: '#1f2937' }}>
                {s.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-2xl p-8 text-center" style={{ backgroundColor: '#eef5fc', border: '1px solid #d5e8f7' }}>
          <h3 className="font-bold text-gray-900 mb-2">Have questions about your privacy?</h3>
          <p className="text-gray-500 text-sm mb-4">Contact our privacy team and we'll respond within 30 days.</p>
          <a
            href="mailto:privacy@apexautotrader.com"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#518DC4' }}
          >
            privacy@apexautotrader.com
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Apex AutoTrader. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="font-medium" style={{ color: '#518DC4' }}>Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-600">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
