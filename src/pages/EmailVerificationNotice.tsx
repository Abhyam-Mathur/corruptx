import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const EmailVerificationNotice = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      // Store in localStorage so it persists on refresh
      localStorage.setItem("pendingVerificationEmail", emailParam);
    } else {
      // Try to get from localStorage if page is refreshed
      const storedEmail = localStorage.getItem("pendingVerificationEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [searchParams]);

  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Deep charcoal gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F14] via-[#121826] to-[#1a1a2e]"></div>
      
      {/* Subtle pattern overlay with cyber glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Language selector - top left */}
      <div className="absolute top-6 left-6 z-10">
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl shadow-lg border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 text-gray-300 text-sm font-medium group">
          <svg className="w-4 h-4 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="group-hover:text-white transition-colors">English</span>
        </button>
      </div>

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left side - Main content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-[#E5E7EB] leading-tight">
                Confirm your email
              </h1>
              
              <p className="text-lg lg:text-xl text-[#9CA3AF] leading-relaxed max-w-xl">
                To continue signing up, click the link that we emailed to{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  {email || "your email address"}
                </span>
              </p>
            </div>

            {/* Open Gmail button */}
            <div>
              <button
                onClick={handleOpenGmail}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-800/60 transition-all duration-300 transform hover:scale-105 border border-indigo-500/20"
                style={{
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 8px 16px rgba(0, 0, 0, 0.4)'
                }}
              >
                <span className="text-lg">Open Gmail</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>

            {/* Additional helpful text */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-[#9CA3AF]">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>

          {/* Right side - Decorative card grid */}
          <div className="hidden lg:block">
            <div className="relative h-[600px]">
              {/* Decorative cards with tilt and depth effect */}
              <div className="absolute inset-0 grid grid-cols-2 gap-4 transform perspective-1000">
                
                {/* Card 1 */}
                <div className="space-y-4 transform translate-y-8" style={{ transformStyle: 'preserve-3d' }}>
                  <div className="bg-[#1A1F2B]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 h-48 transform hover:rotate-2 transition-transform duration-300 border border-white/5" style={{ transform: 'rotateY(-5deg)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
                    <div className="h-full bg-gradient-to-br from-purple-900/40 to-purple-600/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-500/20">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/30 rounded-full mx-auto mb-3 shadow-lg shadow-purple-500/50"></div>
                        <div className="h-2 bg-purple-400/40 rounded w-24 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1A1F2B]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 h-56 transform hover:rotate-2 transition-transform duration-300 border border-white/5" style={{ transform: 'rotateY(-5deg)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
                    <div className="h-full bg-gradient-to-br from-cyan-900/40 to-cyan-600/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-cyan-500/20">
                      <div className="text-center space-y-2">
                        <div className="h-3 bg-cyan-400/40 rounded w-32 mx-auto"></div>
                        <div className="h-3 bg-cyan-400/40 rounded w-24 mx-auto"></div>
                        <div className="h-3 bg-cyan-400/40 rounded w-28 mx-auto mt-4"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="space-y-4 transform -translate-y-8" style={{ transformStyle: 'preserve-3d' }}>
                  <div className="bg-[#1A1F2B]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 h-56 transform hover:rotate-2 transition-transform duration-300 border border-white/5" style={{ transform: 'rotateY(5deg)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
                    <div className="h-full bg-gradient-to-br from-pink-900/40 to-pink-600/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-pink-500/20">
                      <div className="text-center space-y-3">
                        <div className="w-20 h-20 bg-pink-500/30 rounded-xl mx-auto shadow-lg shadow-pink-500/50"></div>
                        <div className="h-2 bg-pink-400/40 rounded w-28 mx-auto"></div>
                        <div className="h-2 bg-pink-400/40 rounded w-20 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1A1F2B]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 h-48 transform hover:rotate-2 transition-transform duration-300 border border-white/5" style={{ transform: 'rotateY(5deg)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
                    <div className="h-full bg-gradient-to-br from-emerald-900/40 to-emerald-600/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
                      <div className="text-center">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="w-12 h-12 bg-emerald-500/30 rounded-lg shadow-lg shadow-emerald-500/50"></div>
                          <div className="w-12 h-12 bg-emerald-500/30 rounded-lg shadow-lg shadow-emerald-500/50"></div>
                        </div>
                        <div className="h-2 bg-emerald-400/40 rounded w-20 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile decorative elements */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default EmailVerificationNotice;
