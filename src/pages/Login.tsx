import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AboutCorruptX from "../components/AboutCorruptX";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Login Form - Left Side */}
          <div className="order-1 lg:order-1">
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-secondary rounded-2xl p-8 shadow-2xl card-hover">
                <h2 className="text-3xl font-bold text-center mb-8 text-white">
                  Login
                </h2>

                {error && (
                  <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-accent focus:outline-none text-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-accent focus:outline-none text-white"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 rounded-lg font-semibold text-lg"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-accent hover:underline"
                    >
                      Sign up
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
  );
};

export default LoginPage;
