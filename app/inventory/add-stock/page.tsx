"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Save, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react"
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
  supplier: string
  notes: string
}

export default function AddStockPage() {
  const router = useRouter()
  const { inventoryItems, addStock } = useHospitalStore()
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState({
    itemId: "",
    quantity: "",
    batchNumber: "",
    expiryDate: "",
    supplier: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const suppliers = [
    "MedSupply Maldives",
    "Healthcare Solutions Pvt Ltd",
    "Island Medical Supplies",
    "Global Pharma Distribution",
    "Medical Equipment Co.",
    "Surgical Instruments Ltd",
    "Pharmacy Wholesale",
    "Emergency Medical Supplies",
  ]

  const handleInputChange = (field: string, value: string) => {
    setCurrentEntry((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const addStockEntry = () => {
    // Validation
    if (!currentEntry.itemId) {
      setError("Please select an item")
      return
    }

    if (!currentEntry.quantity || Number.parseInt(currentEntry.quantity) <= 0) {
      setError("Please enter a valid quantity")
      return
    }

    if (!currentEntry.batchNumber.trim()) {
      setError("Please enter a batch number")
      return
    }

    if (!currentEntry.expiryDate) {
      setError("Please select an expiry date")
      return
    }

    if (!currentEntry.supplier) {
      setError("Please select a supplier")
      return
    }

    // Check if expiry date is in the future
    const expiryDate = new Date(currentEntry.expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (expiryDate <= today) {
      setError("Expiry date must be in the future")
      return
    }

    const selectedItem = inventoryItems.find((item) => item.id === currentEntry.itemId)
    if (!selectedItem) {
      setError("Selected item not found")
      return
    }

    const newEntry: StockEntry = {
      id: Date.now().toString(),
      itemId: currentEntry.itemId,
      itemName: selectedItem.name,
      quantity: Number.parseInt(currentEntry.quantity),
      batchNumber: currentEntry.batchNumber.trim(),
      expiryDate: currentEntry.expiryDate,
      supplier: currentEntry.supplier,
      notes: currentEntry.notes.trim(),
    }

    setStockEntries((prev) => [...prev, newEntry])
    setCurrentEntry({
      itemId: "",
      quantity: "",
      batchNumber: "",
      expiryDate: "",
      supplier: "",
      notes: "",
    })
    setError("")
  }

  const removeStockEntry = (entryId: string) => {
    setStockEntries((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  const handleSubmit = async () => {
    if (stockEntries.length === 0) {
      setError("Please add at least one stock entry")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Process each stock entry
      for (const entry of stockEntries) {
        addStock(entry.itemId, entry.quantity, entry.batchNumber, entry.expiryDate)
      }

      setSuccess(`Successfully added stock for ${stockEntries.length} item(s)`)
      setStockEntries([])

      // Redirect after success
      setTimeout(() => {
        router.push("/inventory")
      }, 2000)
    } catch (err) {
      setError("Failed to add stock. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalQuantity = () => {
    return stockEntries.reduce((total, entry) => total + entry.quantity, 0)
  }

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      return { status: "expired", color: "destructive", text: "Expired" }
    } else if (diffDays <= 30) {
      return { status: "expiring", color: "destructive", text: `${diffDays} days` }
    } else if (diffDays <= 90) {
      return { status: "warning", color: "outline", text: `${diffDays} days` }
    } else {
      return { status: "good", color: "default", text: `${diffDays} days` }
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
            <h1 className="text-3xl font-bold">Add Stock</h1>
            <p className="text-muted-foreground">Add new stock to inventory items</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add Stock Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Add Stock Entry
              </CardTitle>
              <CardDescription>Enter details for new stock to be added</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item Selection */}
              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                <Select value={currentEntry.itemId} onValueChange={(value) => handleInputChange("itemId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.category} • Current: {item.currentStock} {item.unitOfMeasure}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentEntry.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Batch Number */}
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  value={currentEntry.batchNumber}
                  onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                  placeholder="Enter batch number"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={currentEntry.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={currentEntry.supplier} onValueChange={(value) => handleInputChange("supplier", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={currentEntry.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>

              {/* Add Entry Button */}
              <Button onClick={addStockEntry} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add to List
              </Button>
            </CardContent>
          </Card>

          {/* Stock Entries Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Entries Summary</CardTitle>
              <CardDescription>
                {stockEntries.length} item(s) • Total quantity: {getTotalQuantity()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockEntries.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockEntries.map((entry) => {
                          const expiryStatus = getExpiryStatus(entry.expiryDate)
                          return (
                            <TableRow key={entry.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{entry.itemName}</div>
                                  <div className="text-sm text-muted-foreground">Batch: {entry.batchNumber}</div>
                                  <div className="text-sm text-muted-foreground">{entry.supplier}</div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{entry.quantity}</TableCell>
                              <TableCell>
                                <Badge variant={expiryStatus.color as any}>{expiryStatus.text}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeStockEntry(entry.id)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
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

                  <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Adding Stock...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Add All Stock Entries
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-4" />
                  <p>No stock entries added yet</p>
                  <p className="text-sm">Add items using the form on the left</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
