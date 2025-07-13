"use client"

import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Download, FileText, TrendingUp, Package, ShoppingCart, Activity } from "lucide-react"

export default function ReportsPage() {
  const monthlyOrderData = [
    { month: "Jan", orders: 45, value: 12500 },
    { month: "Feb", orders: 52, value: 15200 },
    { month: "Mar", orders: 38, value: 9800 },
    { month: "Apr", orders: 61, value: 18400 },
    { month: "May", orders: 55, value: 16700 },
    { month: "Jun", orders: 67, value: 21300 },
  ]

  const categoryData = [
    { name: "Medical Supplies", value: 35, color: "#0088FE" },
    { name: "Medications", value: 28, color: "#00C49F" },
    { name: "Equipment", value: 20, color: "#FFBB28" },
    { name: "PPE", value: 17, color: "#FF8042" },
  ]

  const stockMovementData = [
    { date: "Week 1", inbound: 120, outbound: 95 },
    { date: "Week 2", inbound: 98, outbound: 110 },
    { date: "Week 3", inbound: 145, outbound: 88 },
    { date: "Week 4", inbound: 132, outbound: 125 },
  ]

  const topRequestingDepartments = [
    { department: "Emergency", requests: 45, percentage: 28 },
    { department: "Surgery", requests: 38, percentage: 24 },
    { department: "ICU", requests: 32, percentage: 20 },
    { department: "Pediatrics", requests: 25, percentage: 16 },
    { department: "Pharmacy", requests: 19, percentage: 12 },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive inventory and operational reports</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="last-30-days">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$847,230</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">159</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">-3.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item Releases</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.7%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Order Trends</CardTitle>
              <CardDescription>Order volume and value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyOrderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
              <CardDescription>Distribution of inventory items by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stock Movement */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement</CardTitle>
              <CardDescription>Inbound vs outbound inventory flow</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stockMovementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="inbound" stroke="#8884d8" name="Inbound" />
                  <Line type="monotone" dataKey="outbound" stroke="#82ca9d" name="Outbound" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Requesting Departments */}
          <Card>
            <CardHeader>
              <CardTitle>Top Requesting Departments</CardTitle>
              <CardDescription>Departments with highest request volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topRequestingDepartments.map((dept, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm font-medium">{dept.department}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${dept.percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-muted-foreground text-right">
                      {dept.requests} ({dept.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Report Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>Generate commonly used reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                Inventory Summary
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <TrendingUp className="h-6 w-6 mb-2" />
                Usage Analytics
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Package className="h-6 w-6 mb-2" />
                Low Stock Report
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Purchase History
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Activity className="h-6 w-6 mb-2" />
                Department Activity
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                Custom Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
