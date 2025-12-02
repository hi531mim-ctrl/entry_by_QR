import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, grade, notes } = await request.json()

    if (!name || !email || !grade) {
      return NextResponse.json(
        { error: '全ての必須項目を入力してください' },
        { status: 400 }
      )
    }

    // Generate unique participant ID
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').substring(0, 14)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const participantId = `PARTICIPANT_${timestamp}${random}`

    const participant = await prisma.participant.create({
      data: {
        participantId,
        name,
        email,
        grade,
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.participantId,
        name: participant.name,
        email: participant.email,
        grade: participant.grade,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 500 }
    )
  }
}
