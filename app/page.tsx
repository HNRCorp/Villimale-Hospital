"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useHospitalStore } from "@/lib/store"
import { LandingPage } from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, initializeStore: initAuthStore, isLoading: authLoading } = useAuthStore()
  const { initializeStore: initHospitalStore, isLoading: hospitalLoading } = useHospitalStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("🚀 Initializing application stores...")

        // Initialize both stores in parallel
        await Promise.all([initAuthStore(), initHospitalStore()])

        console.log("✅ Application stores initialized successfully")
        setIsInitialized(true)
      } catch (error) {
        console.error("❌ Error initializing application:", error)
        setInitError(error instanceof Error ? error.message : "Unknown initialization error")
        setIsInitialized(true) // Still set to true to show the UI
      }
    }

    initialize()
  }, [initAuthStore, initHospitalStore])

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isInitialized && isAuthenticated && !authLoading) {
      console.log("🔄 Redirecting authenticated user to dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, isInitialized, authLoading])

  // Show loading state while initializing
  if (!isInitialized || authLoading || hospitalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Initializing Hospital Inventory System</p>
            <p className="text-sm text-gray-600">Loading data and connecting to database...</p>
            {initError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">Warning: {initError}</p>}
          </div>
        </div>
      </div>
    )
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return <LandingPage />
}
