"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useHospitalStore } from "@/lib/store"
import { LandingPage } from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, initializeStore: initAuthStore, loading: authLoading } = useAuthStore()
  const { loadInventoryItems, loadRequests, loadOrders, loadReleases } = useHospitalStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize auth store first
        await initAuthStore()

        // Load all data
        await Promise.all([loadInventoryItems(), loadRequests(), loadOrders(), loadReleases()])

        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing app:", error)
        setIsInitialized(true) // Still set to true to show the UI
      }
    }

    initialize()
  }, [initAuthStore, loadInventoryItems, loadRequests, loadOrders, loadReleases])

  useEffect(() => {
    if (isInitialized && isAuthenticated && !authLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, isInitialized, authLoading])

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
        <span className="sr-only">Loading…</span>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return <LandingPage />
}
