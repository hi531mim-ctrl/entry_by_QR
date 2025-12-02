'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EntryScan from '@/components/admin/EntryScan'
import EntryLog from '@/components/admin/EntryLog'
import Stats from '@/components/admin/Stats'

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('entry-scan')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsLoggedIn(true)
        setPassword('')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPassword('')
    setError('')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-semibold text-center mb-6">
            管理者ログイン
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="form-control mb-4 text-base"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <div className="text-red-500 text-sm text-center mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 btn btn-primary"
                disabled={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
              <button
                type="button"
                className="flex-1 btn btn-secondary"
                onClick={() => router.push('/')}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">👨‍💼 管理者ダッシュボード</h1>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            ログアウト
          </button>
        </div>

        <div className="flex gap-3 mb-6 border-b border-brown-600/20 pb-3 overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'entry-scan'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('entry-scan')}
          >
            📱 入場スキャン
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'entry-log'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('entry-log')}
          >
            📊 入場ログ
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            📈 統計
          </button>
        </div>

        {activeTab === 'entry-scan' && <EntryScan />}
        {activeTab === 'entry-log' && <EntryLog />}
        {activeTab === 'stats' && <Stats />}
      </div>
    </div>
  )
}
