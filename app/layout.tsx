import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'イベント参加登録・入場管理システム',
  description: 'QRコードを使用したイベント参加登録と入場管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
