"use client"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  PrinterIcon as Print,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useHospitalStore } from "@/lib/store"
import { toast } from "@/hooks/use-toast"

export default function RequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { requests, updateRequest, inventoryItems } = useHospitalStore()
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Print the whole page (or let the browser’s print-styles handle visibility)
  const handlePrint = () => window.print()

  const requestId = params.id as string
  const request = requests.find((r) => r.id === requestId)

  const handleDownloadPDF = async () => {
    if (!printRef.current) return

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Request-${requestId}-Release-Note.pdf`)

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      updateRequest(requestId, {
        status: "Approved",
        approvedBy: "Current User", // In real app, get from auth
        approvedDate: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: "Request approved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      updateRequest(requestId, {
        status: "Rejected",
        rejectionReason: rejectionReason.trim(),
        approvedBy: "Current User", // In real app, get from auth
        approvedDate: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: "Request rejected",
      })
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkInProgress = async () => {
    setIsLoading(true)
    try {
      updateRequest(requestId, {
        status: "In Progress",
      })

      toast({
        title: "Success",
        description: "Request marked as in progress",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkFulfilled = async () => {
    setIsLoading(true)
    try {
      updateRequest(requestId, {
        status: "Fulfilled",
      })

      toast({
        title: "Success",
        description: "Request marked as fulfilled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "outline"
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      case "In Progress":
        return "secondary"
      case "Fulfilled":
        return "default"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "outline"
      case "Medium":
        return "secondary"
      case "High":
        return "default"
      case "Urgent":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getItemCurrentStock = (itemId: string) => {
    const item = inventoryItems.find((i) => i.id === itemId)
    return item ? item.currentStock : 0
  }

  const getItemUnit = (itemId: string) => {
    const item = inventoryItems.find((i) => i.id === itemId)
    return item ? item.unitOfMeasure : "units"
  }

  if (!request) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Request Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested item could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/requests">Back to Requests</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/requests">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
              <p className="text-muted-foreground">Request #{request.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Print className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Request Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                    <p className="font-medium">#{request.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="font-medium">{request.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Requested By</Label>
                    <p className="font-medium">{request.requestedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <Badge variant={getPriorityColor(request.priority) as any}>{request.priority}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Requested Date</Label>
                    <p className="font-medium">{new Date(request.requestedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Required Date</Label>
                    <p className="font-medium">{new Date(request.requiredDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {request.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-md">{request.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requested Items */}
            <Card>
              <CardHeader>
                <CardTitle>Requested Items</CardTitle>
                <CardDescription>
                  {request.items.length} item{request.items.length !== 1 ? "s" : ""} requested
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.items.map((item, index) => {
                    const currentStock = getItemCurrentStock(item.itemId)
                    const unit = getItemUnit(item.itemId)
                    const isStockSufficient = currentStock >= item.requestedQuantity

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.itemName}</h4>
                            <div className="mt-2 grid gap-2 md:grid-cols-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Requested:</span>
                                <span className="ml-1 font-medium">
                                  {item.requestedQuantity} {item.unitOfMeasure}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Current Stock:</span>
                                <span
                                  className={`ml-1 font-medium ${
                                    isStockSufficient ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {currentStock} {unit}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Urgency:</span>
                                <Badge variant={getPriorityColor(item.urgency) as any} className="ml-1">
                                  {item.urgency}
                                </Badge>
                              </div>
                            </div>
                            {item.justification && (
                              <div className="mt-2">
                                <span className="text-sm text-muted-foreground">Justification:</span>
                                <p className="text-sm mt-1">{item.justification}</p>
                              </div>
                            )}
                          </div>
                          {!isStockSufficient && (
                            <div className="ml-4">
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Insufficient Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Approval Information */}
            {(request.status === "Approved" || request.status === "Rejected") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {request.status === "Approved" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {request.status === "Approved" ? "Approval" : "Rejection"} Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {request.status === "Approved" ? "Approved" : "Rejected"} By
                      </Label>
                      <p className="font-medium">{request.approvedBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                      <p className="font-medium">
                        {request.approvedDate && new Date(request.approvedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {request.rejectionReason && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
                      <p className="mt-1 text-sm bg-muted p-3 rounded-md">{request.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getStatusColor(request.status) as any} className="text-sm">
                  {request.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage this request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.status === "Pending" && (
                  <>
                    <Button onClick={handleApprove} disabled={isLoading} className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Request
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                      <Textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        rows={3}
                      />
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isLoading || !rejectionReason.trim()}
                        className="w-full"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Request
                      </Button>
                    </div>
                  </>
                )}

                {request.status === "Approved" && (
                  <Button onClick={handleMarkInProgress} disabled={isLoading} className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    Mark In Progress
                  </Button>
                )}

                {request.status === "In Progress" && (
                  <Button onClick={handleMarkFulfilled} disabled={isLoading} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Fulfilled
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Request Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span className="font-medium">{request.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Quantity:</span>
                  <span className="font-medium">
                    {request.items.reduce((sum, item) => sum + item.requestedQuantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days Since Request:</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - new Date(request.requestedDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Printable Release Note */}
        <div style={{ display: "none" }}>
          <div ref={printRef} className="p-8 bg-white text-black">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/villimale-logo.png"
                  alt="Villimale Hospital"
                  width={60}
                  height={60}
                  className="h-15 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold">VILLIMALE HOSPITAL</h1>
                  <p className="text-sm text-gray-600">Inventory Management System</p>
                  <p className="text-xs text-gray-500">Male', Republic of Maldives | Tel: +960 330-5447</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">INVENTORY REQUEST</h2>
                <h3 className="text-lg font-semibold">RELEASE NOTE</h3>
                <p className="text-sm text-gray-600">#{request.id}</p>
              </div>
            </div>

            <hr className="border-gray-300 mb-6" />

            {/* Request Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-4">REQUEST INFORMATION</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Request ID:</span>
                    <span>#{request.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Department:</span>
                    <span>{request.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Requested By:</span>
                    <span>{request.requestedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Priority:</span>
                    <span>{request.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span>{request.status}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">DATES</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Requested Date:</span>
                    <span>{new Date(request.requestedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Required Date:</span>
                    <span>{new Date(request.requiredDate).toLocaleDateString()}</span>
                  </div>
                  {request.approvedDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Approved Date:</span>
                      <span>{new Date(request.approvedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Generated Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">REQUESTED ITEMS</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Unit</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Urgency</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{item.itemName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.requestedQuantity}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.unitOfMeasure}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.urgency}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {getItemCurrentStock(item.itemId)} {getItemUnit(item.itemId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-4">REQUEST SUMMARY</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Items:</span>
                    <span>{request.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Quantity:</span>
                    <span>{request.items.reduce((sum, item) => sum + item.requestedQuantity, 0)}</span>
                  </div>
                </div>
              </div>
              {request.approvedBy && (
                <div>
                  <h3 className="font-semibold mb-4">APPROVAL INFORMATION</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Approved By:</span>
                      <span>{request.approvedBy}</span>
                    </div>
                    {request.approvedDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Approval Date:</span>
                        <span>{new Date(request.approvedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">NOTES</h3>
                <p className="text-sm border border-gray-300 p-4 rounded">{request.notes}</p>
              </div>
            )}

            {/* Footer */}
            <hr className="border-gray-300 mt-8 mb-4" />
            <div className="text-center text-xs text-gray-500">
              <p>This document was generated automatically by the Villimale Hospital Inventory Management System</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
              <p>For inquiries, contact: inventory@villimale-hospital.mv | +960 330-5447</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
