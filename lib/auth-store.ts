import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  department: string
  status: "Active" | "Inactive" | "Pending Approval" | "Suspended"
  employeeId?: string
  phone?: string
  permissions: string[]
  profileImage?: string
  isFirstLogin: boolean
  passwordLastChanged: string
  loginAttempts: number
  lockedUntil?: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

interface AuthStore {
  // State
  currentUser: User | null
  users: User[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (
    userData: Omit<User, "id" | "createdAt" | "updatedAt" | "isFirstLogin" | "loginAttempts" | "passwordLastChanged">,
    password: string,
  ) => Promise<boolean>
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  getAllUsers: () => Promise<User[]>
  getUserById: (id: string) => Promise<User | null>
  updateUserStatus: (id: string, status: User["status"]) => Promise<boolean>
  lockUser: (id: string, duration?: number) => Promise<boolean>
  unlockUser: (id: string) => Promise<boolean>
  initializeStore: () => Promise<void>
}

const mapDbToUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email,
  firstName: dbUser.first_name,
  lastName: dbUser.last_name,
  role: dbUser.role,
  department: dbUser.department,
  status: dbUser.status,
  employeeId: dbUser.employee_id,
  phone: dbUser.phone,
  permissions: dbUser.permissions || [],
  profileImage: dbUser.profile_image,
  isFirstLogin: dbUser.is_first_login,
  passwordLastChanged: dbUser.password_last_changed,
  loginAttempts: dbUser.login_attempts,
  lockedUntil: dbUser.locked_until,
  approvedBy: dbUser.approved_by,
  approvedAt: dbUser.approved_at,
  notes: dbUser.notes,
  createdAt: dbUser.created_at,
  updatedAt: dbUser.updated_at,
  lastLogin: dbUser.last_login,
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single()

          if (error) {
            if (error.code === "42P01" || error.message.includes("does not exist")) {
              console.warn("⚠️ users table not found. Run scripts/create-tables.sql first.")
              set({ isLoading: false, error: "Database not initialized" })
              return false
            }
            throw new Error("User not found")
          }

          if (!data) {
            throw new Error("User not found")
          }

          // Check if user is locked
          if (data.locked_until && new Date(data.locked_until) > new Date()) {
            throw new Error("Account is temporarily locked. Please try again later.")
          }

          // Check account status
          if (data.status !== "Active") {
            throw new Error(`Account is ${data.status.toLowerCase()}. Please contact administrator.`)
          }

          // Verify password *synchronously* – async version in bcryptjs is callback-based
          const isValidPassword = bcrypt.compareSync(password, data.password_hash)
          if (!isValidPassword) {
            // Increment login attempts
            const newAttempts = (data.login_attempts || 0) + 1
            const updates: any = { login_attempts: newAttempts }

            // Lock account after 5 failed attempts
            if (newAttempts >= 5) {
              updates.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
            }

            await supabase.from("users").update(updates).eq("id", data.id)

            throw new Error("Invalid password")
          }

          // Reset login attempts and update last login
          await supabase
            .from("users")
            .update({
              login_attempts: 0,
              locked_until: null,
              last_login: new Date().toISOString(),
            })
            .eq("id", data.id)

          const user = mapDbToUser(data)
          set({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error: any) {
          console.error("Login error:", error)
          set({
            error: error.message || "Login failed",
            isLoading: false,
            isAuthenticated: false,
            currentUser: null,
          })
          return false
        }
      },

      // Logout action
      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Register action
      register: async (userData, password) => {
        try {
          set({ isLoading: true, error: null })

          // Hash password
          const passwordHash = await bcrypt.hash(password, 12)

          const { data, error } = await supabase
            .from("users")
            .insert({
              email: userData.email.toLowerCase(),
              password_hash: passwordHash,
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role,
              department: userData.department,
              status: userData.status,
              employee_id: userData.employeeId,
              phone: userData.phone,
              permissions: userData.permissions,
              profile_image: userData.profileImage,
              notes: userData.notes,
            })
            .select()
            .single()

          if (error) throw error

          const newUser = mapDbToUser(data)
          set((state) => ({
            users: [...state.users, newUser],
            isLoading: false,
          }))

          return true
        } catch (error: any) {
          console.error("Registration error:", error)
          set({
            error: error.message || "Registration failed",
            isLoading: false,
          })
          return false
        }
      },

      // Update user action
      updateUser: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          const dbUpdates: any = {}
          if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase()
          if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
          if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
          if (updates.role !== undefined) dbUpdates.role = updates.role
          if (updates.department !== undefined) dbUpdates.department = updates.department
          if (updates.status !== undefined) dbUpdates.status = updates.status
          if (updates.employeeId !== undefined) dbUpdates.employee_id = updates.employeeId
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone
          if (updates.permissions !== undefined) dbUpdates.permissions = updates.permissions
          if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes

          const { data, error } = await supabase.from("users").update(dbUpdates).eq("id", id).select().single()

          if (error) throw error

          const updatedUser = mapDbToUser(data)
          set((state) => ({
            users: state.users.map((user) => (user.id === id ? updatedUser : user)),
            currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
            isLoading: false,
          }))

