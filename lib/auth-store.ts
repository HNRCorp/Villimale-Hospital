import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import type { User, UserRole } from "./types" // Assuming types are defined here

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: () => boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  createUser: (userData: Partial<User>) => Promise<void>
  fetchUsers: () => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  roles: UserRole[]
  initializeStore: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      roles: ["System Administrator", "Inventory Manager", "Doctor", "Nurse", "Pharmacist"],

      isAuthenticated: () => {
        const { user, token } = get()
        return !!user && !!token
      },

      initializeStore: async () => {
        // This function is called on app load to rehydrate the store
        // and potentially fetch initial user data if needed.
        // For now, it just ensures the store is ready.
        console.log("Auth store initialized.")
        // You might want to re-fetch user data from Supabase here if the token is valid
        // to ensure the user object is always fresh.
      },

      login: async (email, password) => {
        const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

        if (error || !data) {
          throw new Error("Login error: Invalid credentials or user not found.")
        }

        const user = data as User
        const isPasswordValid = bcrypt.compareSync(password, user.passwordHash) // Use compareSync

        if (!isPasswordValid) {
          throw new Error("Login error: Invalid password.")
        }

        if (user.status === "inactive") {
          throw new Error("Login error: Account is inactive. Please contact administrator.")
        }

        // Simulate token generation (Supabase auth would provide a real token)
        const token = `mock-token-${user.id}`

        set({ user, token })
        console.log("User logged in:", user.email)
      },

      logout: () => {
        set({ user: null, token: null })
        console.log("User logged out.")
      },

      createUser: async (userData) => {
        if (!get().isAuthenticated() || get().user?.role !== "System Administrator") {
          throw new Error("Unauthorized: Only System Administrators can create users.")
        }

        if (!userData.password) {
          throw new Error("Password is required to create a user.")
        }

        const passwordHash = bcrypt.hashSync(userData.password, 10) // Hash password synchronously

        const { data, error } = await supabase
          .from("users")
          .insert({
            ...userData,
            passwordHash,
            firstLogin: true, // Ensure firstLogin is set for new users
            status: userData.status || "active",
            permissions: userData.permissions || [],
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Error creating user: ${error.message}`)
        }

        set((state) => ({ users: [...state.users, data as User] }))
        console.log("User created:", data.email)
      },

      fetchUsers: async () => {
        if (!get().isAuthenticated() || get().user?.role !== "System Administrator") {
          // Optionally, throw an error or return empty array if not authorized
          console.warn("Unauthorized attempt to fetch users.")
          set({ users: [] })
          return
        }

        const { data, error } = await supabase.from("users").select("*")

        if (error) {
          console.error("Error fetching users:", error.message)
          throw new Error(`Error fetching users: ${error.message}`)
        }

        set({ users: data as User[] })
        console.log("Users fetched:", data.length)
      },

      updateUser: async (userId, updates) => {
        if (!get().isAuthenticated()) {
          throw new Error("Unauthorized: Must be logged in to update users.")
        }

        const currentUser = get().user
        if (currentUser?.role !== "System Administrator" && currentUser?.id !== userId) {
          throw new Error("Unauthorized: You can only update your own profile or be an admin.")
        }

        const updatePayload: Partial<User> = { ...updates }
        if (updates.password) {
          updatePayload.passwordHash = bcrypt.hashSync(updates.password, 10)
          delete updatePayload.password // Remove plain password
        }

        const { data, error } = await supabase.from("users").update(updatePayload).eq("id", userId).select().single()

        if (error) {
          throw new Error(`Error updating user: ${error.message}`)
        }

        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? (data as User) : u)),
          user: currentUser?.id === userId ? (data as User) : currentUser, // Update current user if it's them
        }))
        console.log("User updated:", data.email)
      },

      deleteUser: async (userId) => {
        if (!get().isAuthenticated() || get().user?.role !== "System Administrator") {
          throw new Error("Unauthorized: Only System Administrators can delete users.")
        }

        const { error } = await supabase.from("users").delete().eq("id", userId)

        if (error) {
          throw new Error(`Error deleting user: ${error.message}`)
        }

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))
        console.log("User deleted:", userId)
      },

      changePassword: async (userId, oldPassword, newPassword) => {
        const { user, updateUser } = get()
        if (!user || user.id !== userId) {
          throw new Error("Unauthorized: Cannot change password for another user.")
        }

        const { data, error: fetchError } = await supabase
          .from("users")
          .select("passwordHash")
          .eq("id", userId)
          .single()

        if (fetchError || !data) {
          throw new Error("Error fetching user password hash.")
        }

        const isOldPasswordValid = bcrypt.compareSync(oldPassword, data.passwordHash)
        if (!isOldPasswordValid) {
          throw new Error("Invalid old password.")
        }

        const newPasswordHash = bcrypt.hashSync(newPassword, 10)
        await updateUser(userId, { passwordHash: newPasswordHash, firstLogin: false })
        console.log("Password changed for user:", user.email)
      },

      resetPassword: async (email) => {
        // This would typically involve sending an email with a reset link
        // For now, we'll just simulate it or log the new password for testing
        console.log(`Password reset requested for ${email}. (Not implemented: email sending)`)
        // In a real app, you'd use Supabase's auth.api.resetPasswordForEmail
        // or a similar service.
        throw new Error("Password reset functionality is not fully implemented yet.")
      },
    }),
    {
      name: "auth-storage", // unique name
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ user: state.user, token: state.token }), // Only persist user and token
      onRehydrateStorage: (state) => {
        console.log("Auth store rehydrating...")
        return (state, error) => {
          if (error) {
            console.error("Auth store rehydration failed:", error)
          } else {
            console.log("Auth store rehydrated.")
            // Optionally, re-initialize after rehydration
            state?.initializeStore()
          }
        }
      },
      version: 1, // Version for migrations
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migration from version 0 to 1
          // Ensure passwordHash is not directly stored in persistedState.user
          if (persistedState && (persistedState as any).user && (persistedState as any).user.passwordHash) {
            delete (persistedState as any).user.passwordHash
          }
        }
        return persistedState as AuthState
      },
    },
  ),
)

// Initialize the store on app load
// This ensures the store is ready and rehydrated when the app starts
useAuthStore.getState().initializeStore()
