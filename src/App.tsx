import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";


import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import DashboardPage from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import AdminPage from "./pages/Admin";
import AdminUploadsPage from "./pages/AdminUploads";
import AdminCampaigns from "./pages/AdminCampaigns";
import AdminCampaignRequests from "./pages/AdminCampaignRequests";
import AdminUsers from "./pages/AdminUsers";
import AdminHeatmapPage from "./pages/AdminHeatmap";
import AdminReportersPage from "./pages/AdminReporters";
import EmailVerificationNotice from "./pages/EmailVerificationNotice";
import { AdminProtectedRoute, UserProtectedRoute, ReporterProtectedRoute } from "./components/ProtectedRoutes";
import JoinReporterPage from "./pages/JoinReporter";
import ReporterDashboardPage from "./pages/ReporterDashboard";

/* =========================
   AUTH CONTEXT
========================= */

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: string | null; // 'user' | 'admin' | null
  roleLoading: boolean;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const fetchRole = async (uid: string | undefined) => {
    setRoleLoading(true)
    if (!uid) {
      setRole(null);
      setRoleLoading(false)
      return;
    }
    try {
      console.log('Fetching role for user id:', uid)
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single();

      if (error) {
        console.warn('Role fetch returned error, defaulting to user', error)
        setRole('user');
      } else {
        const fetched = (data as any)?.role ?? 'user'
        console.log('Fetched role:', fetched)
        setRole(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch role, defaulting to user', err)
      setRole('user');
    }
    setRoleLoading(false)
  };

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const u = data.session?.user ?? null
        if (!mounted) return
        setUser(u)
        if (!u) setRoleLoading(false)
      } catch (err) {
        console.error('Error during auth init', err)
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Listen for login / logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      // role will be fetched by effect watching `user`
      if (!u) {
        setRole(null)
        setRoleLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []);

  // Fetch role only when `user` becomes available
  useEffect(() => {
    if (!user) {
      setRole(null)
      setRoleLoading(false)
      return
    }

    // fetchRole controls roleLoading
    fetchRole(user.id)
  }, [user])

  // Debug logs for verification
  useEffect(() => {
    console.log('User:', user?.email)
    console.log('Role:', role)
    console.log('roleLoading:', roleLoading)
  }, [user, role, roleLoading])

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshRole = async () => {
    setRole(null)
    await fetchRole(user?.id)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, role, roleLoading, logout, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};

/* (Legacy PrivateRoute removed — use UserProtectedRoute and AdminProtectedRoute) */

/* =========================
   APP
========================= */

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen gradient-bg">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/join-reporter"
              element={
                <UserProtectedRoute>
                  <JoinReporterPage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/reporter"
              element={
                <ReporterProtectedRoute>
                  <ReporterDashboardPage />
                </ReporterProtectedRoute>
              }
            />
            <Route path="/verify-email" element={<EmailVerificationNotice />} />
            <Route
              path="/dashboard"
              element={
                <UserProtectedRoute>
                  <DashboardPage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/uploads"
              element={
                <AdminProtectedRoute>
                  <AdminUploadsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <AdminProtectedRoute>
                  <AdminCampaigns />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/campaign-requests"
              element={
                <AdminProtectedRoute>
                  <AdminCampaignRequests />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/reporters"
              element={
                <AdminProtectedRoute>
                  <AdminReportersPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/heatmap"
              element={
                <AdminProtectedRoute>
                  <AdminHeatmapPage />
                </AdminProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
