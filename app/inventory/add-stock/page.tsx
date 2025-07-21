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
import { ArrowLeft, Save, Plus, Trash2, Search, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospitalStore } from "@/lib/store"

interface StockEntry {
  id: string
  itemId: string
  itemName: string
  quantity: number
  batchNumber: string
  expiryDate: string
  supplierLotNumber: string
}

export default function AddStockPage() {
  const router = useRouter()
  const inventoryItems = useHospitalStore((state) => state.inventoryItems)
  const addStock = useHospitalStore((state) => state.addStock)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([])

  const suppliers = [
    { id: "SUP001", name: "MedSupply Co." },
    { id: "SUP002", name: "SafeGuard Medical" },
    { id: "SUP003", name: "PharmaCorp" },
    { id: "SUP004", name: "MedTech Solutions" },
  ]

  const [stockForm, setStockForm] = useState({
    quantity: "",
    batchNumber: "",
    expiryDate: "",
    supplierLotNumber: "",
    supplier: "",
    notes: "",
  })

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleItemSelect = (item: any) => {
    setSelectedItem(item)
    setStockForm((prev) => ({
      ...prev,
      supplier: item.supplier,
    }))
  }

  const handleStockFormChange = (field: string, value: string) => {
    setStockForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addStockEntry = () => {
    if (!selectedItem || !stockForm.quantity) return

    const quantity = Number.parseInt(stockForm.quantity)

    const newEntry: StockEntry = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity,
      batchNumber: stockForm.batchNumber,
      expiryDate: stockForm.expiryDate,
      supplierLotNumber: stockForm.supplierLotNumber,
    }

    setStockEntries((prev) => [...prev, newEntry])

    // Reset form but keep item selected
    setStockForm((prev) => ({
      quantity: "",
      batchNumber: "",
      expiryDate: "",
      supplierLotNumber: "",
      supplier: prev.supplier,
      notes: "",
    }))
  }

  const removeStockEntry = (id: string) => {
    setStockEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (stockEntries.length === 0) {
      alert("Please add at least one stock entry")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Add stock to store for each entry
    stockEntries.forEach((entry) => {
      addStock(entry.itemId, entry.quantity, entry.batchNumber, entry.expiryDate)
    })

    setIsSubmitting(false)
    router.push("/inventory")
  }

  const getStockStatus = (item: any) => {
    if (item.currentStock <= item.minimumStock * 0.5) {
      return <Badge variant="destructive">Critical</Badge>
    } else if (item.currentStock <= item.minimumStock) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
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
            <h1 className="text-3xl font-bold">Add Stock to Inventory</h1>
            <p className="text-muted-foreground">Add quantities to existing inventory items</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Item Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Inventory Item</CardTitle>
              <CardDescription>Search and select items to add stock</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {getStockStatus(item)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.id} • {item.category}
                        </p>
                        <p className="text-sm">
                          Current Stock: {item.currentStock} • Min: {item.minimumStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{item.supplier}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Stock Entry</CardTitle>
              <CardDescription>
                {selectedItem ? `Adding stock for: ${selectedItem.name}` : "Select an item to add stock"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={stockForm.quantity}
                      onChange={(e) => handleStockFormChange("quantity", e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                    />
                  </div>

                  {selectedItem.requiresBatch && (
                    <div className="space-y-2">
                      <Label htmlFor="batchNumber">Batch Number *</Label>
                      <Input
                        id="batchNumber"
                        value={stockForm.batchNumber}
                        onChange={(e) => handleStockFormChange("batchNumber", e.target.value)}
                        placeholder="Enter batch number"
                      />
                    </div>
                  )}

                  {selectedItem.requiresExpiry && (
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={stockForm.expiryDate}
                        onChange={(e) => handleStockFormChange("expiryDate", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="supplierLotNumber">Supplier Lot Number</Label>
                    <Input
                      id="supplierLotNumber"
                      value={stockForm.supplierLotNumber}
                      onChange={(e) => handleStockFormChange("supplierLotNumber", e.target.value)}
                      placeholder="Supplier's lot number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={stockForm.supplier}
                      onValueChange={(value) => handleStockFormChange("supplier", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    onClick={addStockEntry}
                    disabled={
                      !stockForm.quantity ||
                      (selectedItem.requiresBatch && !stockForm.batchNumber) ||
                      (selectedItem.requiresExpiry && !stockForm.expiryDate)
                    }
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Stock Entries
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-4" />
                  <p>Select an inventory item to add stock</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stock Entries Table */}
        {stockEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Entries ({stockEntries.length})</CardTitle>
              <CardDescription>Review items to be added to inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Supplier Lot</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.itemName}</p>
                            <p className="text-sm text-muted-foreground">{entry.itemId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{entry.quantity}</TableCell>
                        <TableCell>{entry.batchNumber || "-"}</TableCell>
                        <TableCell>{entry.expiryDate || "-"}</TableCell>
                        <TableCell>{entry.supplierLotNumber || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStockEntry(entry.id)}
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

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Total Items: {stockEntries.reduce((sum, entry) => sum + entry.quantity, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={stockForm.notes}
                onChange={(e) => handleStockFormChange("notes", e.target.value)}
                placeholder="Add any notes about this stock transaction..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/inventory">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || stockEntries.length === 0}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Processing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Stock ({stockEntries.length} items)
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
