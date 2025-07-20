// app/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useHospitalStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { isInitialized, isLoading: hospitalLoading, initializeStore: initHospitalStore } = useHospitalStore()

  useEffect(() => {
    const initializeApp = async () => {
      if (!isInitialized) {
        await initHospitalStore()
      }
    }
    initializeApp()
  }, [isInitialized, initHospitalStore])

  useEffect(() => {
    if (!authLoading && !hospitalLoading && isInitialized) {
      if (isAuthenticated) {
        console.log("🔄 Redirecting authenticated user to dashboard")
        router.push("/dashboard")
      } else {
        console.log("🔄 Redirecting unauthenticated user to login")
        router.push("/login")
      }
    }
  }, [isAuthenticated, authLoading, hospitalLoading, isInitialized, router])

  // Show a full-page skeleton while the app initializes and redirects
  if (!isInitialized || authLoading || hospitalLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-lg">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  return null // Will redirect once initialized
}
