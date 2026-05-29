import React, { useEffect, useState } from 'react'
import { positions } from '../api/client'
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'

function Positions() {
  const [openPositions, setOpenPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadPositions()
    const interval = setInterval(loadPositions, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const loadPositions = async () => {
    try {
      const { data } = await positions.open()
      setOpenPositions(data.positions || [])
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to load positions:', err)
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Open Positions</h1>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadPositions}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {openPositions.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border text-center">
          <p className="text-gray-500">No open positions</p>
          <p className="text-sm text-gray-400 mt-2">
            Positions will appear here when auto-trading places trades
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Symbol</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Side</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Volume</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Entry Price</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Stop Loss</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Take Profit</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Open Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {openPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{pos.symbol}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                        pos.side === 'BUY' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {pos.side === 'BUY' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{pos.side}</span>
                      </span>
                    </td>
                    <td className="p-4">{pos.volume}</td>
                    <td className="p-4">{pos.entry_price?.toFixed(5)}</td>
                    <td className="p-4 text-red-600">{pos.stop_loss?.toFixed(5) || '-'}</td>
                    <td className="p-4 text-green-600">{pos.take_profit?.toFixed(5) || '-'}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(pos.opened_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Positions
