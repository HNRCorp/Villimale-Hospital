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
import { ArrowLeft, Save, Plus, Trash2, Search, Calculator, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospitalStore } from "@/lib/store"

interface OrderItem {
  id: string
  itemId: string
  itemName: string
  currentStock: number
  minimumStock: number
  orderQuantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  notes?: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  paymentTerms: string
}

export default function NewOrderPage() {
  const router = useRouter()
  const inventoryItems = useHospitalStore((state) => state.inventoryItems)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const [formData, setFormData] = useState({
    orderType: "",
    supplier: "",
    priority: "Normal" as "Low" | "Normal" | "High" | "Urgent",
    expectedDelivery: "",
    shippingAddress: "",
    paymentTerms: "",
    notes: "",
  })

  const suppliers: Supplier[] = [
    {
      id: "SUP001",
      name: "MedSupply Co.",
      contact: "John Smith",
      email: "orders@medsupply.com",
      phone: "+960-123-4567",
      address: "Male, Maldives",
      paymentTerms: "Net 30",
    },
    {
      id: "SUP002",
      name: "SafeGuard Medical",
      contact: "Sarah Johnson",
      email: "sales@safeguard.com",
      phone: "+960-234-5678",
      address: "Hulhumale, Maldives",
      paymentTerms: "Net 15",
    },
    {
      id: "SUP003",
      name: "MedTech Solutions",
      contact: "Michael Chen",
      email: "info@medtech.com",
      phone: "+960-345-6789",
      address: "Villingili, Maldives",
      paymentTerms: "COD",
    },
    {
      id: "SUP004",
      name: "PharmaCorp",
      contact: "Lisa Wong",
      email: "orders@pharmacorp.com",
      phone: "+960-456-7890",
      address: "Addu City, Maldives",
      paymentTerms: "Net 45",
    },
  ]

  const orderTypes = [
    { value: "regular", label: "Regular Order" },
    { value: "emergency", label: "Emergency Order" },
    { value: "bulk", label: "Bulk Purchase" },
    { value: "special", label: "Special Order" },
    { value: "trial", label: "Trial/Sample Order" },
  ]

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplier)

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addOrderItem = (item: any) => {
    const existingItem = orderItems.find((oi) => oi.itemId === item.id)
    if (existingItem) {
      const newQuantity = existingItem.orderQuantity + getSuggestedQuantity(item)
      setOrderItems((prev) =>
        prev.map((oi) =>
          oi.itemId === item.id
            ? {
                ...oi,
                orderQuantity: newQuantity,
                totalPrice: newQuantity * oi.unitPrice,
              }
            : oi,
        ),
      )
    } else {
      const suggestedQuantity = getSuggestedQuantity(item)
      const newOrderItem: OrderItem = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        orderQuantity: suggestedQuantity,
        unit: item.unitOfMeasure,
        unitPrice: item.unitPrice,
        totalPrice: suggestedQuantity * item.unitPrice,
        notes: "",
      }
      setOrderItems((prev) => [...prev, newOrderItem])
    }
    setSearchTerm("")
  }

  const getSuggestedQuantity = (item: any) => {
    const deficit = Math.max(0, item.minimumStock - item.currentStock)
    const reorderAmount = item.reorderPoint || item.minimumStock
    return Math.max(deficit, reorderAmount)
  }

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "orderQuantity" || field === "unitPrice") {
            updatedItem.totalPrice = updatedItem.orderQuantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const removeOrderItem = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (currentStock <= minimumStock * 0.5) {
      return <Badge variant="destructive">Critical</Badge>
    } else if (currentStock <= minimumStock) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "High":
        return <Badge className="bg-orange-600">High</Badge>
      case "Normal":
        return <Badge variant="outline">Normal</Badge>
      case "Low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.orderType || !formData.supplier || !formData.expectedDelivery) {
      alert("Please fill in all required fields")
      return
    }

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order")
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const orderId = `ORD${Date.now().toString().slice(-6)}`

      const newOrder = {
        id: orderId,
        ...formData,
        supplier: selectedSupplier,
        items: orderItems,
        orderDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        totalItems: orderItems.reduce((sum, item) => sum + item.orderQuantity, 0),
        totalValue: calculateOrderTotal(),
        orderedBy: "Current User",
      }

      console.log("New Order Created:", newOrder)

      alert(`Order ${orderId} created successfully!`)
      router.push("/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error creating order. Please try again.")
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
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Purchase Order</h1>
            <p className="text-muted-foreground">Create a new order for inventory items</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
                <CardDescription>Basic order details and delivery information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Order Type *</Label>
                    <Select
                      value={formData.orderType}
                      onValueChange={(value) => handleFormChange("orderType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleFormChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={formData.supplier} onValueChange={(value) => handleFormChange("supplier", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSupplier && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium">Supplier Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedSupplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedSupplier.email}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Contact:</span> {selectedSupplier.contact}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Address:</span> {selectedSupplier.address}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Payment Terms:</span> {selectedSupplier.paymentTerms}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedDelivery">Expected Delivery *</Label>
                    <Input
                      id="expectedDelivery"
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={(e) => handleFormChange("expectedDelivery", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={formData.paymentTerms}
                      onValueChange={(value) => handleFormChange("paymentTerms", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                        <SelectItem value="Net 15">Net 15 Days</SelectItem>
                        <SelectItem value="Net 30">Net 30 Days</SelectItem>
                        <SelectItem value="Net 45">Net 45 Days</SelectItem>
                        <SelectItem value="Net 60">Net 60 Days</SelectItem>
                        <SelectItem value="Advance">Advance Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => handleFormChange("shippingAddress", e.target.value)}
                    placeholder="Delivery address (leave blank for default hospital address)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    placeholder="Special instructions or notes..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Item Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Items</CardTitle>
                <CardDescription>Search and add items to your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        const suggestedQty = getSuggestedQuantity(item)
                        return (
                          <div
                            key={item.id}
                            className="p-3 border rounded-lg hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{item.name}</h4>
                                  {getStockStatus(item.currentStock, item.minimumStock)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.id} • {item.category} • SKU: {item.sku}
                                </p>
                                <div className="flex items-center gap-4 text-sm mt-1">
                                  <span>
                                    Stock: {item.currentStock} {item.unitOfMeasure}
                                  </span>
                                  <span>Min: {item.minimumStock}</span>
                                  <span className="font-medium">Price: ${item.unitPrice}</span>
                                </div>
                                {suggestedQty > 0 && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    <Calculator className="h-3 w-3 inline mr-1" />
                                    Suggested order: {suggestedQty} {item.unitOfMeasure}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addOrderItem(item)}
                                disabled={orderItems.some((oi) => oi.itemId === item.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                {orderItems.some((oi) => oi.itemId === item.id) ? "Added" : "Add"}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No items found matching "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                )}

                {!searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start typing to search for items</p>
                    <p className="text-sm">Items with low stock will show suggested quantities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items Table */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({orderItems.length})</CardTitle>
                <CardDescription>Review quantities and pricing for your order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Order Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-sm text-muted-foreground">{item.itemId}</p>
                              {getStockStatus(item.currentStock, item.minimumStock)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {item.currentStock} {item.unit}
                              </div>
                              <div className="text-muted-foreground">Min: {item.minimumStock}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.orderQuantity}
                              onChange={(e) =>
                                updateOrderItem(item.id, "orderQuantity", Number.parseInt(e.target.value) || 1)
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateOrderItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Notes..."
                              value={item.notes || ""}
                              onChange={(e) => updateOrderItem(item.id, "notes", e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOrderItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Items:</span>{" "}
                      {orderItems.reduce((sum, item) => sum + item.orderQuantity, 0)}
                    </div>
                    <div>
                      <span className="font-medium">Unique Items:</span> {orderItems.length}
                    </div>
                    <div>
                      <span className="font-medium">Order Priority:</span> {getPriorityBadge(formData.priority)}
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-lg">Total Value: ${calculateOrderTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/orders">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || orderItems.length === 0}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Creating Order...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Order (${calculateOrderTotal().toFixed(2)})
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
