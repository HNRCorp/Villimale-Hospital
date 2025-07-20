// lib/auth-store.ts
"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { UserProfile, UserRole } from "./types"
import {
  loginUser,
  registerUser,
  changeUserPassword,
  resetUserPassword,
  fetchUsersServer,
  updateUserServer,
  deleteUserServer,
} from "@/app/auth/actions"

interface AuthState {
  currentUser: UserProfile | null
  isAuthenticated: boolean
  loginError: string | null
  roles: UserRole[]
  isLoading: boolean // Add loading state for auth operations
}

interface AuthActions {
  initializeStore: () => Promise<void>
  login: (employeeId: string, password: string) => Promise<boolean>
  logout: () => void
  register: (
    userData: Omit<UserProfile, "id" | "createdAt" | "status" | "firstLogin" | "lastLogin"> & { password: string },
  ) => Promise<{ success: boolean; message: string }>
  changePassword: (
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>
  resetPassword: (employeeId: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  // User management actions (for admin views, etc.)
  fetchUsers: () => Promise<UserProfile[]>
  updateUser: (userId: string, updates: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      loginError: null,
      roles: ["admin", "doctor", "nurse", "pharmacist", "staff"], // Use lowercase roles for consistency
      isLoading: false,

      initializeStore: async () => {
        console.log("Auth store initialized.")
        // No direct Supabase calls or bcrypt here.
        // If currentUser exists from persistence, it's considered valid until logout or session invalidation.
      },

      login: async (employeeId, password) => {
        set({ isLoading: true, loginError: null })
        const result = await loginUser(employeeId, password)
        if (result.success && result.user) {
          set({ currentUser: result.user, isAuthenticated: true, isLoading: false })
          console.log("User logged in:", result.user.email)
          return true
        } else {
          set({ loginError: result.error || "Login failed.", isLoading: false })
          return false
        }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, loginError: null })
        console.log("User logged out.")
      },

      register: async (userData) => {
        set({ isLoading: true })
        const result = await registerUser(userData)
        set({ isLoading: false })
        return result
      },

      changePassword: async (userId, oldPassword, newPassword) => {
        set({ isLoading: true })
        const result = await changeUserPassword(userId, oldPassword, newPassword)
        if (result.success) {
          // If current user changed their own password, update firstLogin status
          set((state) => {
            if (state.currentUser?.id === userId) {
              return { currentUser: { ...state.currentUser, firstLogin: false } }
            }
            return {}
          })
        }
        set({ isLoading: false })
        return result
      },

      resetPassword: async (employeeId, newPassword) => {
        set({ isLoading: true })
        const result = await resetUserPassword(employeeId, newPassword)
        set({ isLoading: false })
        return result
      },

      fetchUsers: async () => {
        set({ isLoading: true })
        const result = await fetchUsersServer()
        set({ isLoading: false })
        if (result.users) {
          return result.users
        } else {
          console.error("Error fetching users:", result.error)
          return []
        }
      },

      updateUser: async (userId, updates) => {
        set({ isLoading: true })
        const result = await updateUserServer(userId, updates)
        if (result.success) {
          // If the current user was updated, update the store's currentUser
          set((state) => {
            if (state.currentUser?.id === userId) {
              return { currentUser: { ...state.currentUser, ...updates } }
            }
            return {}
          })
        }
        set({ isLoading: false })
        return result
      },

      deleteUser: async (userId) => {
        set({ isLoading: true })
        const result = await deleteUserServer(userId)
        set({ isLoading: false })
        return result
      },
    }),
    {
      name: "auth-store", // unique name for this store in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log("Auth store rehydrating...")
        // No 'set' call here, just return the rehydration function
        return (_persistedState, error) => {
          if (error) {
            console.error("Auth store rehydration failed:", error)
          } else {
            console.log("Auth store rehydrated.")
          }
        }
      },
      version: 1, // Version for migrations
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migration from version 0 to 1: ensure passwordHash is not persisted
          if (
            persistedState &&
            (persistedState as any).currentUser &&
            (persistedState as any).currentUser.passwordHash
          ) {
            delete (persistedState as any).currentUser.passwordHash
          }
        }
        return persistedState as AuthState & AuthActions
      },
    },
  ),
)

// Initialize the store on app load
useAuthStore.getState().initializeStore()
