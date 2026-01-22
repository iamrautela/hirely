import { prisma } from './prisma'
import crypto from 'crypto'

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createOTP(email: string, type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET', userId?: string) {
  // Delete any existing OTP codes for this email and type
  await prisma.otpCode.deleteMany({
    where: {
      email,
      type,
    }
  })

  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  return await prisma.otpCode.create({
    data: {
      email,
      code,
      type,
      expiresAt,
      userId,
    }
  })
}

export async function verifyOTP(email: string, code: string, type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET') {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      type,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!otpRecord) {
    return { success: false, error: 'Invalid or expired OTP code' }
  }

  // Mark OTP as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true }
  })

  return { success: true, otpRecord }
}