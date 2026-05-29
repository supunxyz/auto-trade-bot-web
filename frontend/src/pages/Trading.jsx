import React, { useEffect, useState } from 'react'
import { trading } from '../api/client'
import { Play, Square, Settings, AlertCircle, Clock } from 'lucide-react'

function Trading() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  // Settings form
  const [settings, setSettings] = useState({
    enabled: false,
    forex_pairs: ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X'],
    crypto_pairs: ['BTCUSDT', 'ETHUSDT'],
    risk_per_trade: 1.0,
    rr_ratio: 2.0,
  })

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const { data } = await trading.status()
      setStatus(data)
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to load status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    setActionLoading(true)
    setError('')

    try {
      await trading.start(settings)
      loadStatus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start trading')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStop = async () => {
    setActionLoading(true)
    setError('')

    try {
      await trading.stop()
      loadStatus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to stop trading')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      await trading.updateSettings(settings)
      setError('')
      alert('Settings saved')
    } catch (err) {
      setError('Failed to update settings')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const isRunning = status?.forex_running || status?.crypto_running

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Auto-Trading Control</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Trading Status</h2>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isRunning ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="font-medium">{isRunning ? 'Running' : 'Stopped'}</span>
              </div>
              {status?.next_forex_run && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Next Forex scan: {new Date(status.next_forex_run).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleStart}
              disabled={isRunning || actionLoading}
              className="btn-success flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>Start</span>
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning || actionLoading}
              className="btn-danger flex items-center space-x-2 disabled:opacity-50"
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Trading Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forex Pairs (comma-separated)
            </label>
            <input
              type="text"
              value={settings.forex_pairs.join(', ')}
              onChange={(e) => setSettings({
                ...settings,
                forex_pairs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full"
              placeholder="EURUSD=X, GBPUSD=X, USDJPY=X"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crypto Pairs (comma-separated)
            </label>
            <input
              type="text"
              value={settings.crypto_pairs.join(', ')}
              onChange={(e) => setSettings({
                ...settings,
                crypto_pairs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full"
              placeholder="BTCUSDT, ETHUSDT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={settings.risk_per_trade}
              onChange={(e) => setSettings({ ...settings, risk_per_trade: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk:Reward Ratio
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={settings.rr_ratio}
              onChange={(e) => setSettings({ ...settings, rr_ratio: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleUpdateSettings}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Forex signals generated every 5 minutes</li>
              <li>Crypto signals generated every 2 minutes</li>
              <li>Trades execute automatically when confidence &gt; 65%</li>
              <li>Basket profit targets trigger auto-close</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading
