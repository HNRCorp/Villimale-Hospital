"use client"

import { create } from "zustand"
import { EmailService } from "./email-service"

export interface PasswordResetToken {
  token: string
  email: string
  userId: string
  expiresAt: number
  used: boolean
}

interface PasswordResetStore {
  resetTokens: PasswordResetToken[]
  isLoading: boolean
  error: string | null
  successMessage: string | null

  // Actions
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>
  validateResetToken: (token: string) => { valid: boolean; email?: string; expired?: boolean; used?: boolean }
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  clearMessages: () => void
}

// Mock user database - in production this would be a real database
const mockUsers = [
  {
    id: "USR001",
    firstName: "Admin",
    lastName: "User",
    email: "admin@villimale-hospital.mv",
    password: "admin123",
  },
  {
    id: "USR002",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@villimale-hospital.mv",
    password: "inventory123",
  },
  {
    id: "USR003",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@villimale-hospital.mv",
    password: "doctor123",
  },
]

const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const usePasswordResetStore = create<PasswordResetStore>((set, get) => ({
  resetTokens: [],
  isLoading: false,
  error: null,
  successMessage: null,

  requestPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null, successMessage: null })

    try {
      // Check if user exists
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        // For security, we don't reveal if email exists or not
        set({
          isLoading: false,
          successMessage: "If an account with that email exists, you will receive a password reset link shortly.",
        })
        return { success: true, message: "Reset email sent (if account exists)" }
      }

      // Generate reset token
      const token = generateResetToken()
      const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour from now

      const resetToken: PasswordResetToken = {
        token,
        email: user.email,
        userId: user.id,
        expiresAt,
        used: false,
      }

      // Store the token
      set((state) => ({
        resetTokens: [...state.resetTokens, resetToken],
      }))

      // Send email
      const emailSent = await EmailService.sendPasswordResetEmail(
        user.email,
        token,
        `${user.firstName} ${user.lastName}`,
      )

      if (emailSent) {
        set({
          isLoading: false,
          successMessage:
            "Password reset link has been sent to your email address. Please check your inbox and spam folder.",
        })
        return { success: true, message: "Reset email sent successfully" }
      } else {
        throw new Error("Failed to send email")
      }
    } catch (error) {
      set({
        isLoading: false,
        error: "Failed to send password reset email. Please try again or contact support.",
      })
      return { success: false, message: "Failed to send reset email" }
    }
  },

  validateResetToken: (token: string) => {
    const resetToken = get().resetTokens.find((t) => t.token === token)

    if (!resetToken) {
      return { valid: false }
    }

    if (resetToken.used) {
      return { valid: false, used: true }
    }

    if (Date.now() > resetToken.expiresAt) {
      return { valid: false, expired: true }
    }

    return { valid: true, email: resetToken.email }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null, successMessage: null })

    try {
      const validation = get().validateResetToken(token)

      if (!validation.valid) {
        let errorMessage = "Invalid or expired reset token."
        if (validation.used) errorMessage = "This reset link has already been used."
        if (validation.expired) errorMessage = "This reset link has expired. Please request a new one."

        set({ isLoading: false, error: errorMessage })
        return { success: false, message: errorMessage }
      }

      // Find the reset token
      const resetToken = get().resetTokens.find((t) => t.token === token)
      if (!resetToken) {
        set({ isLoading: false, error: "Reset token not found." })
        return { success: false, message: "Reset token not found" }
      }

      // Find the user
      const user = mockUsers.find((u) => u.id === resetToken.userId)
      if (!user) {
        set({ isLoading: false, error: "User not found." })
        return { success: false, message: "User not found" }
      }

      // Update password (in production, this would hash the password)
      user.password = newPassword

      // Mark token as used
      set((state) => ({
        resetTokens: state.resetTokens.map((t) => (t.token === token ? { ...t, used: true } : t)),
      }))

      // Send confirmation email
      await EmailService.sendPasswordChangeConfirmation(user.email, `${user.firstName} ${user.lastName}`)

      set({
        isLoading: false,
        successMessage: "Your password has been reset successfully. You can now log in with your new password.",
      })

      return { success: true, message: "Password reset successfully" }
    } catch (error) {
      set({
        isLoading: false,
        error: "Failed to reset password. Please try again or contact support.",
      })
      return { success: false, message: "Failed to reset password" }
    }
  },

  clearMessages: () => {
    set({ error: null, successMessage: null })
  },
}))
