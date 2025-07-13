"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Eye,
  EyeOff,
  Building2,
  Shield,
  Users,
  Package,
  TrendingUp,
  Activity,
  UserPlus,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useAuthStore } from "@/lib/auth-store"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"

export function LandingPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        if (result.requiresPasswordChange) {
          // Redirect to password change page
          router.push("/change-password?first-login=true")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  /* ------------------------------------------------------------------ */
  /* ------------------------- DEMO CREDENTIALS ----------------------- */
  /* ------------------------------------------------------------------ */
  const demoCredentials = [
    {
      role: "System Administrator",
      email: "admin@villimale-hospital.mv",
      password: "admin123",
      description: "Full system access and user management",
    },
    {
      role: "Inventory Manager",
      email: "john.smith@villimale-hospital.mv",
      password: "inventory123",
      description: "Inventory management and operations",
    },
    {
      role: "Department Head",
      email: "sarah.johnson@villimale-hospital.mv",
      password: "doctor123",
      description: "Department operations and approvals",
    },
  ]

  /* ------------------------------------------------------------------ */
  /* ------------------------------ FEATURES -------------------------- */
  /* ------------------------------------------------------------------ */
  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Complete tracking of medical supplies, equipment, and medications",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Role-based access control for different hospital departments",
    },
    {
      icon: Activity,
      title: "Real-time Tracking",
      description: "Live updates on stock levels, requests, and releases",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Comprehensive reporting and analytics for better decision making",
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Hospital-grade security with audit trails and compliance",
    },
    {
      icon: Building2,
      title: "Department Integration",
      description: "Seamless integration across all hospital departments",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* ------------------------------ HEADER ------------------------------ */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
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
            <Button asChild>
              <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ------------------------------ MAIN ------------------------------ */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 items-center lg:grid-cols-2">
          {/* ---------------------- LEFT: HERO & FEATURES --------------------- */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                Modern Hospital
                <span className="block text-green-600">Inventory Management</span>
              </h2>
              <p className="text-xl leading-relaxed text-gray-600">
                Streamline your hospital's inventory operations with our comprehensive management system. Track
                supplies, manage requests, and optimize stock levels across all departments.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex items-start space-x-3">
                  <f.icon className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-600">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------------- RIGHT: LOGIN CARD ----------------------- */}
          <section className="space-y-6">
            <Card className="mx-auto w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Sign in to access the inventory management system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="your.email@villimale-hospital.mv"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
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

                  {/* Error */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit */}
                  <Button disabled={isLoading} className="w-full" type="submit">
                    {isLoading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Links */}
                  <div className="flex flex-col space-y-2 text-center">
                    <ForgotPasswordModal>
                      <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                        Forgot your password?
                      </Button>
                    </ForgotPasswordModal>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/register" className="text-primary hover:underline">
                        Register here
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ----------------- DEMO CREDENTIALS ---------------- */}
            <Card className="mx-auto w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-lg">Demo Credentials</CardTitle>
                <CardDescription>Use these credentials to explore the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoCredentials.map((cred) => (
                  <div key={cred.role} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{cred.role}</p>
                        <p className="text-xs text-gray-600">{cred.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFormData({
                            email: cred.email,
                            password: cred.password,
                          })
                        }
                      >
                        Use
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Email: {cred.email}</p>
                      <p>Password: {cred.password}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* ------------------------------ FOOTER ----------------------------- */}
      <footer className="border-t bg-white mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2024 Villimale Hospital. All rights reserved.</p>
          <p className="mt-2 text-sm">Inventory Management System&nbsp;&mdash;&nbsp;Secure &amp; Reliable</p>
        </div>
      </footer>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Provide a default export so both `import { LandingPage } ...` and     */
/*  `import LandingPage ...` work.                                        */
/* ---------------------------------------------------------------------- */
export default LandingPage
