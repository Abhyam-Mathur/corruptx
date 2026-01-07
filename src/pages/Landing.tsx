import { Link } from 'react-router-dom'
import { useAuth } from '../App'

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          <span className="text-accent">CORRUPT</span><span className="text-white">X</span>
        </h1>
        <p className="text-xl md:text-2xl text-secondary-foreground mb-12">
          Expose corruption. Empower transparency.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="btn-primary px-8 py-3 rounded-lg font-semibold text-lg">
            Login
          </Link>
          <Link to="/signup" className="bg-secondary hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
            Sign Up
          </Link>
        </div>
        
        {user && (
          <div className="mt-8">
            <Link to="/dashboard" className="text-accent hover:underline">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage
