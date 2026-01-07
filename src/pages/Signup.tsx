import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!email || !username || !password) {
      setError('Please fill in all fields')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('corruptx_users') || '[]')
    const userExists = storedUsers.some((u: any) => u.username === username || u.email === email)
    
    if (userExists) {
      setError('Username or email already exists')
      return
    }
    
    // Create new user
    const newUser = { email, username, password }
    storedUsers.push(newUser)
    localStorage.setItem('corruptx_users', JSON.stringify(storedUsers))
    
    // Auto-login
    login(username, email)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-secondary rounded-2xl p-8 shadow-2xl card-hover">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Sign Up</h2>
          
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-accent focus:outline-none text-white"
                placeholder="Choose a username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-accent focus:outline-none text-white"
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              className="w-full btn-primary py-3 rounded-lg font-semibold text-lg"
            >
              Create Account
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
