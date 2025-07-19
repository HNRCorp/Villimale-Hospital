import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase"

export interface InventoryItem {
  id: string
  name: string
  category: string
  description?: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitOfMeasure: string
  unitPrice: number
  supplier?: string
  location?: string
  expiryDate?: string
  batchNumber?: string
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Critical"
  createdAt?: string
  updatedAt?: string
}

export interface Request {
  id: string
  department: string
  requestedBy: string
  requestedDate: string
  requiredDate: string
  status: "Pending" | "Approved" | "Rejected" | "In Progress" | "Fulfilled"
  priority: "Low" | "Medium" | "High" | "Urgent"
  items: Array<{
    itemId: string
    itemName: string
    requestedQuantity: number
    approvedQuantity?: number
    unitOfMeasure: string
  }>
  notes?: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  id: string
  supplier: string
  orderDate: string
  expectedDelivery?: string
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled"
  totalAmount: number
  items: Array<{
    itemId: string
    itemName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface Release {
  id: string
  department: string
  releasedBy: string
  releasedDate: string
  requestId?: string
  items: Array<{
    itemId: string
    itemName: string
    releasedQuantity: number
    unitOfMeasure: string
  }>
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface HospitalStore {
  // State
  inventoryItems: InventoryItem[]
  requests: Request[]
  orders: Order[]
  releases: Release[]
  isLoading: boolean
  error: string | null

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Inventory actions
  loadInventoryItems: () => Promise<void>
  addInventoryItem: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>
  addStock: (itemId: string, quantity: number, batchNumber?: string, expiryDate?: string) => Promise<void>

  // Request actions
  loadRequests: () => Promise<void>
  addRequest: (request: Omit<Request, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateRequest: (id: string, updates: Partial<Request>) => Promise<void>
  deleteRequest: (id: string) => Promise<void>

  // Order actions
  loadOrders: () => Promise<void>
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>

  // Release actions
  loadReleases: () => Promise<void>
  addRelease: (release: Omit<Release, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateRelease: (id: string, updates: Partial<Release>) => Promise<void>
  deleteRelease: (id: string) => Promise<void>

  // Utility actions
  initializeStore: () => Promise<void>
}

const mapDbToInventoryItem = (dbItem: any): InventoryItem => ({
  id: dbItem.id,
  name: dbItem.name,
  category: dbItem.category,
  description: dbItem.description,
  currentStock: dbItem.current_stock,
  minimumStock: dbItem.minimum_stock,
  maximumStock: dbItem.maximum_stock,
  unitOfMeasure: dbItem.unit_of_measure,
  unitPrice: Number.parseFloat(dbItem.unit_price),
  supplier: dbItem.supplier,
  location: dbItem.location,
  expiryDate: dbItem.expiry_date,
  batchNumber: dbItem.batch_number,
  status: dbItem.status,
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at,
})

const mapDbToRequest = (dbRequest: any): Request => ({
  id: dbRequest.id,
  department: dbRequest.department,
  requestedBy: dbRequest.requested_by,
  requestedDate: dbRequest.requested_date,
  requiredDate: dbRequest.required_date,
  status: dbRequest.status,
  priority: dbRequest.priority,
  items: dbRequest.items || [],
  notes: dbRequest.notes,
  approvedBy: dbRequest.approved_by,
  approvedDate: dbRequest.approved_date,
  rejectionReason: dbRequest.rejection_reason,
  createdAt: dbRequest.created_at,
  updatedAt: dbRequest.updated_at,
})

const mapDbToOrder = (dbOrder: any): Order => ({
  id: dbOrder.id,
  supplier: dbOrder.supplier,
  orderDate: dbOrder.order_date,
  expectedDelivery: dbOrder.expected_delivery,
  status: dbOrder.status,
  totalAmount: Number.parseFloat(dbOrder.total_amount),
  items: dbOrder.items || [],
  notes: dbOrder.notes,
  createdAt: dbOrder.created_at,
  updatedAt: dbOrder.updated_at,
})

const mapDbToRelease = (dbRelease: any): Release => ({
  id: dbRelease.id,
  department: dbRelease.department,
  releasedBy: dbRelease.released_by,
  releasedDate: dbRelease.released_date,
  requestId: dbRelease.request_id,
  items: dbRelease.items || [],
  notes: dbRelease.notes,
  createdAt: dbRelease.created_at,
  updatedAt: dbRelease.updated_at,
})

export const useHospitalStore = create<HospitalStore>()(
  persist(
    (set, get) => ({
      // Initial state
      inventoryItems: [],
      requests: [],
      orders: [],
      releases: [],
      isLoading: false,
      error: null,

      // Basic actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Inventory actions
      loadInventoryItems: async () => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.from("inventory_items").select("*").order("name")

          if (error) {
            // Handle table not exists error gracefully
            if (error.code === "42P01" || error.message.includes("does not exist")) {
              console.warn("⚠️ inventory_items table not found. Run scripts/create-tables.sql first.")
              set({ inventoryItems: [], isLoading: false })
              return
            }
            throw error
          }

          const items = data?.map(mapDbToInventoryItem) || []
          set({ inventoryItems: items, isLoading: false })
        } catch (error) {
          console.error("Error loading inventory items:", error)
          set({ error: "Failed to load inventory items", isLoading: false })
        }
      },

      addInventoryItem: async (item) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("inventory_items")
            .insert({
              name: item.name,
              category: item.category,
              description: item.description,
              current_stock: item.currentStock,
              minimum_stock: item.minimumStock,
              maximum_stock: item.maximumStock,
              unit_of_measure: item.unitOfMeasure,
              unit_price: item.unitPrice,
              supplier: item.supplier,
              location: item.location,
              expiry_date: item.expiryDate,
              batch_number: item.batchNumber,
              status: item.status,
            })
            .select()
            .single()

          if (error) throw error

          const newItem = mapDbToInventoryItem(data)
          set((state) => ({
            inventoryItems: [...state.inventoryItems, newItem],
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error adding inventory item:", error)
          set({ error: "Failed to add inventory item", isLoading: false })
        }
      },

      updateInventoryItem: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          const dbUpdates: any = {}
          if (updates.name !== undefined) dbUpdates.name = updates.name
          if (updates.category !== undefined) dbUpdates.category = updates.category
          if (updates.description !== undefined) dbUpdates.description = updates.description
          if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock
          if (updates.minimumStock !== undefined) dbUpdates.minimum_stock = updates.minimumStock
          if (updates.maximumStock !== undefined) dbUpdates.maximum_stock = updates.maximumStock
          if (updates.unitOfMeasure !== undefined) dbUpdates.unit_of_measure = updates.unitOfMeasure
          if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice
          if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier
          if (updates.location !== undefined) dbUpdates.location = updates.location
          if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate
          if (updates.batchNumber !== undefined) dbUpdates.batch_number = updates.batchNumber
          if (updates.status !== undefined) dbUpdates.status = updates.status

          const { data, error } = await supabase
            .from("inventory_items")
            .update(dbUpdates)
            .eq("id", id)
            .select()
            .single()

          if (error) throw error

          const updatedItem = mapDbToInventoryItem(data)
          set((state) => ({
            inventoryItems: state.inventoryItems.map((item) => (item.id === id ? updatedItem : item)),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error updating inventory item:", error)
          set({ error: "Failed to update inventory item", isLoading: false })
        }
      },

      deleteInventoryItem: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.from("inventory_items").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            inventoryItems: state.inventoryItems.filter((item) => item.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error deleting inventory item:", error)
          set({ error: "Failed to delete inventory item", isLoading: false })
        }
      },

      addStock: async (itemId, quantity, batchNumber, expiryDate) => {
        try {
          set({ isLoading: true, error: null })

          const item = get().inventoryItems.find((i) => i.id === itemId)
          if (!item) throw new Error("Item not found")

          const updates: any = {
            current_stock: item.currentStock + quantity,
          }

          if (batchNumber) updates.batch_number = batchNumber
          if (expiryDate) updates.expiry_date = expiryDate

          // Update status based on new stock level
          const newStock = item.currentStock + quantity
          if (newStock <= 0) {
            updates.status = "Out of Stock"
          } else if (newStock <= item.minimumStock) {
            updates.status = "Low Stock"
          } else {
            updates.status = "In Stock"
          }

          const { data, error } = await supabase
            .from("inventory_items")
            .update(updates)
            .eq("id", itemId)
            .select()
            .single()

          if (error) throw error

          const updatedItem = mapDbToInventoryItem(data)
          set((state) => ({
            inventoryItems: state.inventoryItems.map((item) => (item.id === itemId ? updatedItem : item)),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error adding stock:", error)
          set({ error: "Failed to add stock", isLoading: false })
        }
      },

      // Request actions
      loadRequests: async () => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("requests")
            .select("*")
            .order("requested_date", { ascending: false })

          if (error) {
            if (error.code === "42P01" || error.message.includes("does not exist")) {
              console.warn("⚠️ requests table not found. Run scripts/create-tables.sql first.")
              set({ requests: [], isLoading: false })
              return
            }
            throw error
          }

          const requests = data?.map(mapDbToRequest) || []
          set({ requests, isLoading: false })
        } catch (error) {
          console.error("Error loading requests:", error)
          set({ error: "Failed to load requests", isLoading: false })
        }
      },

      addRequest: async (request) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("requests")
            .insert({
              department: request.department,
              requested_by: request.requestedBy,
              requested_date: request.requestedDate,
              required_date: request.requiredDate,
              status: request.status,
              priority: request.priority,
              items: request.items,
              notes: request.notes,
            })
            .select()
            .single()

          if (error) throw error

          const newRequest = mapDbToRequest(data)
          set((state) => ({
            requests: [newRequest, ...state.requests],
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error adding request:", error)
          set({ error: "Failed to add request", isLoading: false })
        }
      },

      updateRequest: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          const dbUpdates: any = {}
          if (updates.department !== undefined) dbUpdates.department = updates.department
          if (updates.requestedBy !== undefined) dbUpdates.requested_by = updates.requestedBy
          if (updates.requiredDate !== undefined) dbUpdates.required_date = updates.requiredDate
          if (updates.status !== undefined) dbUpdates.status = updates.status
          if (updates.priority !== undefined) dbUpdates.priority = updates.priority
          if (updates.items !== undefined) dbUpdates.items = updates.items
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes
          if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy
          if (updates.approvedDate !== undefined) dbUpdates.approved_date = updates.approvedDate
          if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason

          const { data, error } = await supabase.from("requests").update(dbUpdates).eq("id", id).select().single()

          if (error) throw error

          const updatedRequest = mapDbToRequest(data)
          set((state) => ({
            requests: state.requests.map((request) => (request.id === id ? updatedRequest : request)),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error updating request:", error)
          set({ error: "Failed to update request", isLoading: false })
        }
      },

      deleteRequest: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.from("requests").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            requests: state.requests.filter((request) => request.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error deleting request:", error)
          set({ error: "Failed to delete request", isLoading: false })
        }
      },

      // Order actions
      loadOrders: async () => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.from("orders").select("*").order("order_date", { ascending: false })

          if (error) {
            if (error.code === "42P01" || error.message.includes("does not exist")) {
              console.warn("⚠️ orders table not found. Run scripts/create-tables.sql first.")
              set({ orders: [], isLoading: false })
              return
            }
            throw error
          }

          const orders = data?.map(mapDbToOrder) || []
          set({ orders, isLoading: false })
        } catch (error) {
          console.error("Error loading orders:", error)
          set({ error: "Failed to load orders", isLoading: false })
        }
      },

      addOrder: async (order) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("orders")
            .insert({
              supplier: order.supplier,
              order_date: order.orderDate,
              expected_delivery: order.expectedDelivery,
              status: order.status,
              total_amount: order.totalAmount,
              items: order.items,
              notes: order.notes,
            })
            .select()
            .single()

          if (error) throw error

          const newOrder = mapDbToOrder(data)
          set((state) => ({
            orders: [newOrder, ...state.orders],
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error adding order:", error)
          set({ error: "Failed to add order", isLoading: false })
        }
      },

      updateOrder: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          const dbUpdates: any = {}
          if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier
          if (updates.expectedDelivery !== undefined) dbUpdates.expected_delivery = updates.expectedDelivery
          if (updates.status !== undefined) dbUpdates.status = updates.status
          if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount
          if (updates.items !== undefined) dbUpdates.items = updates.items
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes

          const { data, error } = await supabase.from("orders").update(dbUpdates).eq("id", id).select().single()

          if (error) throw error

          const updatedOrder = mapDbToOrder(data)
          set((state) => ({
            orders: state.orders.map((order) => (order.id === id ? updatedOrder : order)),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error updating order:", error)
          set({ error: "Failed to update order", isLoading: false })
        }
      },

      deleteOrder: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.from("orders").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            orders: state.orders.filter((order) => order.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error deleting order:", error)
          set({ error: "Failed to delete order", isLoading: false })
        }
      },

      // Release actions
      loadReleases: async () => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("releases")
            .select("*")
            .order("released_date", { ascending: false })

          if (error) {
            if (error.code === "42P01" || error.message.includes("does not exist")) {
              console.warn("⚠️ releases table not found. Run scripts/create-tables.sql first.")
              set({ releases: [], isLoading: false })
              return
            }
            throw error
          }

          const releases = data?.map(mapDbToRelease) || []
          set({ releases, isLoading: false })
        } catch (error) {
          console.error("Error loading releases:", error)
          set({ error: "Failed to load releases", isLoading: false })
        }
      },

      addRelease: async (release) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from("releases")
            .insert({
              department: release.department,
              released_by: release.releasedBy,
              released_date: release.releasedDate,
              request_id: release.requestId,
              items: release.items,
              notes: release.notes,
            })
            .select()
            .single()

          if (error) throw error

          const newRelease = mapDbToRelease(data)
          set((state) => ({
            releases: [newRelease, ...state.releases],
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error adding release:", error)
          set({ error: "Failed to add release", isLoading: false })
        }
      },

      updateRelease: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          const dbUpdates: any = {}
          if (updates.department !== undefined) dbUpdates.department = updates.department
          if (updates.releasedBy !== undefined) dbUpdates.released_by = updates.releasedBy
          if (updates.releasedDate !== undefined) dbUpdates.released_date = updates.releasedDate
          if (updates.requestId !== undefined) dbUpdates.request_id = updates.requestId
          if (updates.items !== undefined) dbUpdates.items = updates.items
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes

          const { data, error } = await supabase.from("releases").update(dbUpdates).eq("id", id).select().single()

          if (error) throw error

          const updatedRelease = mapDbToRelease(data)
          set((state) => ({
            releases: state.releases.map((release) => (release.id === id ? updatedRelease : release)),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error updating release:", error)
          set({ error: "Failed to update release", isLoading: false })
        }
      },

      deleteRelease: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.from("releases").delete().eq("id", id)

          if (error) throw error

          set((state) => ({
            releases: state.releases.filter((release) => release.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          console.error("Error deleting release:", error)
          set({ error: "Failed to delete release", isLoading: false })
        }
      },

      // Initialize store
      initializeStore: async () => {
        const { loadInventoryItems, loadRequests, loadOrders, loadReleases } = get()

        await Promise.all([loadInventoryItems(), loadRequests(), loadOrders(), loadReleases()])
      },
    }),
    {
      name: "hospital-store",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState
      },
    },
  ),
)
