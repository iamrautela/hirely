import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/otp'
import { sendWelcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Verify OTP
    const otpResult = await verifyOTP(email, code, 'EMAIL_VERIFICATION')
    
    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.error },
        { status: 400 }
      )
    }

    // Update user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { 
        isVerified: true,
        emailVerified: new Date()
      }
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name || 'User')
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the verification if welcome email fails
    }

    return NextResponse.json({
      message: 'Email verified successfully! Welcome to Hirely.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}