"use client"

import { create } from "zustand"

export interface InventoryItem {
  id: string
  name: string
  category: string
  description: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitOfMeasure: string
  unitPrice: number
  supplier: string
  location: string
  expiryDate?: string
  batchNumber?: string
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Critical"
  lastUpdated: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "System Administrator" | "Inventory Manager" | "Department Head" | "Staff" | "Pharmacist"
  department: string
  status: "Active" | "Inactive"
  createdAt: string
}

export interface Request {
  id: string
  department: string
  requestedBy: string
  requestedDate: string
  requiredDate: string
  status: "Pending" | "Approved" | "Rejected" | "In Progress" | "Fulfilled"
  priority: "Low" | "Medium" | "High" | "Urgent"
  items: {
    itemId: string
    itemName: string
    requestedQuantity: number
    approvedQuantity?: number
    unitOfMeasure: string
    urgency: "Low" | "Medium" | "High" | "Critical"
    justification: string
  }[]
  notes?: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
}

export interface Order {
  id: string
  supplier: string
  orderDate: string
  expectedDelivery: string
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled"
  totalAmount: number
  items: {
    itemId: string
    itemName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  notes?: string
}

export interface Release {
  id: string
  department: string
  releasedBy: string
  releasedDate: string
  requestId?: string
  items: {
    itemId: string
    itemName: string
    quantity: number
    unitOfMeasure: string
    batchNumber?: string
    expiryDate?: string
  }[]
  notes?: string
}

interface HospitalStore {
  inventoryItems: InventoryItem[]
  users: User[]
  requests: Request[]
  orders: Order[]
  releases: Release[]

  // Actions
  addInventoryItem: (item: Omit<InventoryItem, "id" | "lastUpdated">) => void
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  addRequest: (request: Omit<Request, "id">) => void
  updateRequest: (id: string, updates: Partial<Request>) => void
  addOrder: (order: Omit<Order, "id">) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  addRelease: (release: Omit<Release, "id">) => void
  addStock: (itemId: string, quantity: number, batchNumber?: string, expiryDate?: string) => void
}

// Sample data
const sampleInventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    category: "Medications",
    description: "Pain relief and fever reducer",
    currentStock: 150,
    minimumStock: 50,
    maximumStock: 500,
    unitOfMeasure: "tablets",
    unitPrice: 0.25,
    supplier: "PharmaCorp Ltd",
    location: "Pharmacy - Shelf A1",
    expiryDate: "2025-06-15",
    batchNumber: "PC2024001",
    status: "In Stock",
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Surgical Gloves (Medium)",
    category: "Medical Supplies",
    description: "Latex-free surgical gloves",
    currentStock: 25,
    minimumStock: 100,
    maximumStock: 1000,
    unitOfMeasure: "boxes",
    unitPrice: 12.5,
    supplier: "MedSupply Inc",
    location: "Storage Room B - Shelf 3",
    status: "Low Stock",
    lastUpdated: "2024-01-14T15:45:00Z",
  },
  {
    id: "3",
    name: "Insulin Syringes",
    category: "Medical Equipment",
    description: "1ml insulin syringes with fine needle",
    currentStock: 5,
    minimumStock: 50,
    maximumStock: 200,
    unitOfMeasure: "boxes",
    unitPrice: 8.75,
    supplier: "DiabetesCare Co",
    location: "Pharmacy - Refrigerated Section",
    status: "Critical",
    lastUpdated: "2024-01-13T09:20:00Z",
  },
]

const sampleUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@villimale-hospital.mv",
    role: "Inventory Manager",
    department: "Inventory",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@villimale-hospital.mv",
    role: "Department Head",
    department: "Emergency",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
  },
]

const sampleRequests: Request[] = [
  {
    id: "1",
    department: "Emergency",
    requestedBy: "Dr. Sarah Johnson",
    requestedDate: "2024-01-15T08:30:00Z",
    requiredDate: "2024-01-16T00:00:00Z",
    status: "Pending",
    priority: "High",
    items: [
      {
        itemId: "1",
        itemName: "Paracetamol 500mg",
        requestedQuantity: 100,
        unitOfMeasure: "tablets",
        urgency: "High",
        justification: "Running low on pain medication for emergency patients",
      },
      {
        itemId: "2",
        itemName: "Surgical Gloves (Medium)",
        requestedQuantity: 20,
        unitOfMeasure: "boxes",
        urgency: "Critical",
        justification: "Essential for emergency procedures",
      },
    ],
    notes: "Urgent request for emergency department restocking",
  },
]

export const useHospitalStore = create<HospitalStore>((set, get) => ({
  inventoryItems: sampleInventoryItems,
  users: sampleUsers,
  requests: sampleRequests,
  orders: [],
  releases: [],

  addInventoryItem: (item) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    }
    set((state) => ({
      inventoryItems: [...state.inventoryItems, newItem],
    }))
  },

  updateInventoryItem: (id, updates) => {
    set((state) => ({
      inventoryItems: state.inventoryItems.map((item) =>
        item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item,
      ),
    }))
  },

  addUser: (user) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      users: [...state.users, newUser],
    }))
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
    }))
  },

  addRequest: (request) => {
    const newRequest: Request = {
      ...request,
      id: Date.now().toString(),
    }
    set((state) => ({
      requests: [...state.requests, newRequest],
    }))
  },

  updateRequest: (id, updates) => {
    set((state) => ({
      requests: state.requests.map((request) => (request.id === id ? { ...request, ...updates } : request)),
    }))
  },

  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
    }
    set((state) => ({
      orders: [...state.orders, newOrder],
    }))
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, ...updates } : order)),
    }))
  },

  addRelease: (release) => {
    const newRelease: Release = {
      ...release,
      id: Date.now().toString(),
    }
    set((state) => ({
      releases: [...state.releases, newRelease],
    }))
  },

  addStock: (itemId, quantity, batchNumber, expiryDate) => {
    set((state) => ({
      inventoryItems: state.inventoryItems.map((item) => {
        if (item.id === itemId) {
          const newStock = item.currentStock + quantity
          let status: InventoryItem["status"] = "In Stock"

          if (newStock <= 0) {
            status = "Out of Stock"
          } else if (newStock <= item.minimumStock * 0.5) {
            status = "Critical"
          } else if (newStock <= item.minimumStock) {
            status = "Low Stock"
          }

          return {
            ...item,
            currentStock: newStock,
            status,
            batchNumber: batchNumber || item.batchNumber,
            expiryDate: expiryDate || item.expiryDate,
            lastUpdated: new Date().toISOString(),
          }
        }
        return item
      }),
    }))
  },
}))
