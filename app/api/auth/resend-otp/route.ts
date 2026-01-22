import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOTP } from '@/lib/otp'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'EMAIL_VERIFICATION' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate and send new OTP
    const otpRecord = await createOTP(email, type, user.id)
    const emailType = type === 'EMAIL_VERIFICATION' ? 'verification' : 'login'
    await sendOTPEmail(email, otpRecord.code, emailType)

    return NextResponse.json({
      message: 'Verification code sent successfully'
    })

  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}