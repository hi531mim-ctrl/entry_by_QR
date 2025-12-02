import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'パスワードを入力してください' },
        { status: 400 }
      )
    }

    // Default password: admin2024
    const defaultPasswordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    const passwordHash = process.env.ADMIN_PASSWORD_HASH || defaultPasswordHash

    // デバッグ用ログ
    console.log('Environment variable exists:', !!process.env.ADMIN_PASSWORD_HASH)
    console.log('Using hash (full):', passwordHash)
    console.log('Default hash:', defaultPasswordHash)
    console.log('Input password:', password)

    const isValid = await bcrypt.compare(password, passwordHash)
    console.log('bcrypt comparison result:', isValid)

    if (!isValid) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}
