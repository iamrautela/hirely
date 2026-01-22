import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendOTPEmail(email: string, otp: string, type: 'verification' | 'login' = 'verification') {
  const subject = type === 'verification' ? 'Verify your email - Hirely' : 'Your login code - Hirely'
  const title = type === 'verification' ? 'Verify Your Email' : 'Your Login Code'
  const message = type === 'verification' 
    ? 'Please use the code below to verify your email address:'
    : 'Please use the code below to sign in to your account:'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #f1f5f9; border-radius: 12px; margin-bottom: 16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                <polyline points="16,18 22,12 16,6"></polyline>
                <polyline points="8,6 2,12 8,18"></polyline>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1e293b;">Hirely</h1>
          </div>
          
          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1e293b; text-align: center;">${title}</h2>
          
          <p style="margin: 0 0 24px 0; color: #64748b; text-align: center; line-height: 1.6;">
            ${message}
          </p>
          
          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="margin: 24px 0 0 0; color: #64748b; text-align: center; font-size: 14px; line-height: 1.6;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              © 2024 Hirely. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string, provider?: string) {
  const signInMethod = provider ? `${provider.charAt(0).toUpperCase() + provider.slice(1)}` : 'email'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Hirely!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #f1f5f9; border-radius: 12px; margin-bottom: 16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                <polyline points="16,18 22,12 16,6"></polyline>
                <polyline points="8,6 2,12 8,18"></polyline>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1e293b;">Hirely</h1>
          </div>
          
          <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1e293b; text-align: center;">
            Welcome to Hirely! 🎉
          </h2>
          
          <p style="margin: 0 0 24px 0; color: #64748b; text-align: center; line-height: 1.6; font-size: 16px;">
            Hi ${name}, thanks for joining Hirely! We're excited to have you on board.
          </p>
          
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <h3 style="margin: 0 0 12px 0; color: white; font-size: 18px; font-weight: 600;">
              You're all set! ✨
            </h3>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
              You signed up using ${signInMethod}. Start creating coding sessions and collaborate in real-time!
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Start Coding Together
            </a>
          </div>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 600;">What you can do with Hirely:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #64748b; line-height: 1.6;">
              <li>Create instant coding sessions</li>
              <li>Real-time collaborative code editing</li>
              <li>Built-in video chat and messaging</li>
              <li>Support for multiple programming languages</li>
              <li>Perfect for interviews, pair programming, and code reviews</li>
            </ul>
          </div>
          
          <p style="margin: 24px 0 0 0; color: #64748b; text-align: center; font-size: 14px; line-height: 1.6;">
            Need help getting started? Check out our <a href="${process.env.NEXTAUTH_URL}/docs" style="color: #3b82f6; text-decoration: none;">documentation</a> or reply to this email.
          </p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              © 2024 Hirely. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Hirely - Start coding together! 🚀',
    html,
  })
}