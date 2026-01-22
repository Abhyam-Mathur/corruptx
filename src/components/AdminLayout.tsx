import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../App'

const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/uploads', label: 'Uploads', icon: '📁' },
    { path: '/admin/campaigns', label: 'Campaigns', icon: '🎯' },
    { path: '/admin/campaign-requests', label: 'Requests', icon: '📝' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/reporters', label: 'Reporters', icon: '🔍' },
  ]

  return (
    <aside className="w-64 bg-primary/80 backdrop-blur-xl p-6 min-h-screen border-r border-white/10">
      <div className="mb-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyber-blue to-accent bg-clip-text text-transparent">
          Admin Portal
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent mt-2"></div>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 ${
              location.pathname === item.path
                ? 'active bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

const Header = ({ onLogout }: { onLogout: () => void }) => (
  <header className="flex items-center justify-between p-6 bg-primary/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-white">CorruptX Admin</h1>
      <div className="h-6 w-px bg-white/20"></div>
      <span className="text-cyber-blue text-sm font-medium">Secure Dashboard</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
        System Online
      </div>
      <button
        onClick={onLogout}
        className="btn-secondary px-4 py-2 text-sm font-medium hover:border-red-400/50 hover:text-red-400 transition-colors"
      >
        Logout
      </button>
    </div>
  </header>
)

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary via-primary to-secondary text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onLogout={handleLogout} />
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
