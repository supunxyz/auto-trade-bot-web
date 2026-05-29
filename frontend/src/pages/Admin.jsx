import React, { useEffect, useState } from 'react'
import { admin } from '../api/client'
import { Users, DollarSign, Shield, Ban, CheckCircle } from 'lucide-react'

function Admin() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        admin.users(),
        admin.stats()
      ])
      setUsers(usersRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId) => {
    if (!confirm('Suspend this user?')) return
    try {
      await admin.suspend(userId)
      loadData()
    } catch (err) {
      alert('Failed to suspend user')
    }
  }

  const handleActivate = async (userId) => {
    try {
      await admin.activate(userId)
      loadData()
    } catch (err) {
      alert('Failed to activate user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.total_users}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">{stats.active_users}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Accounts</p>
                <p className="text-2xl font-bold">{stats.total_accounts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Platform P&L</p>
                <p className="text-2xl font-bold">${stats.total_pnl?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Accounts</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                      user.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">{user.account_count}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="text-green-600 hover:text-green-700 text-sm flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
              <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
              <p><span className="font-medium">Status:</span> {selectedUser.is_active ? 'Active' : 'Suspended'}</p>
              <p><span className="font-medium">Joined:</span> {new Date(selectedUser.created_at).toLocaleString()}</p>
              <p><span className="font-medium">Accounts:</span> {selectedUser.account_count}</p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
