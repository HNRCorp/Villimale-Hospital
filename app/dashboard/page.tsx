// app/dashboard/page.tsx
"use client"

import { useEffect } from "react"
import { Layout } from "@/components/layout"
import { DashboardContent } from "@/components/dashboard-content"
import { useHospitalStore } from "@/lib/store"

export default function DashboardPage() {
  const initializeStore = useHospitalStore((state) => state.initializeStore)

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  return (
    <Layout>
      <DashboardContent />
    </Layout>
  )
}
