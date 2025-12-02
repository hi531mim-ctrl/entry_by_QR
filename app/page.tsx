'use client'

import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    notes: '',
  })
  const [showQR, setShowQR] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const response = await fetch('/api/participants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Generated ID:', data.participant.id)
        const qrUrl = await QRCode.toDataURL(data.participant.id, {
          width: 300,
          margin: 2,
        })
        setQrCodeUrl(qrUrl)
        setParticipantId(data.participant.id)
        setShowQR(true)

        // デバッグ：QRコードの内容を確認
        alert(`生成されたID: ${data.participant.id}`)
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '登録に失敗しました', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', grade: '', notes: '' })
    setShowQR(false)
    setQrCodeUrl('')
    setParticipantId('')
    setMessage({ text: '', type: '' })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=500')
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>QRコード</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 20px; }
            img { max-width: 300px; }
            p { font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>イベント参加QRコード</h2>
          <img src="${qrCodeUrl}" alt="QRコード">
          <p>ID: ${participantId}</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">このQRコードをイベント当日に提示してください</p>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (showQR) {
    return (
      <div className="min-h-screen bg-cream-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-semibold text-center mb-4">
              ✅ 登録が完了しました
            </h2>
            <p className="text-center text-slate-500 mb-6">
              以下のQRコードを保存してください。イベント当日に必要です。
            </p>
            <div className="bg-teal-500/10 p-6 rounded-lg text-center mb-6">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto border-2 border-brown-600/20 rounded-lg p-2 bg-white"
              />
            </div>
            <p className="text-center text-sm text-slate-500 mb-6">
              ID: <span className="font-bold">{participantId}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 btn btn-primary text-lg py-3"
              >
                🖨️ 印刷する
              </button>
              <button
                onClick={handleReset}
                className="flex-1 btn btn-outline text-lg py-3"
              >
                新しい登録
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/admin" className="text-teal-500 hover:underline text-sm">
              🔐 管理者ログイン
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-8">
          📋 イベント参加登録
        </h1>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">参加者情報入力</h2>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg border ${
                message.type === 'error'
                  ? 'bg-red-500/15 border-red-500/25 text-red-500'
                  : 'bg-teal-500/15 border-teal-500/25 text-teal-500'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">
                参加者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                学年 <span className="text-red-500">*</span>
              </label>
              <select
                className="form-control"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                required
              >
                <option value="">選択してください</option>
                <option value="1年">1年</option>
                <option value="2年">2年</option>
                <option value="3年">3年</option>
                <option value="4年">4年</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="form-label">備考</label>
              <textarea
                className="form-control min-h-[80px]"
                placeholder="特記事項があればご記入ください"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary text-lg py-3"
              disabled={loading}
            >
              {loading ? '登録中...' : '登録する'}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <Link href="/admin" className="text-teal-500 hover:underline text-sm">
            🔐 管理者ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
