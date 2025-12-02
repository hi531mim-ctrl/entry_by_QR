'use client'

import { useState, useEffect } from 'react'

interface EntryLogItem {
  id: string
  participantId: string
  name: string
  grade: string
  scanDateTime: string
}

export default function EntryLog() {
  const [entryLogs, setEntryLogs] = useState<EntryLogItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntryLogs = async () => {
    try {
      const response = await fetch('/api/admin/entry-log')
      const data = await response.json()
      setEntryLogs(data.entryLogs)
    } catch (error) {
      console.error('Failed to fetch entry logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = async () => {
    if (!confirm('入場ログをクリアしますか？この操作は元に戻せません。')) {
      return
    }

    try {
      const response = await fetch('/api/admin/entry-log', {
        method: 'DELETE',
      })

      if (response.ok) {
        setEntryLogs([])
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  useEffect(() => {
    fetchEntryLogs()
    const interval = setInterval(fetchEntryLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">入場ログ</h2>
      <p className="text-slate-500 mb-4 text-sm">本日の入場記録一覧です。</p>

      <div className="max-h-96 overflow-y-auto mb-4">
        {loading ? (
          <p className="text-center text-slate-500 py-8">読み込み中...</p>
        ) : entryLogs.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            まだ入場者がいません。
          </p>
        ) : (
          <div className="space-y-2">
            {entryLogs.map((log, index) => (
              <div
                key={log.id}
                className="p-3 border border-teal-500/30 rounded-lg bg-teal-500/10"
              >
                <div className="font-semibold text-slate-900">
                  {index + 1}. {log.name}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  学年: {log.grade} | 入場時刻:{' '}
                  {new Date(log.scanDateTime).toLocaleString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={clearLogs} className="btn btn-secondary w-full">
        ログをクリア
      </button>
    </div>
  )
}
