import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Disclaimer from "../components/Disclaimer";
import AboutCorruptX from "../components/AboutCorruptX";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [checkboxAccepted, setCheckboxAccepted] = useState(false);

  const navigate = useNavigate();

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!checkboxAccepted) {
      setError("You must accept the disclaimer to create an account");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Store disclaimer acceptance in profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          disclaimer_accepted: true,
          disclaimer_accepted_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Failed to store disclaimer acceptance:', profileError);
        // Don't block signup if profile update fails, but log it
      }
    }

    setLoading(false);
    
    // Redirect to email verification notice page
    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <>
      <Disclaimer
        isOpen={showDisclaimer}
        onClose={() => navigate("/")}
        onAccept={handleDisclaimerAccept}
      />

      {!disclaimerAccepted ? (
        <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md text-center">
            <div className="card-hover p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Welcome to CorruptX
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent my-4"></div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Before you can create an account, you must read and accept our legal disclaimer to ensure compliance and protect all users.
              </p>
              <button
                onClick={() => setShowDisclaimer(true)}
                className="w-full btn-primary py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
              >
                <span>📋</span>
                Read & Accept Disclaimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 animate-slide-up">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Signup Form - Left Side */}
              <div className="order-1 lg:order-1">
                <div className="w-full max-w-md mx-auto lg:mx-0">
                  <div className="card-hover p-8">
                    <div className="text-center mb-8">
                      <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">👤</span>
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        Create Account
                      </h2>
                      <p className="text-gray-400 text-sm">Join the fight against corruption</p>
                    </div>

                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6 error-shake flex items-center gap-3">
                        <span className="text-red-400">⚠️</span>
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* EMAIL */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
                        >
                          <span>📧</span>
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyber-blue/50 transition-all duration-300"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      {/* PASSWORD */}
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
                        >
                          <span>🔐</span>
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyber-blue/50 transition-all duration-300"
                          placeholder="Create a secure password"
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                      </div>

                      {/* DISCLAIMER CHECKBOX */}
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <input
                            id="disclaimer-checkbox"
                            type="checkbox"
                            checked={checkboxAccepted}
                            onChange={(e) => setCheckboxAccepted(e.target.checked)}
                            className="mt-1 h-4 w-4 accent-cyber-blue rounded focus:ring-cyber-blue/50"
                            required
                          />
                          <label
                            htmlFor="disclaimer-checkbox"
                            className="text-sm text-gray-300 leading-relaxed cursor-pointer"
                          >
                            I have read and agree to the{" "}
                            <button
                              type="button"
                              onClick={() => setShowDisclaimer(true)}
                              className="animated-link text-cyber-blue hover:text-cyber-blue/80 font-medium"
                            >
                              Disclaimer
                            </button>{" "}
                            and understand the terms of use.
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !checkboxAccepted}
                        className="w-full btn-primary py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <div className="spinner w-5 h-5"></div>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <span>🚀</span>
                            Create Account
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-gray-400">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="animated-link text-accent hover:text-accent/80 font-medium"
                        >
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About CorruptX - Right Side */}
              <div className="order-2 lg:order-2">
                <AboutCorruptX />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignupPage;
