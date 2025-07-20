"use client" // This must be at the very top

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/components/ui/use-toast"
import type { UserRole, User } from "@/lib/types" // Assuming types are defined here

// Disable static generation – render on demand instead
export const dynamic = "force-dynamic"

export default function NewUserPage() {
  const { createUser, isAuthenticated, user: currentUser, roles } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()

  const [employeeId, setEmployeeId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (!isAuthenticated() || currentUser?.role !== "System Administrator") {
      router.push("/dashboard") // Redirect if not authorized
    }
  }, [isAuthenticated, currentUser, router])

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions((prev) => (checked ? [...prev, permission] : prev.filter((p) => p !== permission)))
  }

  const validatePassword = (pw: string) => {
    if (pw.length < 8) {
      return "Password must be at least 8 characters long."
    }
    if (!/[A-Z]/.test(pw)) {
      return "Password must contain at least one uppercase letter."
    }
    if (!/[a-z]/.test(pw)) {
      return "Password must contain at least one lowercase letter."
    }
    if (!/[0-9]/.test(pw)) {
      return "Password must contain at least one number."
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) {
      return "Password must contain at least one special character."
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setPasswordError("")

    const pwValidation = validatePassword(password)
    if (pwValidation) {
      setPasswordError(pwValidation)
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      setIsSubmitting(false)
      return
    }

    if (!role) {
      toast({
        title: "Validation Error",
        description: "Please select a user role.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const newUser: Partial<User> = {
        employeeId,
        email,
        password, // Password will be hashed in createUser
        role: role as UserRole,
        permissions,
        status,
        firstLogin: true, // Mark as first login for password change prompt
      }
      await createUser(newUser)
      toast({
        title: "User Created",
        description: `User ${email} has been created successfully.`,
      })
      router.push("/users") // Redirect to user list
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dummy permissions for demonstration
  const availablePermissions = [
    "inventory:read",
    "inventory:write",
    "requests:read",
    "requests:write",
    "orders:read",
    "orders:write",
    "releases:read",
    "releases:write",
    "users:read",
    "users:write",
    "reports:read",
  ]

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Fill in the details to create a new user account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="EMP001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(validatePassword(e.target.value))
                  }}
                  required
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {password !== confirmPassword && confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match.</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${perm}`}
                        checked={permissions.includes(perm)}
                        onCheckedChange={(checked) => handlePermissionChange(perm, checked as boolean)}
                      />
                      <Label htmlFor={`perm-${perm}`}>{perm}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating User..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
