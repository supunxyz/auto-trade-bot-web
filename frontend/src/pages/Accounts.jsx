import React, { useEffect, useState } from 'react'
import { accounts } from '../api/client'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Server } from 'lucide-react'

function Accounts() {
  const [accountList, setAccountList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  // Form state
  const [form, setForm] = useState({
    broker_type: 'mt5',
    name: '',
    credentials: {},
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const { data } = await accounts.list()
      setAccountList(data)
    } catch (err) {
      setError('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editing) {
        await accounts.update(editing.id, form)
      } else {
        await accounts.create(form)
      }
      
      setShowAdd(false)
      setEditing(null)
      setForm({ broker_type: 'mt5', name: '', credentials: {} })
      loadAccounts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save account')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      await accounts.delete(id)
      loadAccounts()
    } catch (err) {
      setError('Failed to delete account')
    }
  }

  const handleTest = async (id) => {
    try {
      const { data } = await accounts.test(id)
      alert(data.message)
    } catch (err) {
      alert('Connection test failed')
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Broker Accounts</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {accountList.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No broker accounts configured</p>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary"
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accountList.map((account) => (
            <div key={account.id} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    {account.is_active ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {account.broker_type === 'mt5' ? 'MetaTrader 5' : 'Binance Futures'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTest(account.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Test connection"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(account)
                      setForm({
                        broker_type: account.broker_type,
                        name: account.name,
                        credentials: account.credentials || {},
                      })
                      setShowAdd(true)
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editing ? 'Edit Account' : 'Add Account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Broker Type
                </label>
                <select
                  value={form.broker_type}
                  onChange={(e) => setForm({ ...form, broker_type: e.target.value })}
                  className="w-full"
                  required
                >
                  <option value="mt5">MetaTrader 5</option>
                  <option value="binance">Binance Futures</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="My Trading Account"
                  className="w-full"
                  required
                />
              </div>

              {form.broker_type === 'mt5' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Login ID
                    </label>
                    <input
                      type="number"
                      value={form.credentials.login || ''}
                      onChange={(e) => setForm({
                        ...form,
                        credentials: { ...form.credentials, login: parseInt(e.target.value) }
                      })}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.credentials.password || ''}
                      onChange={(e) => setForm({
                        ...form,
                        credentials: { ...form.credentials, password: e.target.value }
                      })}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Server
                    </label>
                    <input
                      type="text"
                      value={form.credentials.server || ''}
                      onChange={(e) => setForm({
                        ...form,
                        credentials: { ...form.credentials, server: e.target.value }
                      })}
                      placeholder="Exness-MT5Real8"
                      className="w-full"
                      required
                    />
                  </div>
                </>
              )}

              {form.broker_type === 'binance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={form.credentials.api_key || ''}
                      onChange={(e) => setForm({
                        ...form,
                        credentials: { ...form.credentials, api_key: e.target.value }
                      })}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Secret
                    </label>
                    <input
                      type="password"
                      value={form.credentials.api_secret || ''}
                      onChange={(e) => setForm({
                        ...form,
                        credentials: { ...form.credentials, api_secret: e.target.value }
                      })}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.credentials.testnet || false}
                      onChange={(e) => setForm({
                        ...form,
                        credentials: { ...form.credentials, testnet: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Use Testnet</label>
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false)
                    setEditing(null)
                    setForm({ broker_type: 'mt5', name: '', credentials: {} })
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editing ? 'Update' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
