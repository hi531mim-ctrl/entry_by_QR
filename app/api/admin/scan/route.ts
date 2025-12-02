import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json(
        { error: 'IDを入力してください' },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { participantId },
    })

    if (!participant) {
      return NextResponse.json(
        { error: '登録されていない参加者です', alreadyScanned: false },
        { status: 404 }
      )
    }

    if (participant.scanned) {
      return NextResponse.json(
        {
          error: 'すでに入場済みです',
          alreadyScanned: true,
          participant: {
            name: participant.name,
            grade: participant.grade,
          },
        },
        { status: 400 }
      )
    }

    // Mark as scanned and create entry log
    await prisma.$transaction([
      prisma.participant.update({
        where: { participantId },
        data: { scanned: true },
      }),
      prisma.entryLog.create({
        data: {
          participantId,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.participantId,
        name: participant.name,
        grade: participant.grade,
        email: participant.email,
      },
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'スキャン処理に失敗しました' },
      { status: 500 }
    )
  }
}
