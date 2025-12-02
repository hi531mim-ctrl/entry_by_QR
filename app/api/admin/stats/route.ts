import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const totalRegistered = await prisma.participant.count()
    const totalEntered = await prisma.participant.count({
      where: { scanned: true },
    })

    const rate = totalRegistered > 0
      ? Math.round((totalEntered / totalRegistered) * 100)
      : 0

    return NextResponse.json({
      totalRegistered,
      totalEntered,
      rate,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    )
  }
}
