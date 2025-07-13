"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Eye, Truck, FileText, Package } from "lucide-react"
import Link from "next/link"

export default function ReleasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const releases = [
    {
      id: "REL001",
      requestId: "REQ002",
      department: "Pediatrics",
      releasedBy: "John Smith",
      releaseDate: "2024-01-15",
      receivedBy: "Dr. Michael Chen",
      items: [
        { name: "Thermometers", quantity: 5, unit: "pieces", batchNo: "TH2024001" },
        { name: "Bandages", quantity: 10, unit: "rolls", batchNo: "BD2024005" },
      ],
      status: "Completed",
      notes: "All items delivered and signed for",
    },
    {
      id: "REL002",
      requestId: "REQ001",
      department: "Emergency",
      releasedBy: "Sarah Wilson",
      releaseDate: "2024-01-14",
      receivedBy: "Dr. Sarah Johnson",
      items: [
        { name: "Surgical Gloves", quantity: 20, unit: "boxes", batchNo: "SG2024010" },
        { name: "N95 Masks", quantity: 50, unit: "pieces", batchNo: "N95-2024-003" },
      ],
      status: "In Transit",
      notes: "Emergency delivery in progress",
    },
    {
      id: "REL003",
      requestId: "REQ003",
      department: "Surgery",
      releasedBy: "Mike Johnson",
      releaseDate: "2024-01-13",
      receivedBy: "Dr. Emily Rodriguez",
      items: [{ name: "Surgical Instruments Set", quantity: 2, unit: "sets", batchNo: "SI2024007" }],
      status: "Completed",
      notes: "Sterilized instruments delivered",
    },
    {
      id: "REL004",
      requestId: "REQ005",
      department: "Pharmacy",
      releasedBy: "Lisa Chen",
      releaseDate: "2024-01-12",
      receivedBy: "Pharmacist John Davis",
      items: [
        { name: "Paracetamol 500mg", quantity: 100, unit: "tablets", batchNo: "PC2024015" },
        { name: "Insulin Syringes", quantity: 50, unit: "pieces", batchNo: "IS2024008" },
      ],
      status: "Pending Pickup",
      notes: "Ready for collection from pharmacy",
    },
    {
      id: "REL005",
      requestId: "REQ006",
      department: "ICU",
      releasedBy: "David Brown",
      releaseDate: "2024-01-11",
      receivedBy: "Nurse Manager Lisa Wong",
      items: [{ name: "IV Bags", quantity: 30, unit: "pieces", batchNo: "IV2024012" }],
      status: "Cancelled",
      notes: "Request cancelled by department",
    },
  ]

  const departments = ["all", "Emergency", "Pediatrics", "Surgery", "ICU", "Pharmacy", "Radiology", "Laboratory"]
  const statuses = ["all", "Pending Pickup", "In Transit", "Completed", "Cancelled"]

  const filteredReleases = releases.filter((release) => {
    const matchesSearch =
      release.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || release.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || release.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Pickup":
        return (
          <Badge variant="outline">
            <Package className="mr-1 h-3 w-3" />
            Pending Pickup
          </Badge>
        )
      case "In Transit":
        return (
          <Badge variant="default">
            <Truck className="mr-1 h-3 w-3" />
            In Transit
          </Badge>
        )
      case "Completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Item Releases</h1>
            <p className="text-muted-foreground">Track and manage item releases to departments</p>
          </div>
          <Button asChild>
            <Link href="/releases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Release
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Releases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{releases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {releases.filter((rel) => rel.status === "Pending Pickup").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {releases.filter((rel) => rel.status === "In Transit").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {releases.filter((rel) => rel.status === "Completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Releases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Item Releases</CardTitle>
            <CardDescription>Track item releases and deliveries to departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search releases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all" ? "All Statuses" : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Release ID</TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Released By</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Received By</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReleases.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell className="font-medium">{release.id}</TableCell>
                      <TableCell>
                        <Link href={`/requests/${release.requestId}`} className="text-blue-600 hover:underline">
                          {release.requestId}
                        </Link>
                      </TableCell>
                      <TableCell>{release.department}</TableCell>
                      <TableCell>{release.releasedBy}</TableCell>
                      <TableCell>{release.releaseDate}</TableCell>
                      <TableCell>{release.receivedBy}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {release.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity} {item.unit} {item.name}
                            </div>
                          ))}
                          {release.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{release.items.length - 2} more items</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(release.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Print Release Note
                            </DropdownMenuItem>
                            {release.status === "Pending Pickup" && (
                              <DropdownMenuItem>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as In Transit
                              </DropdownMenuItem>
                            )}
                            {release.status === "In Transit" && (
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Track Items</DropdownMenuItem>
                            <DropdownMenuItem>Send Notification</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
