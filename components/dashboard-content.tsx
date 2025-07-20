// components/dashboard-content.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Users, AlertTriangle, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { useHospitalStore } from "@/lib/store"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardContent() {
  const { inventoryItems = [], users = [], requests = [], isLoading } = useHospitalStore()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[250px]" />
          <Skeleton className="col-span-3 h-[250px]" />
        </div>
        <Skeleton className="h-[150px] w-full" />
      </div>
    )
  }

  // Calculate statistics
  const totalItems = inventoryItems.length
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "Low Stock" || item.status === "Critical",
  ).length
  const totalUsers = users.filter((user) => user.status === "Active").length
  const pendingRequests = requests.filter((request) => request.status === "Pending").length
  const urgentRequests = requests.filter((request) => request.priority === "Urgent").length

  // Recent requests for display
  const recentRequests = requests.slice(0, 5)

  // Critical stock items for alerts
  const criticalItems = inventoryItems.filter((item) => item.status === "Critical").slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">{lowStockItems} items need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">{urgentRequests} urgent requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below minimum stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Requests */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest inventory requests from departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{request.department}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.items.length} items • {request.requestedBy}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        request.priority === "Urgent"
                          ? "destructive"
                          : request.priority === "High"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {request.priority}
                    </Badge>
                    <Badge
                      variant={
                        request.status === "Pending"
                          ? "outline"
                          : request.status === "Approved"
                            ? "default"
                            : request.status === "Rejected"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentRequests.length === 0 && <p className="text-sm text-muted-foreground">No recent requests</p>}
            </div>
          </CardContent>
        </Card>

        {/* Critical Stock Items */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Critical Stock Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {item.currentStock} {item.unitOfMeasure}
                    </p>
                  </div>
                  <Badge variant="destructive">{item.status}</Badge>
                </div>
              ))}
              {criticalItems.length === 0 && <p className="text-sm text-muted-foreground">No critical stock alerts</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-auto p-4">
              <Link href="/requests/new" className="flex flex-col items-center space-y-2">
                <Clock className="h-6 w-6" />
                <span>New Request</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/inventory/add-stock" className="flex flex-col items-center space-y-2">
                <Package className="h-6 w-6" />
                <span>Add Stock</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/releases/new" className="flex flex-col items-center space-y-2">
                <CheckCircle className="h-6 w-6" />
                <span>Release Items</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/orders/new" className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>New Order</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
