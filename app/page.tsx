"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useHospitalStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useAuthStore()
  const { isInitialized, initializeStore } = useHospitalStore()

  useEffect(() => {
    const initApp = async () => {
      if (!isInitialized) {
        await initializeStore()
      }
      if (isAuthenticated && currentUser) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
    initApp()
  }, [isAuthenticated, currentUser, isInitialized, initializeStore, router])

  // Show a full-page skeleton while the app initializes and redirects
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
