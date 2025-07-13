"use client"

import type React from "react"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Trash2, Search, AlertTriangle, Calendar, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospitalStore } from "@/lib/store"

interface ReleaseItem {
  id: string
  itemId: string
  itemName: string
  currentStock: number
  releaseQuantity: number
  unit: string
  batchNumber?: string
  expiryDate?: string
  serialNumber?: string
  notes?: string
}

export default function NewReleasePage() {
  const router = useRouter()
  const inventoryItems = useHospitalStore((state) => state.inventoryItems)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [releaseItems, setReleaseItems] = useState<ReleaseItem[]>([])

  const [formData, setFormData] = useState({
    releaseType: "",
    department: "",
    recipientName: "",
    recipientId: "",
    purpose: "",
    notes: "",
  })

  const releaseTypes = [
    { value: "department_request", label: "Department Request" },
    { value: "emergency", label: "Emergency Release" },
    { value: "transfer", label: "Inter-department Transfer" },
    { value: "maintenance", label: "Equipment Maintenance" },
    { value: "disposal", label: "Disposal/Waste" },
    { value: "return", label: "Return to Supplier" },
  ]

  const departments = [
    "Emergency",
    "Surgery",
    "ICU",
    "Pediatrics",
    "Pharmacy",
    "Radiology",
    "Laboratory",
    "Cardiology",
    "Orthopedics",
    "Obstetrics & Gynecology",
    "Neurology",
    "Oncology",
    "Psychiatry",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "Anesthesiology",
    "Pathology",
    "Physiotherapy",
  ]

  // Filter items that have stock available
  const availableItems = inventoryItems.filter((item) => item.currentStock > 0)

  const filteredItems = availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addReleaseItem = (item: any) => {
    const existingItem = releaseItems.find((ri) => ri.itemId === item.id)
    if (existingItem) {
      setReleaseItems((prev) =>
        prev.map((ri) => (ri.itemId === item.id ? { ...ri, releaseQuantity: ri.releaseQuantity + 1 } : ri)),
      )
    } else {
      const newReleaseItem: ReleaseItem = {
        id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        releaseQuantity: 1,
        unit: item.unitOfMeasure,
        batchNumber: item.batchTracking ? "" : undefined,
        expiryDate: item.expiryTracking ? "" : undefined,
        serialNumber: item.serialTracking ? "" : undefined,
        notes: "",
      }
      setReleaseItems((prev) => [...prev, newReleaseItem])
    }
    setSearchTerm("")
  }

  const updateReleaseItem = (id: string, field: keyof ReleaseItem, value: any) => {
    setReleaseItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeReleaseItem = (id: string) => {
    setReleaseItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getStockStatus = (currentStock: number, releaseQuantity = 1) => {
    if (currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (currentStock < releaseQuantity) {
      return <Badge variant="secondary">Insufficient Stock</Badge>
    } else if (currentStock <= 10) {
      return <Badge variant="outline">Low Stock</Badge>
    }
    return <Badge variant="default">Available</Badge>
  }

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  }

  const validateReleaseItem = (item: ReleaseItem) => {
    const errors = []
    const inventoryItem = inventoryItems.find((inv) => inv.id === item.itemId)

    if (!inventoryItem) return ["Item not found"]

    if (item.releaseQuantity > item.currentStock) {
      errors.push("Release quantity exceeds available stock")
    }

    if (inventoryItem.batchTracking && !item.batchNumber) {
      errors.push("Batch number required")
    }

    if (inventoryItem.expiryTracking && !item.expiryDate) {
      errors.push("Expiry date required")
    }

    if (inventoryItem.serialTracking && !item.serialNumber) {
      errors.push("Serial number required")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.releaseType || !formData.department || !formData.recipientName || !formData.purpose) {
      alert("Please fill in all required fields")
      return
    }

    if (releaseItems.length === 0) {
      alert("Please add at least one item to release")
      return
    }

    // Validate all release items
    const validationErrors = []
    for (const item of releaseItems) {
      const errors = validateReleaseItem(item)
      if (errors.length > 0) {
        validationErrors.push(`${item.itemName}: ${errors.join(", ")}`)
      }
    }

    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`)
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const releaseId = `REL${Date.now().toString().slice(-6)}`

      const newRelease = {
        id: releaseId,
        ...formData,
        items: releaseItems,
        releaseDate: new Date().toISOString().split("T")[0],
        status: "Completed",
        totalItems: releaseItems.reduce((sum, item) => sum + item.releaseQuantity, 0),
        releasedBy: "Current User", // In real app, get from auth context
      }

      console.log("New Release Created:", newRelease)

      alert(`Release ${releaseId} completed successfully!`)
      router.push("/releases")
    } catch (error) {
      console.error("Error processing release:", error)
      alert("Error processing release. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/releases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Item Release</h1>
            <p className="text-muted-foreground">Release inventory items to departments or external parties</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Release Information */}
            <Card>
              <CardHeader>
                <CardTitle>Release Information</CardTitle>
                <CardDescription>Basic release details and recipient information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseType">Release Type *</Label>
                    <Select
                      value={formData.releaseType}
                      onValueChange={(value) => handleFormChange("releaseType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleFormChange("department", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => handleFormChange("recipientName", e.target.value)}
                      placeholder="Full name of recipient"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientId">Recipient ID</Label>
                    <Input
                      id="recipientId"
                      value={formData.recipientId}
                      onChange={(e) => handleFormChange("recipientId", e.target.value)}
                      placeholder="Employee ID or badge number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => handleFormChange("purpose", e.target.value)}
                    placeholder="Explain the purpose of this release..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    placeholder="Any additional information..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Item Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Items</CardTitle>
                <CardDescription>Search and add items to release</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search available items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.name}</h4>
                                {getStockStatus(item.currentStock, 1)}
                                {item.expiryTracking && (
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Expiry Tracked
                                  </Badge>
                                )}
                                {item.batchTracking && (
                                  <Badge variant="outline" className="text-xs">
                                    <Package className="h-3 w-3 mr-1" />
                                    Batch Tracked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.id} • {item.category} • SKU: {item.sku}
                              </p>
                              <p className="text-sm">
                                Available: {item.currentStock} {item.unitOfMeasure}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => addReleaseItem(item)}
                              disabled={releaseItems.some((ri) => ri.itemId === item.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {releaseItems.some((ri) => ri.itemId === item.id) ? "Added" : "Add"}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No available items found matching "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                )}

                {!searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start typing to search for items</p>
                    <p className="text-sm">Only items with available stock are shown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Release Items Table */}
          {releaseItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Items to Release ({releaseItems.length})</CardTitle>
                <CardDescription>Review and provide tracking information for release items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Release Qty</TableHead>
                        <TableHead>Batch #</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Serial #</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releaseItems.map((item) => {
                        const inventoryItem = inventoryItems.find((inv) => inv.id === item.itemId)
                        const validationErrors = validateReleaseItem(item)

                        return (
                          <TableRow key={item.id} className={validationErrors.length > 0 ? "bg-red-50" : ""}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.itemName}</p>
                                <p className="text-sm text-muted-foreground">{item.itemId}</p>
                                {validationErrors.length > 0 && (
                                  <p className="text-xs text-red-600 mt-1">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    {validationErrors.join(", ")}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={item.currentStock < item.releaseQuantity ? "text-red-600" : ""}>
                                {item.currentStock} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                max={item.currentStock}
                                value={item.releaseQuantity}
                                onChange={(e) =>
                                  updateReleaseItem(item.id, "releaseQuantity", Number.parseInt(e.target.value) || 1)
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              {inventoryItem?.batchTracking ? (
                                <Input
                                  placeholder="Batch #"
                                  value={item.batchNumber || ""}
                                  onChange={(e) => updateReleaseItem(item.id, "batchNumber", e.target.value)}
                                  className="w-24"
                                  required
                                />
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {inventoryItem?.expiryTracking ? (
                                <div className="space-y-1">
                                  <Input
                                    type="date"
                                    value={item.expiryDate || ""}
                                    onChange={(e) => updateReleaseItem(item.id, "expiryDate", e.target.value)}
                                    className="w-32"
                                    required
                                  />
                                  {item.expiryDate && isExpiringSoon(item.expiryDate) && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Expiring Soon
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {inventoryItem?.serialTracking ? (
                                <Input
                                  placeholder="Serial #"
                                  value={item.serialNumber || ""}
                                  onChange={(e) => updateReleaseItem(item.id, "serialNumber", e.target.value)}
                                  className="w-24"
                                  required
                                />
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Notes..."
                                value={item.notes || ""}
                                onChange={(e) => updateReleaseItem(item.id, "notes", e.target.value)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeReleaseItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Items:</span>{" "}
                      {releaseItems.reduce((sum, item) => sum + item.releaseQuantity, 0)}
                    </div>
                    <div>
                      <span className="font-medium">Unique Items:</span> {releaseItems.length}
                    </div>
                    <div>
                      <span className="font-medium">Batch Tracked:</span>{" "}
                      {
                        releaseItems.filter((item) => {
                          const inv = inventoryItems.find((i) => i.id === item.itemId)
                          return inv?.batchTracking
                        }).length
                      }
                    </div>
                    <div>
                      <span className="font-medium">Expiry Tracked:</span>{" "}
                      {
                        releaseItems.filter((item) => {
                          const inv = inventoryItems.find((i) => i.id === item.itemId)
                          return inv?.expiryTracking
                        }).length
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/releases">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || releaseItems.length === 0}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Processing Release...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Complete Release ({releaseItems.length} items)
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
