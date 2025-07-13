"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { usePasswordResetStore } from "@/lib/password-reset-store"

interface ForgotPasswordModalProps {
  children: React.ReactNode
}

export function ForgotPasswordModal({ children }: ForgotPasswordModalProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"request" | "success">("request")

  const { requestPasswordReset, isLoading, error, successMessage, clearMessages } = usePasswordResetStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    const result = await requestPasswordReset(email.trim())

    if (result.success) {
      setStep("success")
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setStep("request")
      setEmail("")
      clearMessages()
    }, 300)
  }

  const handleBackToLogin = () => {
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "request" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Forgot Password
              </DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@villimale-hospital.mv"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <Button type="button" variant="ghost" onClick={handleClose}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Check Your Email
              </DialogTitle>
              <DialogDescription>We've sent password reset instructions to your email address.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {successMessage && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>What to do next:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your email inbox for the reset link</li>
                  <li>Don't forget to check your spam/junk folder</li>
                  <li>The link will expire in 1 hour for security</li>
                  <li>You can only use the link once</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setStep("request")
                    setEmail("")
                    clearMessages()
                  }}
                  variant="outline"
                >
                  Send Another Email
                </Button>

                <Button onClick={handleBackToLogin} variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
