'use client'

import { useRef, useEffect, useState } from 'react'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (data: string) => void
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const [frameCount, setFrameCount] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const frameCountRef = useRef(0)
  const scanningRef = useRef(false) // scanningのref版を追加

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setDebugInfo('カメラを起動中...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      streamRef.current = stream
      setDebugInfo('カメラ起動完了。QRコードをかざしてください')

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play()
          scanningRef.current = true // refを先に更新
          setScanning(true)
          setDebugInfo('スキャン中...')
          console.log('Camera started, beginning scan loop')
          scanQRCode()
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('カメラへのアクセスが拒否されました')
    }
  }

  const stopCamera = () => {
    scanningRef.current = false // refを先に更新
    setScanning(false)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const scanQRCode = () => {
    if (!scanningRef.current) {
      console.log('Scan stopped')
      return
    }

    // フレームカウント更新
    frameCountRef.current += 1
    if (frameCountRef.current % 30 === 0) {
      setFrameCount(frameCountRef.current)
      console.log(`Scanning... frame ${frameCountRef.current}`)
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      console.log('Video or canvas not ready')
      animationRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Canvas context not available')
      animationRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code) {
          const scannedId = code.data.trim()
          console.log('QR Code detected:', scannedId)
          setDebugInfo(`検出: ${scannedId}`)

          if (scannedId.startsWith('PARTICIPANT_')) {
            console.log('Valid participant ID detected')
            onScan(scannedId)
            stopCamera()
            return
          } else {
            console.log('Invalid QR code format:', scannedId)
            setDebugInfo(`無効なQR: ${scannedId.substring(0, 20)}...`)
          }
        }
      } else {
        if (frameCountRef.current % 30 === 0) {
          console.log('Video dimensions not ready:', canvas.width, canvas.height)
        }
      }
    } else {
      if (frameCountRef.current % 30 === 0) {
        console.log('Video readyState:', video.readyState)
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode)
  }

  if (error) {
    return (
      <div className="bg-red-500/15 border border-red-500/25 text-red-500 p-4 rounded-lg text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full max-w-md mx-auto rounded-lg border-2 border-brown-600/20 bg-black"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      {scanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-4 border-teal-500 rounded-lg animate-pulse" />
        </div>
      )}
      {debugInfo && (
        <div className="mt-2 p-2 bg-blue-500/15 border border-blue-500/25 text-blue-500 text-xs rounded">
          {debugInfo}
        </div>
      )}
      {scanning && (
        <div className="mt-2 p-2 bg-gray-500/15 border border-gray-500/25 text-gray-500 text-xs rounded text-center">
          フレーム: {frameCount}
        </div>
      )}
    </div>
  )
}
