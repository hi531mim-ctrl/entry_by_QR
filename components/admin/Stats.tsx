'use client'

import { useState, useEffect } from 'react'

interface StatsData {
  totalRegistered: number
  totalEntered: number
  rate: number
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData>({
    totalRegistered: 0,
    totalEntered: 0,
    rate: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="card">
        <p className="text-center text-slate-500 py-8">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">統計</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-teal-500/10 p-4 rounded-lg">
          <p className="text-sm text-slate-500 mb-2">総登録者数</p>
          <p className="text-3xl font-bold text-teal-500">
            {stats.totalRegistered}
          </p>
        </div>

        <div className="bg-blue-500/10 p-4 rounded-lg">
          <p className="text-sm text-slate-500 mb-2">本日入場者数</p>
          <p className="text-3xl font-bold text-blue-500">
            {stats.totalEntered}
          </p>
        </div>
      </div>

      <div className="bg-orange-500/10 p-4 rounded-lg mb-6">
        <p className="text-sm text-slate-500 mb-2">入場率</p>
        <p className="text-2xl font-bold text-orange-500">{stats.rate}%</p>
      </div>

      <button onClick={handleExport} className="btn btn-secondary w-full">
        📥 CSVエクスポート
      </button>
    </div>
  )
}
