import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const entryLogs = await prisma.entryLog.findMany({
      include: {
        participant: {
          select: {
            name: true,
            grade: true,
          },
        },
      },
      orderBy: {
        scanDateTime: 'desc',
      },
    })

    return NextResponse.json({
      entryLogs: entryLogs.map((log) => ({
        id: log.id,
        participantId: log.participantId,
        name: log.participant.name,
        grade: log.participant.grade,
        scanDateTime: log.scanDateTime,
      })),
    })
  } catch (error) {
    console.error('Entry log error:', error)
    return NextResponse.json(
      { error: '入場ログの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await prisma.$transaction([
      prisma.entryLog.deleteMany({}),
      prisma.participant.updateMany({
        data: { scanned: false },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear entry log error:', error)
    return NextResponse.json(
      { error: 'ログのクリアに失敗しました' },
      { status: 500 }
    )
  }
}
