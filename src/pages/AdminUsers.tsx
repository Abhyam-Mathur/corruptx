import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../App'

interface UserProfile {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at?: string
}

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = (user: UserProfile, role: 'user' | 'admin') => {
    setSelectedUser(user)
    setNewRole(role)
    setShowConfirmModal(true)
  }

  const confirmRoleChange = async () => {
    if (!selectedUser) return

    setUpdating(selectedUser.id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id)

      if (error) throw error

      // Refresh the user list
      await fetchUsers()

      // Show success message
      alert(`Successfully ${newRole === 'admin' ? 'promoted' : 'demoted'} user ${selectedUser.email}`)
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update user role. Please try again.')
    } finally {
      setUpdating(null)
      setShowConfirmModal(false)
      setSelectedUser(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
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
          <div className="text-cyber-blue">Loading users...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage user roles and permissions</p>
        </div>

        <div className="bg-secondary/50 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                          : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {user.id === currentUser?.id ? (
                        <span className="text-xs text-gray-500 italic">Current user</span>
                      ) : (
                        <div className="flex gap-2">
                          {user.role === 'user' ? (
                            <button
                              onClick={() => handleRoleChange(user, 'admin')}
                              disabled={updating === user.id}
                              className="btn-primary px-3 py-1 text-xs font-medium hover:bg-cyber-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating === user.id ? 'Updating...' : 'Make Admin'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user, 'user')}
                              disabled={updating === user.id}
                              className="btn-secondary px-3 py-1 text-xs font-medium hover:border-red-400/50 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating === user.id ? 'Updating...' : 'Remove Admin'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-secondary border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Role Change</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to {newRole === 'admin' ? 'promote' : 'demote'} <strong>{selectedUser.email}</strong> to <strong>{newRole}</strong>?
              {newRole === 'admin' && (
                <span className="block mt-2 text-cyber-blue font-semibold">
                  This will give them full administrative access to the system.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="btn-primary px-4 py-2 text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsersPage