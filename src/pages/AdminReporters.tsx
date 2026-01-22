import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import AdminLayout from '../components/AdminLayout'

interface Reporter {
  id: string
  name: string
  age: number
  gender: string
  latitude: number
  longitude: number
  radius_km: number
  is_active: boolean
  user_id: string
  created_at: string
  profiles?: {
    email?: string
  } | null
  reporter_assignments?: Array<{
    id: string
    status: string
  }>
}

const AdminReportersPage = () => {
  const [reporters, setReporters] = useState<Reporter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchReporters = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reporters')
        .select(`
          id,
          name,
          age,
          gender,
          latitude,
          longitude,
          radius_km,
          is_active,
          user_id,
          created_at,
          reporter_assignments (
            id,
            status
          ),
          profiles (
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReporters(data as Reporter[] || [])
    } catch (error) {
      console.error('Error fetching reporters:', error)
      setReporters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReporters()
  }, [])

  const getAssignmentStats = (assignments?: Array<{ status: string }>) => {
    if (!assignments) return { total: 0, accepted: 0, verified: 0 }
    
    const total = assignments.length
    const accepted = assignments.filter(a => a.status === 'accepted' || a.status === 'verified').length
    const verified = assignments.filter(a => a.status === 'verified').length
    
    return { total, accepted, verified }
  }

  const toggleReporterStatus = async (reporterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reporters')
        .update({ is_active: !currentStatus })
        .eq('id', reporterId)

      if (error) throw error

      await fetchReporters()
    } catch (error) {
      console.error('Error updating reporter status:', error)
      alert('Failed to update reporter status')
    }
  }

  const filteredReporters = reporters.filter(reporter => {
    const searchLower = searchTerm.toLowerCase()
    return (
      reporter.name.toLowerCase().includes(searchLower) ||
      reporter.profiles?.email?.toLowerCase().includes(searchLower) ||
      reporter.gender.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-cyber-blue">Loading reporters...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Reporter Management</h1>
          <p className="text-gray-400">View and manage registered reporters</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-secondary/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/50 backdrop-blur-xl rounded-lg border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Reporters</div>
            <div className="text-2xl font-bold text-white">{reporters.length}</div>
          </div>
          <div className="bg-secondary/50 backdrop-blur-xl rounded-lg border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Active</div>
            <div className="text-2xl font-bold text-cyber-green">
              {reporters.filter(r => r.is_active).length}
            </div>
          </div>
          <div className="bg-secondary/50 backdrop-blur-xl rounded-lg border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Inactive</div>
            <div className="text-2xl font-bold text-gray-500">
              {reporters.filter(r => !r.is_active).length}
            </div>
          </div>
          <div className="bg-secondary/50 backdrop-blur-xl rounded-lg border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Assignments</div>
            <div className="text-2xl font-bold text-accent">
              {reporters.reduce((sum, r) => sum + (r.reporter_assignments?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Reporters Table */}
        <div className="bg-secondary/50 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/30">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Age</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Gender</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Radius</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Assignments</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredReporters.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No reporters found matching your search' : 'No reporters registered yet'}
                    </td>
                  </tr>
                ) : (
                  filteredReporters.map((reporter) => {
                    const stats = getAssignmentStats(reporter.reporter_assignments)
                    return (
                      <tr key={reporter.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 text-sm text-white font-medium">{reporter.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-400">
                          {reporter.profiles?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400">{reporter.age}</td>
                        <td className="px-4 py-4 text-sm text-gray-400">{reporter.gender}</td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {reporter.latitude.toFixed(4)}, {reporter.longitude.toFixed(4)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400">{reporter.radius_km} km</td>
                        <td className="px-4 py-4">
                          <div className="text-xs space-y-1">
                            <div className="text-white">Total: {stats.total}</div>
                            <div className="text-cyber-green">Accepted: {stats.accepted}</div>
                            <div className="text-accent">Verified: {stats.verified}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reporter.is_active
                              ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                          }`}>
                            {reporter.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400">
                          {formatDate(reporter.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleReporterStatus(reporter.id, reporter.is_active)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                              reporter.is_active
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                : 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/30'
                            }`}
                          >
                            {reporter.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminReportersPage
