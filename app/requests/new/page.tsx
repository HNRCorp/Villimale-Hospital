"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Search, AlertTriangle, Package, Save } from "lucide-react"
import Link from "next/link"
import { useHospitalStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface RequestItem {
  itemId: string
  itemName: string
  currentStock: number
  requestedQuantity: number
  unit: string
  urgency: string
  notes?: string
}

export default function NewRequestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { inventoryItems, addRequest } = useHospitalStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [priority, setPriority] = useState("")
  const [justification, setJustification] = useState("")
  const [requestItems, setRequestItems] = useState<RequestItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const departments = [
    "Emergency",
    "ICU",
    "Surgery",
    "Pediatrics",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Radiology",
    "Laboratory",
    "Pharmacy",
    "Anesthesia",
    "Obstetrics",
    "Psychiatry",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "Urology",
    "Oncology",
    "Administration",
  ]

  const priorities = [
    { value: "Low", label: "Low", description: "Can wait 7+ days" },
    { value: "Normal", label: "Normal", description: "Needed within 3-7 days" },
    { value: "High", label: "High", description: "Needed within 1-2 days" },
    { value: "Urgent", label: "Urgent", description: "Needed immediately" },
  ]

  const urgencyLevels = [
    { value: "Low", label: "Low" },
    { value: "Normal", label: "Normal" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ]

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addItemToRequest = (item: any) => {
    const existingItem = requestItems.find((reqItem) => reqItem.itemId === item.id)
    if (existingItem) {
      toast({
        title: "Item Already Added",
        description: "This item is already in your request. You can modify the quantity below.",
        variant: "destructive",
      })
      return
    }

    const newRequestItem: RequestItem = {
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      requestedQuantity: 1,
      unit: item.unitOfMeasure,
      urgency: "Normal",
      notes: "",
    }

    setRequestItems([...requestItems, newRequestItem])
    setSearchTerm("")

    toast({
      title: "Item Added",
      description: `${item.name} has been added to your request.`,
    })
  }

  const updateRequestItem = (itemId: string, field: keyof RequestItem, value: any) => {
    setRequestItems(requestItems.map((item) => (item.itemId === itemId ? { ...item, [field]: value } : item)))
  }

  const removeRequestItem = (itemId: string) => {
    setRequestItems(requestItems.filter((item) => item.itemId !== itemId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDepartment || !priority || !justification.trim() || requestItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      })
      return
    }

    // Validate quantities
    const invalidItems = requestItems.filter(
      (item) => item.requestedQuantity <= 0 || item.requestedQuantity > item.currentStock,
    )

    if (invalidItems.length > 0) {
      toast({
        title: "Invalid Quantities",
        description: "Please check the requested quantities. Some items exceed available stock.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        department: selectedDepartment,
        priority,
        justification,
        items: requestItems,
        requestedBy: "Current User", // This would come from auth context
        status: "Pending",
      }

      addRequest(requestData)

      toast({
        title: "Request Submitted",
        description: "Your inventory request has been submitted successfully.",
      })

      router.push("/requests")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStockStatus = (current: number, requested: number) => {
    if (requested > current) return "insufficient"
    if (current <= 10) return "low"
    return "available"
  }

  const getStockBadge = (current: number, requested: number) => {
    const status = getStockStatus(current, requested)
    switch (status) {
      case "insufficient":
        return <Badge variant="destructive">Insufficient Stock</Badge>
      case "low":
        return (
          <Badge variant="outline" className="text-orange-600">
            Low Stock
          </Badge>
        )
      default:
        return <Badge variant="secondary">Available</Badge>
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/requests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Inventory Request</h1>
            <p className="text-muted-foreground">Submit a request for inventory items from your department</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Provide basic information about your request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
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

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div>
                            <div className="font-medium">{p.label}</div>
                            <div className="text-sm text-muted-foreground">{p.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  placeholder="Please explain why these items are needed..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Items */}
          <Card>
            <CardHeader>
              <CardTitle>Add Items to Request</CardTitle>
              <CardDescription>Search and select items from the inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {searchTerm && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                      <div className="divide-y">
                        {filteredItems.map((item) => (
                          <div key={item.id} className="p-3 hover:bg-muted/50 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {item.sku} | Category: {item.category} | Stock: {item.currentStock}{" "}
                                {item.unitOfMeasure}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStockBadge(item.currentStock, 1)}
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addItemToRequest(item)}
                                disabled={requestItems.some((reqItem) => reqItem.itemId === item.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">No items found matching your search.</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Request Items */}
          {requestItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requested Items ({requestItems.length})</CardTitle>
                <CardDescription>Review and modify your requested items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Available Stock</TableHead>
                        <TableHead>Requested Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestItems.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max={item.currentStock}
                              value={item.requestedQuantity}
                              onChange={(e) =>
                                updateRequestItem(
                                  item.itemId,
                                  "requestedQuantity",
                                  Number.parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Select
                              value={item.urgency}
                              onValueChange={(value) => updateRequestItem(item.itemId, "urgency", value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {urgencyLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Optional notes..."
                              value={item.notes || ""}
                              onChange={(e) => updateRequestItem(item.itemId, "notes", e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>{getStockBadge(item.currentStock, item.requestedQuantity)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRequestItem(item.itemId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Request Summary */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <span className="font-medium">Request Summary</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Items: {requestItems.length} | Total Quantity:{" "}
                      {requestItems.reduce((sum, item) => sum + item.requestedQuantity, 0)}
                    </div>
                  </div>

                  {requestItems.some(
                    (item) => getStockStatus(item.currentStock, item.requestedQuantity) === "insufficient",
                  ) && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Some items have insufficient stock. Please adjust quantities.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/requests">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || requestItems.length === 0} className="min-w-32">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
