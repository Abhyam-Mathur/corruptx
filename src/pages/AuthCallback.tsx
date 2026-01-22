import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from email verification
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login");
          return;
        }

        if (data.session) {
          // Successfully verified and logged in
          navigate("/dashboard");
        } else {
          // No session, redirect to login
          navigate("/login");
        }
      } catch (err) {
        console.error("Failed to handle auth callback:", err);
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔄</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Verifying your email...</h2>
        <p className="text-gray-300">Please wait while we confirm your email verification.</p>
      </div>
    </div>
  );
};

export default AuthCallback;