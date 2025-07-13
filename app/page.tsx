"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { LandingPage } from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, initializeStore } = useAuthStore()

  useEffect(() => {
    // Initialize the store when the app loads
    initializeStore()

    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, initializeStore])

  if (isAuthenticated) {
    return null // Will redirect
  }

  return <LandingPage />
}
