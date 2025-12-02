'use client'

import { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'
import QRScanner from '../QRScanner'

export default function EntryScan() {
  const [scanInput, setScanInput] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [scanResult, setScanResult] = useState<any>(null)
  const [showScanner, setShowScanner] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processScan = async (participantId?: string) => {
    const id = participantId || scanInput.trim()

    if (!id) {
      setMessage({ text: 'IDを入力してください', type: 'error' })
      return
    }

    try {
      const response = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: id }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          text: `✅ 入場完了：${data.participant.name}`,
          type: 'success',
        })
        setScanResult(data.participant)
      } else {
        if (data.alreadyScanned) {
          setMessage({
            text: `⚠️ ${data.participant.name} さんはすでに入場済みです`,
            type: 'warning',
          })
        } else {
          setMessage({ text: `❌ ${data.error}`, type: 'error' })
        }
        setScanResult(null)
      }

      setScanInput('')
      inputRef.current?.focus()
    } catch (error) {
      setMessage({ text: 'スキャン処理に失敗しました', type: 'error' })
      setScanResult(null)
    }
  }

  const handleQRScan = (data: string) => {
    setScanInput(data)
    setShowScanner(false)
    processScan(data)
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">QRコードスキャン</h2>
      <p className="text-slate-500 mb-4 text-sm">
        📷 カメラでQRコードをスキャンするか、手動でIDを入力してください。
      </p>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg border font-medium ${
            message.type === 'error'
              ? 'bg-red-500/15 border-red-500/25 text-red-500'
              : message.type === 'warning'
              ? 'bg-orange-500/15 border-orange-500/25 text-orange-500'
              : 'bg-teal-500/15 border-teal-500/25 text-teal-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="border border-brown-600/20 rounded-lg p-4 mb-4 bg-teal-500/5">
        <h3 className="text-lg font-semibold mb-3">📷 カメラスキャン</h3>
        <p className="text-sm text-slate-500 mb-3">
          ブラウザのカメラを使用してQRコードをスキャンします。
        </p>

        {!showScanner ? (
          <button
            onClick={() => setShowScanner(true)}
            className="btn btn-primary w-full"
          >
            📷 カメラ起動
          </button>
        ) : (
          <>
            <QRScanner onScan={handleQRScan} />
            <button
              onClick={() => setShowScanner(false)}
              className="btn btn-outline w-full mt-3"
            >
              ⏹️ カメラ停止
            </button>
          </>
        )}
      </div>

      <div className="border-t border-brown-600/20 pt-4">
        <h3 className="text-lg font-semibold mb-3">✋ 手動入力</h3>
        <p className="text-sm text-slate-500 mb-3">
          IDを直接入力する場合はこちらを使用してください。
        </p>

        <div className="mb-4">
          <label className="form-label">参加者ID</label>
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="PARTICIPANT_で始まるIDを入力..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') processScan()
            }}
          />
        </div>

        <button onClick={() => processScan()} className="btn btn-primary w-full">
          スキャン処理
        </button>
      </div>

      {scanResult && (
        <div className="mt-6 bg-teal-500/10 p-4 rounded-lg border-l-4 border-teal-500">
          <p className="text-lg font-bold text-teal-500 mb-2">✅ 入場可能</p>
          <p className="text-base mb-1">
            <strong>{scanResult.name}</strong> さん
          </p>
          <p className="text-sm text-slate-500 mb-1">学年: {scanResult.grade}</p>
          <p className="text-sm text-slate-500">
            入場時刻: {new Date().toLocaleTimeString('ja-JP')}
          </p>
        </div>
      )}
    </div>
  )
}
