import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: {
        registeredAt: 'desc',
      },
    })

    let csv = 'ID,名前,メール,学年,登録時刻,入場済み\n'

    participants.forEach((p) => {
      const entered = p.scanned ? '○' : '×'
      const registeredAt = new Date(p.registeredAt).toLocaleString('ja-JP')
      csv += `"${p.participantId}","${p.name}","${p.email}","${p.grade}","${registeredAt}","${entered}"\n`
    })

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="participants_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'エクスポートに失敗しました' },
      { status: 500 }
    )
  }
}
