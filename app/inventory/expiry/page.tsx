"use client"

import { useState, useMemo } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertTriangle,
  Calendar,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useHospitalStore } from "@/lib/store"

interface ExpiryItem {
  id: string
  name: string
  category: string
  batchNumber: string
  expiryDate: string
  currentStock: number
  unitOfMeasure: string
  unitPrice: number
  location: string
  supplier: string
  daysUntilExpiry: number
  status: "expired" | "critical" | "expiring_soon" | "monitor" | "good"
  valueAtRisk: number
}

export default function ExpiryTrackingPage() {
  const inventoryItems = useHospitalStore((state) => state.inventoryItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("expiry_date")

  // Generate mock expiry data based on inventory items
  const expiryItems: ExpiryItem[] = useMemo(() => {
    const today = new Date()

    return inventoryItems
      .filter((item) => item.expiryTracking && item.currentStock > 0)
      .flatMap((item) => {
        // Generate 1-3 batches per item with different expiry dates
        const batchCount = Math.floor(Math.random() * 3) + 1
        return Array.from({ length: batchCount }, (_, index) => {
          const daysFromNow = Math.floor(Math.random() * 365) - 30 // -30 to 335 days
          const expiryDate = new Date(today)
          expiryDate.setDate(today.getDate() + daysFromNow)

          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          let status: ExpiryItem["status"]
          if (daysUntilExpiry < 0) status = "expired"
          else if (daysUntilExpiry <= 7) status = "critical"
          else if (daysUntilExpiry <= 30) status = "expiring_soon"
          else if (daysUntilExpiry <= 90) status = "monitor"
          else status = "good"

          const batchStock =
            Math.floor(item.currentStock / batchCount) + (index === 0 ? item.currentStock % batchCount : 0)

          return {
            id: `${item.id}_batch_${index + 1}`,
            name: item.name,
            category: item.category,
            batchNumber: `B${Date.now().toString().slice(-6)}${index + 1}`,
            expiryDate: expiryDate.toISOString().split("T")[0],
            currentStock: batchStock,
            unitOfMeasure: item.unitOfMeasure,
            unitPrice: item.unitPrice,
            location: item.location,
            supplier: `Supplier ${Math.floor(Math.random() * 5) + 1}`,
            daysUntilExpiry,
            status,
            valueAtRisk: batchStock * item.unitPrice,
          }
        })
      })
  }, [inventoryItems])

  const filteredItems = expiryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "expiry_date":
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      case "days_until_expiry":
        return a.daysUntilExpiry - b.daysUntilExpiry
      case "value_at_risk":
        return b.valueAtRisk - a.valueAtRisk
      case "name":
        return a.name.localeCompare(b.name)
      case "category":
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const categories = Array.from(new Set(expiryItems.map((item) => item.category)))

  const getStatusBadge = (status: ExpiryItem["status"], daysUntilExpiry: number) => {
    switch (status) {
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired ({Math.abs(daysUntilExpiry)} days ago)
          </Badge>
        )
      case "critical":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Critical ({daysUntilExpiry} days)
          </Badge>
        )
      case "expiring_soon":
        return (
          <Badge className="bg-orange-600 gap-1">
            <Clock className="h-3 w-3" />
            Expiring Soon ({daysUntilExpiry} days)
          </Badge>
        )
      case "monitor":
        return (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Monitor ({daysUntilExpiry} days)
          </Badge>
        )
      case "good":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Good ({daysUntilExpiry} days)
          </Badge>
        )
    }
  }

  const getStatusCounts = () => {
    return {
      expired: expiryItems.filter((item) => item.status === "expired").length,
      critical: expiryItems.filter((item) => item.status === "critical").length,
      expiring_soon: expiryItems.filter((item) => item.status === "expiring_soon").length,
      monitor: expiryItems.filter((item) => item.status === "monitor").length,
      good: expiryItems.filter((item) => item.status === "good").length,
    }
  }

  const getTotalValueAtRisk = () => {
    return expiryItems
      .filter((item) => item.status === "expired" || item.status === "critical" || item.status === "expiring_soon")
      .reduce((sum, item) => sum + item.valueAtRisk, 0)
  }

  const statusCounts = getStatusCounts()
  const totalValueAtRisk = getTotalValueAtRisk()

  const handleAction = (action: string, itemId: string) => {
    // In a real app, these would make API calls
    switch (action) {
      case "dispose":
        alert(`Disposing item ${itemId}`)
        break
      case "transfer":
        alert(`Transferring item ${itemId}`)
        break
      case "reorder":
        alert(`Reordering item ${itemId}`)
        break
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expiry Date Tracking</h1>
            <p className="text-muted-foreground">Monitor and manage items approaching expiry dates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{statusCounts.expiring_soon}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Monitor</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.monitor}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Value at Risk</p>
                  <p className="text-2xl font-bold text-green-600">${totalValueAtRisk.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items, batches, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiry_date">Expiry Date</SelectItem>
                  <SelectItem value="days_until_expiry">Days Until Expiry</SelectItem>
                  <SelectItem value="value_at_risk">Value at Risk</SelectItem>
                  <SelectItem value="name">Item Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Expiry Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Expiry Tracking ({sortedItems.length} items)</CardTitle>
            <CardDescription>Items with expiry date tracking and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Details</TableHead>
                    <TableHead>Batch Information</TableHead>
                    <TableHead>Stock & Value</TableHead>
                    <TableHead>Expiry Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.length > 0 ? (
                    sortedItems.map((item) => (
                      <TableRow key={item.id} className={item.status === "expired" ? "bg-red-50" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <p className="text-xs text-muted-foreground">Supplier: {item.supplier}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Package className="h-3 w-3" />
                              <span className="text-sm font-medium">{item.batchNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm">{item.expiryDate}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {item.currentStock} {item.unitOfMeasure}
                            </p>
                            <p className="text-sm font-medium">${item.valueAtRisk.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">${item.unitPrice}/unit</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status, item.daysUntilExpiry)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{item.location}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {(item.status === "expired" || item.status === "critical") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction("dispose", item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Dispose
                              </Button>
                            )}
                            {item.status === "expiring_soon" && (
                              <Button variant="outline" size="sm" onClick={() => handleAction("transfer", item.id)}>
                                Transfer
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleAction("reorder", item.id)}>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reorder
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No items found matching your criteria</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
