import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const LandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleReportCorruption = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-accent">CORRUPT</span><span className="text-white">X</span>
              </h1>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-accent hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/90"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            CorruptX – because corruption is eating our society alive.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            A citizen journalism platform empowering you to expose corruption anonymously and make a real difference in fighting systemic corruption.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleReportCorruption}
              className="bg-accent hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Report Corruption
            </button>
          </div>
        </div>
      </section>

      {/* What We're Fighting Against */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            What We're Fighting Against
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Financial Corruption */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 bg-gradient-to-br from-red-900/50 to-black/50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Financial Corruption</h3>
                    <p className="text-gray-400 text-sm">Exposing embezzlement and financial misconduct</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Leaks */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 bg-gradient-to-br from-red-900/50 to-black/50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Document Leaks</h3>
                    <p className="text-gray-400 text-sm">Revealing hidden documents and evidence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bureaucratic Abuse */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 bg-gradient-to-br from-red-900/50 to-black/50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Bureaucratic Abuse</h3>
                    <p className="text-gray-400 text-sm">Fighting against power abuse and injustice</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Backroom Deals */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 bg-gradient-to-br from-red-900/50 to-black/50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Backroom Deals</h3>
                    <p className="text-gray-400 text-sm">Uncovering secret agreements and corruption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Our Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Protected Anonymity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-4">Protected Anonymity</h3>
              <p className="text-gray-400 text-center">
                Your identity is completely protected. Report corruption without fear of retaliation.
              </p>
            </div>

            {/* Citizen Power */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-4">Citizen Power</h3>
              <p className="text-gray-400 text-center">
                Empower citizens to hold corrupt officials and institutions accountable.
              </p>
            </div>

            {/* Evidence-Based Reporting */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-4">Evidence-Based Reporting</h3>
              <p className="text-gray-400 text-center">
                All reports are backed by verifiable evidence and thorough documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight Quote Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="border-l-4 border-accent pl-8 py-8">
            <blockquote className="text-2xl md:text-3xl font-medium text-white italic mb-4">
              "Every image tells a story of corruption that needs to be exposed. Every document reveals a truth that must be told."
            </blockquote>
            <cite className="text-gray-400 text-lg">— CorruptX Mission Statement</cite>
          </div>
        </div>
      </section>

      {/* Support Our Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Support Our Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* UPI Payment */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">UPI Payment</h3>
              <p className="text-gray-400 mb-6">
                Support us through UPI for instant donations to keep our platform running.
              </p>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300">UPI ID: corruptx@upi</p>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Bank Transfer</h3>
              <p className="text-gray-400 mb-6">
                Make a direct bank transfer to support our anti-corruption efforts.
              </p>
              <div className="bg-gray-700 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-300">Account: CorruptX Foundation</p>
                <p className="text-sm text-gray-300">IFSC: CORR0001234</p>
                <p className="text-sm text-gray-300">Account No: 1234567890</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                <span className="text-accent">CORRUPT</span><span className="text-white">X</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A citizen journalism platform dedicated to exposing corruption and empowering transparency.
                Join us in the fight against systemic corruption.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#mission" className="text-gray-400 hover:text-white transition-colors text-sm">Our Mission</a></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Report Corruption</Link></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Social Icons */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 CorruptX. Fighting corruption one report at a time.
            </p>
          </div>
        </div>
      </footer>

      {/* Conditional Dashboard Link for Logged-in Users */}
      {user && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            to="/dashboard"
            className="bg-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}

export default LandingPage
