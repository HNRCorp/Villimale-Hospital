"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role:
    | "System Administrator"
    | "Inventory Manager"
    | "Department Head"
    | "Doctor"
    | "Nurse Manager"
    | "Pharmacist"
    | "Inventory Staff"
    | "Department Staff"
  department: string
  status: "Active" | "Inactive" | "Pending Approval" | "Suspended"
  createdAt: string
  lastLogin?: string
  employeeId?: string
  phone?: string
  permissions: string[]
  profileImage?: string
  isFirstLogin: boolean
  passwordLastChanged?: string
  loginAttempts: number
  lockedUntil?: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  users: User[]
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }>
  logout: () => void
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
    department: string
    employeeId?: string
    phone?: string
  }) => Promise<{ success: boolean; error?: string }>
  createUser: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
    department: string
    employeeId?: string
    phone?: string
    permissions: string[]
    status?: string
    notes?: string
  }) => Promise<{ success: boolean; error?: string }>
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>
  approveUser: (userId: string, approverId: string) => Promise<{ success: boolean; error?: string }>
  suspendUser: (userId: string, reason: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  getAllUsers: () => User[]
  getUserById: (userId: string) => User | undefined
  hasPermission: (permission: string) => boolean
}

// Enhanced demo users with more realistic data
const initialUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@villimale-hospital.mv",
    password: "admin123",
    firstName: "System",
    lastName: "Administrator",
    role: "System Administrator",
    department: "IT",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-15T10:30:00Z",
    employeeId: "EMP001",
    phone: "+960 330-1001",
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
    isFirstLogin: false,
    passwordLastChanged: "2024-01-01T00:00:00Z",
    loginAttempts: 0,
    approvedBy: "system",
    approvedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "john.smith@villimale-hospital.mv",
    password: "inventory123",
    firstName: "John",
    lastName: "Smith",
    role: "Inventory Manager",
    department: "Inventory",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-15T09:15:00Z",
    employeeId: "EMP002",
    phone: "+960 330-1002",
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
    isFirstLogin: false,
    passwordLastChanged: "2024-01-01T00:00:00Z",
    loginAttempts: 0,
    approvedBy: "1",
    approvedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "sarah.johnson@villimale-hospital.mv",
    password: "doctor123",
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    role: "Department Head",
    department: "Emergency",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-15T08:45:00Z",
    employeeId: "DOC001",
    phone: "+960 330-1003",
    permissions: [
      "View Inventory",
      "Request Items",
      "Approve Department Requests",
      "View Department Reports",
      "Manage Department Users",
    ],
    isFirstLogin: false,
    passwordLastChanged: "2024-01-01T00:00:00Z",
    loginAttempts: 0,
    approvedBy: "1",
    approvedAt: "2024-01-01T00:00:00Z",
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: initialUsers.map(({ password, ...user }) => user),

      login: async (email: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const currentState = get()
        const allUsers = [...initialUsers]

        // Add any users created during the session
        currentState.users.forEach((stateUser) => {
          const existingIndex = allUsers.findIndex((u) => u.id === stateUser.id)
          if (existingIndex === -1) {
            // This is a newly created user, add with default password
            allUsers.push({ ...stateUser, password: "temp123" } as User & { password: string })
          }
        })

        const user = allUsers.find((u) => u.email === email)

        if (!user) {
          return { success: false, error: "User not found" }
        }

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          return { success: false, error: "Account is temporarily locked. Please try again later." }
        }

        // Check if account is suspended
        if (user.status === "Suspended") {
          return { success: false, error: "Account has been suspended. Please contact administrator." }
        }

        // Check if account is pending approval
        if (user.status === "Pending Approval") {
          return { success: false, error: "Account is pending approval. Please wait for administrator approval." }
        }

        // Check if account is inactive
        if (user.status === "Inactive") {
          return { success: false, error: "Account is inactive. Please contact administrator." }
        }

        // Verify password
        if (user.password !== password) {
          // Increment login attempts
          const updatedUser = { ...user, loginAttempts: user.loginAttempts + 1 }

          // Lock account after 5 failed attempts
          if (updatedUser.loginAttempts >= 5) {
            updatedUser.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
          }

          // Update user in state
          set((state) => ({
            users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
          }))

          return {
            success: false,
            error: `Invalid password. ${5 - updatedUser.loginAttempts} attempts remaining.`,
          }
        }

        // Reset login attempts on successful login
        const { password: _, ...userWithoutPassword } = user
        const updatedUser = {
          ...userWithoutPassword,
          lastLogin: new Date().toISOString(),
          loginAttempts: 0,
          lockedUntil: undefined,
        }

        // Update user in state
        set((state) => ({
          user: updatedUser,
          isAuthenticated: true,
          users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
        }))

        return {
          success: true,
          requiresPasswordChange: user.isFirstLogin,
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      register: async (userData) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const currentState = get()

        // Check if user already exists
        const existingUser = currentState.users.find((u) => u.email === userData.email)
        if (existingUser) {
          return { success: false, error: "User with this email already exists" }
        }

        // Check if employee ID already exists
        if (userData.employeeId) {
          const existingEmployeeId = currentState.users.find((u) => u.employeeId === userData.employeeId)
          if (existingEmployeeId) {
            return { success: false, error: "Employee ID already exists" }
          }
        }

        // Get default permissions for role
        const defaultPermissions = getRolePermissions(userData.role)

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as User["role"],
          department: userData.department,
          employeeId: userData.employeeId,
          phone: userData.phone,
          status: "Pending Approval", // New registrations require approval
          permissions: defaultPermissions,
          createdAt: new Date().toISOString(),
          isFirstLogin: true,
          loginAttempts: 0,
        }

        set((state) => ({
          users: [...state.users, newUser],
        }))

        return { success: true }
      },

      createUser: async (userData) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const currentState = get()

        // Check if user already exists
        const existingUser = currentState.users.find((u) => u.email === userData.email)
        if (existingUser) {
          return { success: false, error: "User with this email already exists" }
        }

        // Check if employee ID already exists
        if (userData.employeeId) {
          const existingEmployeeId = currentState.users.find((u) => u.employeeId === userData.employeeId)
          if (existingEmployeeId) {
            return { success: false, error: "Employee ID already exists" }
          }
        }

        const currentUser = currentState.user
        if (!currentUser) {
          return { success: false, error: "Not authenticated" }
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as User["role"],
          department: userData.department,
          employeeId: userData.employeeId,
          phone: userData.phone,
          status: (userData.status as User["status"]) || "Active",
          permissions: userData.permissions,
          createdAt: new Date().toISOString(),
          isFirstLogin: true,
          loginAttempts: 0,
          approvedBy: currentUser.id,
          approvedAt: new Date().toISOString(),
          notes: userData.notes,
        }

        set((state) => ({
          users: [...state.users, newUser],
        }))

        return { success: true }
      },

      updateUser: async (userId, updates) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const currentState = get()
        const userExists = currentState.users.find((u) => u.id === userId)
        if (!userExists) {
          return { success: false, error: "User not found" }
        }

        // Update user
        set((state) => {
          const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u))

          // Update current user if it's the same user
          const updatedCurrentUser = state.user && state.user.id === userId ? { ...state.user, ...updates } : state.user

          return {
            users: updatedUsers,
            user: updatedCurrentUser,
          }
        })

        return { success: true }
      },

      deleteUser: async (userId) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const currentState = get()
        const userExists = currentState.users.find((u) => u.id === userId)
        if (!userExists) {
          return { success: false, error: "User not found" }
        }

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))

        return { success: true }
      },

      approveUser: async (userId, approverId) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const currentState = get()
        const userExists = currentState.users.find((u) => u.id === userId)
        if (!userExists) {
          return { success: false, error: "User not found" }
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: "Active" as const,
                  approvedBy: approverId,
                  approvedAt: new Date().toISOString(),
                }
              : u,
          ),
        }))

        return { success: true }
      },

      suspendUser: async (userId, reason) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const currentState = get()
        const userExists = currentState.users.find((u) => u.id === userId)
        if (!userExists) {
          return { success: false, error: "User not found" }
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: "Suspended" as const,
                  notes: reason,
                }
              : u,
          ),
        }))

        return { success: true }
      },

      resetPassword: async (userId, newPassword) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const currentState = get()
        const userExists = currentState.users.find((u) => u.id === userId)
        if (!userExists) {
          return { success: false, error: "User not found" }
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  isFirstLogin: true,
                  passwordLastChanged: new Date().toISOString(),
                }
              : u,
          ),
        }))

        return { success: true }
      },

      changePassword: async (currentPassword, newPassword) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const currentUser = get().user
        if (!currentUser) {
          return { success: false, error: "Not authenticated" }
        }

        // In a real app, you'd verify the current password here
        // For demo purposes, we'll assume it's correct

        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                isFirstLogin: false,
                passwordLastChanged: new Date().toISOString(),
              }
            : null,
          users: state.users.map((u) =>
            u.id === currentUser.id
              ? {
                  ...u,
                  isFirstLogin: false,
                  passwordLastChanged: new Date().toISOString(),
                }
              : u,
          ),
        }))

        return { success: true }
      },

      getAllUsers: () => {
        return get().users
      },

      getUserById: (userId) => {
        return get().users.find((u) => u.id === userId)
      },

      hasPermission: (permission) => {
        const currentUser = get().user
        if (!currentUser) return false
        return currentUser.permissions.includes(permission) || currentUser.permissions.includes("Full Access")
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
    },
  ),
)

// Helper function to get default permissions for a role
function getRolePermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    "System Administrator": [
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
    "Inventory Manager": [
      "View Inventory",
      "Add/Edit Items",
      "Manage Orders",
      "Release Items",
      "Approve Requests",
      "View Reports",
      "Generate Reports",
      "Manage Suppliers",
    ],
    "Department Head": [
      "View Inventory",
      "Request Items",
      "Approve Department Requests",
      "View Department Reports",
      "Manage Department Users",
    ],
    Doctor: ["View Inventory", "Request Items", "View Request Status"],
    "Nurse Manager": ["View Inventory", "Request Items", "Approve Nursing Requests", "View Department Reports"],
    Pharmacist: [
      "View Inventory",
      "Request Items",
      "Manage Medications",
      "View Pharmacy Reports",
      "Track Controlled Substances",
    ],
    "Inventory Staff": ["View Inventory", "Release Items", "Update Stock", "Process Requests"],
    "Department Staff": ["View Inventory", "Request Items"],
  }

  return rolePermissions[role] || ["View Inventory", "Request Items"]
}
