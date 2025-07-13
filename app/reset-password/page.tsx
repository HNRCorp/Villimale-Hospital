"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePasswordResetStore } from "@/lib/password-reset-store"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [tokenValidation, setTokenValidation] = useState<{
    valid: boolean
    email?: string
    expired?: boolean
    used?: boolean
    checked: boolean
  }>({ valid: false, checked: false })

  const { validateResetToken, resetPassword, isLoading, error, successMessage, clearMessages } = usePasswordResetStore()

  useEffect(() => {
    if (token) {
      const validation = validateResetToken(token)
      setTokenValidation({ ...validation, checked: true })
    } else {
      setTokenValidation({ valid: false, checked: true })
    }
  }, [token, validateResetToken])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    return errors
  }

  const handlePasswordChange = (field: "password" | "confirmPassword", value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))

    if (field === "password") {
      const errors = validatePassword(value)
      setValidationErrors(errors)
    }

    clearMessages()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) return

    // Validate passwords match
    if (passwords.password !== passwords.confirmPassword) {
      setValidationErrors(["Passwords do not match"])
      return
    }

    // Validate password strength
    const passwordErrors = validatePassword(passwords.password)
    if (passwordErrors.length > 0) {
      setValidationErrors(passwordErrors)
      return
    }

    const result = await resetPassword(token, passwords.password)

    if (result.success) {
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/")
      }, 3000)
    }
  }

  // Loading state while checking token
  if (!tokenValidation.checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Invalid token states
  if (!tokenValidation.valid) {
    let errorTitle = "Invalid Reset Link"
    let errorMessage = "This password reset link is invalid or malformed."

    if (tokenValidation.expired) {
      errorTitle = "Reset Link Expired"
      errorMessage = "This password reset link has expired. Reset links are valid for 1 hour only."
    } else if (tokenValidation.used) {
      errorTitle = "Reset Link Already Used"
      errorMessage = "This password reset link has already been used. Each link can only be used once."
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Image
                  src="/images/villimale-logo.png"
                  alt="Villimale Hospital"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Villimale Hospital</h1>
                  <p className="text-sm text-gray-600">Inventory Management System</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <CardTitle className="text-2xl font-bold text-red-600">{errorTitle}</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>What you can do:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Request a new password reset from the login page</li>
                  <li>Make sure you're using the latest email link</li>
                  <li>Check that you copied the entire link correctly</li>
                  <li>Contact IT support if you continue having issues</li>
                </ul>
              </div>

              <Button asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Image
                  src="/images/villimale-logo.png"
                  alt="Villimale Hospital"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Villimale Hospital</h1>
                  <p className="text-sm text-gray-600">Inventory Management System</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful</CardTitle>
              <CardDescription>Your password has been changed successfully</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground text-center">
                <p>You will be redirected to the login page in a few seconds...</p>
              </div>

              <Button asChild className="w-full">
                <Link href="/">Continue to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/images/villimale-logo.png"
                alt="Villimale Hospital"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Villimale Hospital</h1>
                <p className="text-sm text-gray-600">Inventory Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>Enter your new password for {tokenValidation.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={passwords.password}
                    onChange={(e) => handlePasswordChange("password", e.target.value)}
                    placeholder="Enter your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li className={passwords.password.length >= 8 ? "text-green-600" : ""}>At least 8 characters long</li>
                  <li className={/[A-Z]/.test(passwords.password) ? "text-green-600" : ""}>One uppercase letter</li>
                  <li className={/[a-z]/.test(passwords.password) ? "text-green-600" : ""}>One lowercase letter</li>
                  <li className={/\d/.test(passwords.password) ? "text-green-600" : ""}>One number</li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwords.password) ? "text-green-600" : ""}>
                    One special character
                  </li>
                </ul>
              </div>

              {(error || validationErrors.length > 0) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || validationErrors[0]}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  !passwords.password ||
                  !passwords.confirmPassword ||
                  validationErrors.length > 0 ||
                  passwords.password !== passwords.confirmPassword
                }
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>

              <Button type="button" variant="ghost" className="w-full" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