          return true
        } catch (error: any) {
          console.error("Update user error:", error)
          set({
            error: error.message || "Failed to update user",
            isLoading: false,
          })
          return false
        }
      },

      // Delete user action
      deleteUser: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.from("users").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            isLoading: false,
          }))

          return true
        } catch (error: any) {
          console.error("Delete user error:", error)
          set({
            error: error.message || "Failed to delete user",
            isLoading: false,
          })
          return false
        }
      },

      // Change password action
      changePassword: async (currentPassword, newPassword) => {
        try {
          const { currentUser } = get()
          if (!currentUser) throw new Error("Not authenticated")

          set({ isLoading: true, error: null })

          // Get current user data
          const { data, error } = await supabase.from("users").select("password_hash").eq("id", currentUser.id).single()

          if (error) throw error

          // Verify current password
          const isValidPassword = bcrypt.compareSync(currentPassword, data.password_hash)
          if (!isValidPassword) {
            throw new Error("Current password is incorrect")
          }

          // Hash new password
          const newPasswordHash = await bcrypt.hash(newPassword, 12)

          // Update password
          const { error: updateError } = await supabase
            .from("users")
            .update({
              password_hash: newPasswordHash,
              password_last_changed: new Date().toISOString(),
              is_first_login: false,
            })
            .eq("id", currentUser.id)

          if (updateError) throw updateError

          set({ isLoading: false })
          return true
        } catch (error: any) {
          console.error("Change password error:", error)
          set({
            error: error.message || "Failed to change password",
            isLoading: false,
          })
          return false
        }
      },

      // Reset password action
      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null })

          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(-8)
          const passwordHash = await bcrypt.hash(tempPassword, 12)

          const { error } = await supabase
            .from("users")
            .update({
              password_hash: passwordHash,
              is_first_login: true,
              password_last_changed: new Date().toISOString(),
            })
            .eq("email", email.toLowerCase())

          if (error) throw error

          // In a real app, you would send this via email
          console.log(`Temporary password for ${email}: ${tempPassword}`)

          set({ isLoading: false })
          return true
        } catch (error: any) {
          console.error("Reset password error:", error)
          set({
            error: error.message || "Failed to reset password",
            isLoading: false,
          })
          return false
        }
      },

      // Get all users action
      getAllUsers: async () => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

          if (error) {
            if (error.code === "42P01" || error.message.includes("does not exist")) {
              console.warn("⚠️ users table not found. Run scripts/create-tables.sql first.")
              set({ users: [], isLoading: false })
              return []
            }
            throw error
          }

          const users = data?.map(mapDbToUser) || []
          set({ users, isLoading: false })
          return users
        } catch (error: any) {
          console.error("Get all users error:", error)
          set({
            error: error.message || "Failed to load users",
            isLoading: false,
          })
          return []
        }
      },

      // Get user by ID action
      getUserById: async (id) => {
        try {
          const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

          if (error) throw error

          return mapDbToUser(data)
        } catch (error: any) {
          console.error("Get user by ID error:", error)
          return null
        }
      },

      // Update user status action
      updateUserStatus: async (id, status) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.from("users").update({ status }).eq("id", id).select().single()

          if (error) throw error

          const updatedUser = mapDbToUser(data)
          set((state) => ({
            users: state.users.map((user) => (user.id === id ? updatedUser : user)),
            isLoading: false,
          }))

          return true
        } catch (error: any) {
          console.error("Update user status error:", error)
          set({
            error: error.message || "Failed to update user status",
            isLoading: false,
          })
          return false
        }
      },

      // Lock user action
      lockUser: async (id, duration = 30) => {
        try {
          set({ isLoading: true, error: null })

          const lockedUntil = new Date(Date.now() + duration * 60 * 1000).toISOString()

          const { data, error } = await supabase
            .from("users")
            .update({ locked_until: lockedUntil })
            .eq("id", id)
            .select()
            .single()

          if (error) throw error

          const updatedUser = mapDbToUser(data)
          set((state) => ({
            users: state.users.map((user) => (user.id === id ? updatedUser : user)),
            isLoading: false,
          }))

          return true
        } catch (error: any) {
          console.error("Lock user error:", error)
          set({
            error: error.message || "Failed to lock user",
            isLoading: false,
          })
          return false
        }
      },

      // Unlock user action
      unlockUser: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("users")
            .update({
              locked_until: null,
              login_attempts: 0,
            })
            .eq("id", id)
            .select()
            .single()

          if (error) throw error

          const updatedUser = mapDbToUser(data)
          set((state) => ({
            users: state.users.map((user) => (user.id === id ? updatedUser : user)),
            isLoading: false,
          }))

          return true
        } catch (error: any) {
          console.error("Unlock user error:", error)
          set({
            error: error.message || "Failed to unlock user",
            isLoading: false,
          })
          return false
        }
      },

      // Initialize store
      initializeStore: async () => {
        await get().getAllUsers()
      },
    }),
    {
      name: "auth-store",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState
      },
    },
  ),
)
