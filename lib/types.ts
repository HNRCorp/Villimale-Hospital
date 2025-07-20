// lib/types.ts
// Centralized type definitions for the entire application

export type UserRole = "admin" | "doctor" | "nurse" | "pharmacist" | "staff"
export type UserStatus = "Active" | "Inactive" | "Locked" | "Pending"

export interface UserProfile {
  id: string
  employeeId: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin?: string
  firstLogin?: boolean
  // passwordHash is NOT included here as it's sensitive and handled server-side
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  unitOfMeasure: string
  minStockLevel: number
  expiryDate?: string // ISO date string
  status: "In Stock" | "Low Stock" | "Critical" | "Expired" | "Out of Stock"
  location: string
  supplier: string
  lastUpdated: string // ISO date string
}

export interface RequestItem {
  itemId: string
  itemName: string
  quantity: number
  unitOfMeasure: string
}

export interface Request {
  id: string
  requestedBy: string // Name of the user who requested
  requestedByUserId: string // UUID of the user who requested
  department: string
  items: RequestItem[]
  status: "Pending" | "Approved" | "Rejected" | "Completed"
  priority: "Low" | "Medium" | "High" | "Urgent"
  requestDate: string // ISO date string
  approvalDate?: string // ISO date string
  approvedBy?: string // Name of the user who approved
  notes?: string
}

export interface OrderItem {
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  orderDate: string // ISO date string
  supplier: string
  items: OrderItem[]
  totalAmount: number
  status: "Pending" | "Ordered" | "Received" | "Cancelled"
  orderedBy: string // Name of the user who placed the order
  receivedDate?: string // ISO date string
}

export interface ReleaseItem {
  itemId: string
  itemName: string
  quantity: number
  unitOfMeasure: string
}

export interface Release {
  id: string
  releaseDate: string // ISO date string
  releasedBy: string // Name of the user who released
  department: string
  items: ReleaseItem[]
  notes?: string
}
