"use client"

// Mock email service - In production, this would integrate with a real email service
export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export class EmailService {
  static async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In production, this would integrate with services like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    // - Resend

    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Password Reset - Villimale Hospital Inventory System",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Villimale Hospital</h1>
              <p>Inventory Management System</p>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${userName},</p>
              <p>We received a request to reset your password for your Villimale Hospital Inventory System account.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and contact your system administrator immediately.
              </div>
              
              <p>To reset your password, click the button below:</p>
              <a href="${resetLink}" class="button">Reset My Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${resetLink}</p>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>You can only use this link once</li>
                <li>If the link expires, you'll need to request a new password reset</li>
              </ul>
              
              <p>If you're having trouble with the link above, contact your system administrator or IT support.</p>
              
              <p>Best regards,<br>Villimale Hospital IT Team</p>
            </div>
            <div class="footer">
              <p>© 2024 Villimale Hospital. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Log the email for demo purposes (in production, this would actually send)
    console.log("📧 Password Reset Email Sent:", emailTemplate)

    // Simulate successful email sending
    return true
  }

  static async sendPasswordChangeConfirmation(email: string, userName: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Password Changed Successfully - Villimale Hospital",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Villimale Hospital</h1>
              <p>Inventory Management System</p>
            </div>
            <div class="content">
              <h2>Password Changed Successfully</h2>
              <p>Hello ${userName},</p>
              
              <div class="success">
                <strong>✅ Success:</strong> Your password has been changed successfully.
              </div>
              
              <p>Your password for the Villimale Hospital Inventory System has been updated on ${new Date().toLocaleString()}.</p>
              
              <p><strong>If you didn't make this change:</strong></p>
              <ul>
                <li>Contact your system administrator immediately</li>
                <li>Report this as a potential security incident</li>
                <li>Your account may have been compromised</li>
              </ul>
              
              <p>For security reasons, you may need to log in again on all your devices.</p>
              
              <p>Best regards,<br>Villimale Hospital IT Team</p>
            </div>
            <div class="footer">
              <p>© 2024 Villimale Hospital. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    console.log("📧 Password Change Confirmation Email Sent:", emailTemplate)
    return true
  }
}
