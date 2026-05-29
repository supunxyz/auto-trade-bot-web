import React, { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { positions } from '../api/client'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  BarChart3
} from 'lucide-react'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await positions.stats(30)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
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
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total P&L (30d)"
          value={`$${stats?.total_pnl?.toFixed(2) || '0.00'}`}
          change={stats?.total_pnl > 0 ? '+12%' : '-5%'}
          changeType={stats?.total_pnl >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
        <StatCard
          title="Win Rate"
          value={`${stats?.win_rate?.toFixed(1) || 0}%`}
          change={`${stats?.winning_trades || 0} wins / ${stats?.losing_trades || 0} losses`}
          changeType="neutral"
          icon={BarChart3}
        />
        <StatCard
          title="Total Trades"
          value={stats?.total_trades || 0}
          change="Last 30 days"
          changeType="neutral"
          icon={Activity}
        />
        <StatCard
          title="Open Positions"
          value={stats?.current_open || 0}
          change="Currently active"
          changeType={stats?.current_open > 0 ? 'positive' : 'neutral'}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats?.by_symbol?.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.pnl >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">{item.symbol}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${item.pnl.toFixed(2)}
                  </span>
                  <p className="text-sm text-gray-500">{item.trades} trades</p>
                </div>
              </div>
            ))}
            {(!stats?.by_symbol || stats.by_symbol.length === 0) && (
              <p className="text-gray-500 text-center py-8">No trading activity yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a 
              href="/trading" 
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <PlayCircle className="w-8 h-8 text-primary-600 mr-4" />
              <div>
                <p className="font-medium text-primary-900">Start Auto-Trading</p>
                <p className="text-sm text-primary-700">Configure and run your trading bot</p>
              </div>
            </a>
            <a 
              href="/accounts" 
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Wallet className="w-8 h-8 text-gray-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Manage Accounts</p>
                <p className="text-sm text-gray-600">Add or edit broker connections</p>
              </div>
            </a>
            <a 
              href="/positions" 
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <List className="w-8 h-8 text-gray-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">View Positions</p>
                <p className="text-sm text-gray-600">Monitor open trades</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Import icons for quick actions
import { PlayCircle, Wallet, List } from 'lucide-react'

export default Dashboard
