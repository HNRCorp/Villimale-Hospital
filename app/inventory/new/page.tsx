"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useHospitalStore } from "@/lib/store"
import { toast } from "@/hooks/use-toast"

export default function NewInventoryItemPage() {
  const router = useRouter()
  const { addInventoryItem } = useHospitalStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    currentStock: "",
    minimumStock: "",
    maximumStock: "",
    unitOfMeasure: "",
    unitPrice: "",
    supplier: "",
    location: "",
    expiryDate: "",
    batchNumber: "",
  })

  const categories = [
    "Medications",
    "Medical Supplies",
    "Medical Equipment",
    "Surgical Instruments",
    "Laboratory Supplies",
    "Emergency Supplies",
    "Cleaning Supplies",
    "Office Supplies",
  ]

  const unitsOfMeasure = [
    "pieces",
    "boxes",
    "bottles",
    "tablets",
    "vials",
    "syringes",
    "meters",
    "liters",
    "kilograms",
    "grams",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.category ||
        !formData.currentStock ||
        !formData.minimumStock ||
        !formData.maximumStock ||
        !formData.unitOfMeasure ||
        !formData.unitPrice ||
        !formData.supplier ||
        !formData.location
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const currentStock = Number.parseInt(formData.currentStock)
      const minimumStock = Number.parseInt(formData.minimumStock)
      const maximumStock = Number.parseInt(formData.maximumStock)

      // Determine status based on stock levels
      let status: "In Stock" | "Low Stock" | "Out of Stock" | "Critical" = "In Stock"
      if (currentStock <= 0) {
        status = "Out of Stock"
      } else if (currentStock <= minimumStock * 0.5) {
        status = "Critical"
      } else if (currentStock <= minimumStock) {
        status = "Low Stock"
      }

      addInventoryItem({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        currentStock,
        minimumStock,
        maximumStock,
        unitOfMeasure: formData.unitOfMeasure,
        unitPrice: Number.parseFloat(formData.unitPrice),
        supplier: formData.supplier,
        location: formData.location,
        expiryDate: formData.expiryDate || undefined,
        batchNumber: formData.batchNumber || undefined,
        status,
      })

      toast({
        title: "Success",
        description: "Inventory item added successfully",
      })

      router.push("/inventory")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Inventory Item</h1>
            <p className="text-muted-foreground">Add a new item to the hospital inventory system</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Enter the details for the new inventory item</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              {/* Stock Information */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange("currentStock", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Minimum Stock *</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    min="0"
                    value={formData.minimumStock}
                    onChange={(e) => handleInputChange("minimumStock", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumStock">Maximum Stock *</Label>
                  <Input
                    id="maximumStock"
                    type="number"
                    min="0"
                    value={formData.maximumStock}
                    onChange={(e) => handleInputChange("maximumStock", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
                  <Select
                    value={formData.unitOfMeasure}
                    onValueChange={(value) => handleInputChange("unitOfMeasure", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitsOfMeasure.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing and Supplier */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (MVR) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter storage location"
                  required
                />
              </div>

              {/* Optional Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                    placeholder="Enter batch number"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Adding Item...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Item
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/inventory">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
