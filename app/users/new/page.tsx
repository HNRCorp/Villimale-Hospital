"use client"

import type React from "react"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, X, Eye, EyeOff, UserPlus, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

export default function NewUserPage() {
  const router = useRouter()
  const { createUser, hasPermission } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    role: "",
    password: "",
    confirmPassword: "",
    status: "Active",
    notes: "",
  })

  // Check if user has permission to create users
  if (!hasPermission("User Management")) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to create new users. Please contact your administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/users">Back to Users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const departments = [
    "Administration",
    "Emergency",
    "Surgery",
    "ICU",
    "Pediatrics",
    "Pharmacy",
    "Radiology",
    "Laboratory",
    "Cardiology",
    "Orthopedics",
    "Obstetrics & Gynecology",
    "Neurology",
    "Oncology",
    "Psychiatry",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "Anesthesiology",
    "Pathology",
    "Physiotherapy",
    "IT",
    "Inventory",
  ]

  const roles = [
    {
      name: "System Administrator",
      description: "Full system access and user management",
      permissions: [
        "Full Access",
        "User Management",
        "System Settings",
        "View Reports",
        "Manage Orders",
        "Release Items",
        "Approve Requests",
        "View Inventory",
        "Generate Reports",
      ],
      restricted: true,
    },
    {
      name: "Inventory Manager",
      description: "Manage inventory, orders, and releases",
      permissions: [
        "View Inventory",
        "Add/Edit Items",
        "Manage Orders",
        "Release Items",
        "Approve Requests",
        "View Reports",
        "Generate Reports",
        "Manage Suppliers",
      ],
      restricted: false,
    },
    {
      name: "Department Head",
      description: "Department-specific inventory management",
      permissions: [
        "View Inventory",
        "Request Items",
        "Approve Department Requests",
        "View Department Reports",
        "Manage Department Users",
      ],
      restricted: false,
    },
    {
      name: "Doctor",
      description: "Medical staff with inventory viewing and requesting",
      permissions: ["View Inventory", "Request Items", "View Request Status"],
      restricted: false,
    },
    {
      name: "Nurse Manager",
      description: "Nursing staff with enhanced inventory access",
      permissions: ["View Inventory", "Request Items", "Approve Nursing Requests", "View Department Reports"],
      restricted: false,
    },
    {
      name: "Pharmacist",
      description: "Pharmacy-specific inventory management",
      permissions: [
        "View Inventory",
        "Request Items",
        "Manage Medications",
        "View Pharmacy Reports",
        "Track Controlled Substances",
      ],
      restricted: false,
    },
    {
      name: "Inventory Staff",
      description: "Basic inventory operations",
      permissions: ["View Inventory", "Release Items", "Update Stock", "Process Requests"],
      restricted: false,
    },
    {
      name: "Department Staff",
      description: "Basic department user with limited access",
      permissions: ["View Inventory", "Request Items"],
      restricted: false,
    },
  ]

  const allPermissions = [
    "Full Access",
    "User Management",
    "System Settings",
    "View Inventory",
    "Add/Edit Items",
    "Request Items",
    "Approve Requests",
    "Approve Department Requests",
    "Approve Nursing Requests",
    "Release Items",
    "Update Stock",
    "Process Requests",
    "Manage Orders",
    "Manage Suppliers",
    "Manage Medications",
    "Track Controlled Substances",
    "View Reports",
    "View Department Reports",
    "View Pharmacy Reports",
    "Generate Reports",
    "View Request Status",
    "Manage Department Users",
  ]

  const statusOptions = [
    { value: "Active", label: "Active", description: "User can log in and access the system" },
    { value: "Inactive", label: "Inactive", description: "User cannot log in" },
    { value: "Pending Approval", label: "Pending Approval", description: "User needs approval before accessing" },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const handleRoleChange = (roleName: string) => {
    handleInputChange("role", roleName)
    const selectedRole = roles.find((role) => role.name === roleName)
    if (selectedRole) {
      setSelectedPermissions(selectedRole.permissions)
    }
  }

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required"
    if (!formData.lastName.trim()) return "Last name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.email.includes("@")) return "Please enter a valid email"
    if (!formData.department) return "Department is required"
    if (!formData.role) return "Role is required"
    if (!formData.password) return "Password is required"
    if (formData.password.length < 8) return "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"
    if (selectedPermissions.length === 0) return "At least one permission is required"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        employeeId: formData.employeeId.trim(),
        department: formData.department,
        role: formData.role,
        password: formData.password,
        permissions: selectedPermissions,
        status: formData.status,
        notes: formData.notes.trim(),
      })

      if (result.success) {
        setSuccess("User created successfully!")
        setTimeout(() => {
          router.push("/users")
        }, 2000)
      } else {
        setError(result.error || "Failed to create user")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRole = roles.find((role) => role.name === formData.role)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New User</h1>
            <p className="text-muted-foreground">Add a new user to the hospital inventory system</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <UserPlus className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic user details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.doe@villimale-hospital.mv"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+960 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      placeholder="EMP001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department & Role */}
            <Card>
              <CardHeader>
                <CardTitle>Department & Role</CardTitle>
                <CardDescription>Assign department and role-based permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem
                          key={role.name}
                          value={role.name}
                          disabled={role.restricted && !hasPermission("Full Access")}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{role.name}</span>
                              {role.restricted && (
                                <Badge variant="secondary" className="text-xs">
                                  Admin Only
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div>
                            <div className="font-medium">{status.label}</div>
                            <div className="text-sm text-muted-foreground">{status.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole && (
                  <div className="space-y-2">
                    <Label>Role Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Set up login credentials and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter secure password"
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
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                  Generate Secure Password
                </Button>
                <span className="text-sm text-muted-foreground">Password must be at least 8 characters long</span>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                {formData.role
                  ? `Default permissions for ${formData.role} role (you can customize these)`
                  : "Select a role first to see default permissions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPermissions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedPermissions.map((permission) => (
                      <Badge key={permission} variant="default" className="cursor-pointer">
                        {permission}
                        <X className="ml-1 h-3 w-3" onClick={() => handlePermissionToggle(permission)} />
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Add Additional Permissions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allPermissions
                        .filter((permission) => !selectedPermissions.includes(permission))
                        .map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox id={permission} onCheckedChange={() => handlePermissionToggle(permission)} />
                            <Label htmlFor={permission} className="text-sm">
                              {permission}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Please select a role to configure permissions.</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes about this user..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
