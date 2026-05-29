import React, { useEffect, useState } from 'react'
import { positions } from '../api/client'
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react'

function History() {
  const [trades, setTrades] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadHistory()
    loadStats()
  }, [days])

  const loadHistory = async () => {
    try {
      const { data } = await positions.history({ limit: 50, offset: page * 50 })
      setTrades(data.trades || [])
      setHasMore(data.trades?.length === 50)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await positions.stats(days)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500">Total Trades</p>
            <p className="text-2xl font-bold">{stats.total_trades}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500">Win Rate</p>
            <p className="text-2xl font-bold">{stats.win_rate?.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500">Win/Loss</p>
            <p className="text-2xl font-bold">
              {stats.winning_trades} / {stats.losing_trades}
            </p>
          </div>
          <div className={`p-4 rounded-xl border shadow-sm ${totalPnl >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-gray-500">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ${totalPnl.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Trades Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Symbol</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Side</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Volume</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Entry</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Exit</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(trade.closed_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium">{trade.symbol}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                      trade.side === 'BUY' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.side === 'BUY' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span>{trade.side}</span>
                    </span>
                  </td>
                  <td className="p-4">{trade.volume}</td>
                  <td className="p-4">{trade.entry_price?.toFixed(5)}</td>
                  <td className="p-4">{trade.exit_price?.toFixed(5)}</td>
                  <td className={`p-4 font-semibold ${
                    trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trades.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No trades in selected period
          </div>
        )}

        {/* Pagination */}
        {trades.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page + 1}</span>
            <button
              onClick={() => hasMore && setPage(page + 1)}
              disabled={!hasMore}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
