// lib/store.ts
"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { supabase } from "./supabase" // Import the client-side Supabase client
import type { InventoryItem, UserProfile, Request, Order, Release } from "./types"
import { v4 as uuidv4 } from "uuid"

/* ------------------------------------------------------------------ */
/* Store definition                                                   */
/* ------------------------------------------------------------------ */

interface HospitalStore {
  /* data */
  inventoryItems: InventoryItem[]
  users: UserProfile[] // Populated from Supabase, not managed by this store's actions
  requests: Request[]
  orders: Order[]
  releases: Release[]

  /* ui state */
  isLoading: boolean
  error: string | null
  isInitialized: boolean // Tracks if initial data load is complete

  /* actions */
  initializeStore: () => Promise<void>
  addInventoryItem: (
    item: Omit<InventoryItem, "id" | "lastUpdated" | "status">,
  ) => Promise<{ success: boolean; message: string }>
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<{ success: boolean; message: string }>
  addStock: (itemId: string, quantity: number) => Promise<{ success: boolean; message: string }>
  releaseStock: (itemId: string, quantity: number) => Promise<{ success: boolean; message: string }>
  createRequest: (
    request: Omit<Request, "id" | "requestDate" | "status"> & { requestedByUserId: string; requestedBy: string },
  ) => Promise<{ success: boolean; message: string }>
  updateRequestStatus: (
    id: string,
    status: Request["status"],
    approvedBy?: string,
  ) => Promise<{ success: boolean; message: string }>
  createOrder: (order: Omit<Order, "id" | "orderDate" | "status">) => Promise<{ success: boolean; message: string }>
  createRelease: (release: Omit<Release, "id" | "releaseDate">) => Promise<{ success: boolean; message: string }>
}

/* ------------------------------------------------------------------ */
/* Implementation                                                     */
/* ------------------------------------------------------------------ */

export const useHospitalStore = create<HospitalStore>()(
  persist(
    (set, get) => ({
      inventoryItems: [],
      users: [],
      requests: [],
      orders: [],
      releases: [],

      isLoading: false,
      error: null,
      isInitialized: false,

      /** Async loader to fetch data from Supabase */
      initializeStore: async () => {
        if (get().isInitialized) return

        set({ isLoading: true, error: null })
        try {
          // Fetch users
          const { data: usersData, error: usersError } = await supabase.from("users").select("*")
          if (usersError && usersError.code !== "42P01") {
            console.error("Error fetching users from Supabase:", usersError)
            throw usersError
          }
          const users =
            usersData?.map((u: any) => ({
              id: u.id,
              employeeId: u.employee_id,
              username: u.username,
              email: u.email,
              role: u.role,
              status: u.status,
              createdAt: u.created_at,
              lastLogin: u.last_login,
              firstLogin: u.first_login,
            })) || []

          // Fetch inventory items
          const { data: inventoryData, error: inventoryError } = await supabase.from("inventory_items").select("*")
          if (inventoryError && inventoryError.code !== "42P01") {
            console.error("Error fetching inventory items from Supabase:", inventoryError)
            throw inventoryError
          }
          const inventoryItems = inventoryData || []

          // Fetch requests
          const { data: requestsData, error: requestsError } = await supabase.from("requests").select("*")
          if (requestsError && requestsError.code !== "42P01") {
            console.error("Error fetching requests from Supabase:", requestsError)
            throw requestsError
          }
          const requests =
            requestsData?.map((r: any) => ({
              id: r.id,
              requestedBy: r.requested_by,
              requestedByUserId: r.requested_by_user_id,
              department: r.department,
              items: r.items, // Assuming items is JSONB and directly usable
              status: r.status,
              priority: r.priority,
              requestDate: r.request_date,
              approvalDate: r.approval_date,
              approvedBy: r.approved_by,
              notes: r.notes,
            })) || []

          // Fetch orders
          const { data: ordersData, error: ordersError } = await supabase.from("orders").select("*")
          if (ordersError && ordersError.code !== "42P01") {
            console.error("Error fetching orders from Supabase:", ordersError)
            throw ordersError
          }
          const orders =
            ordersData?.map((o: any) => ({
              id: o.id,
              orderDate: o.order_date,
              supplier: o.supplier,
              items: o.items,
              totalAmount: o.total_amount,
              status: o.status,
              orderedBy: o.ordered_by,
              receivedDate: o.received_date,
            })) || []

          // Fetch releases
          const { data: releasesData, error: releasesError } = await supabase.from("releases").select("*")
          if (releasesError && releasesError.code !== "42P01") {
            console.error("Error fetching releases from Supabase:", releasesError)
            throw releasesError
          }
          const releases =
            releasesData?.map((r: any) => ({
              id: r.id,
              releaseDate: r.release_date,
              releasedBy: r.released_by,
              department: r.department,
              items: r.items,
              notes: r.notes,
            })) || []

          set({
            users: users as UserProfile[],
            inventoryItems: inventoryItems as InventoryItem[],
            requests: requests as Request[],
            orders: orders as Order[],
            releases: releases as Release[],
            isLoading: false,
            isInitialized: true,
          })
          console.log("Hospital store initialized with data from Supabase.")
        } catch (e: any) {
          console.error("Failed to initialize store from Supabase:", e)
          set({
            isLoading: false,
            error: `Failed to load initial data: ${e.message || "Unknown error"}`,
            isInitialized: true, // Still set to true to avoid infinite loading, but show error
          })
        }
      },

      addInventoryItem: async (newItem) => {
        const item: InventoryItem = {
          id: uuidv4(),
          ...newItem,
          lastUpdated: new Date().toISOString(),
          status: newItem.currentStock <= newItem.minStockLevel ? "Low Stock" : "In Stock",
        }
        try {
          const { error } = await supabase.from("inventory_items").insert({
            id: item.id,
            name: item.name,
            category: item.category,
            current_stock: item.currentStock,
            unit_of_measure: item.unitOfMeasure,
            min_stock_level: item.minStockLevel,
            expiry_date: item.expiryDate,
            status: item.status,
            location: item.location,
            supplier: item.supplier,
            last_updated: item.lastUpdated,
          })
          if (error) throw error
          set((state) => ({ inventoryItems: [...state.inventoryItems, item] }))
          return { success: true, message: "Inventory item added successfully." }
        } catch (e: any) {
          console.error("Error adding inventory item:", e)
          return { success: false, message: `Failed to add item: ${e.message}` }
        }
      },

      updateInventoryItem: async (id, updates) => {
        const updatePayload: any = { ...updates }
        if (updates.currentStock !== undefined) updatePayload.current_stock = updates.currentStock
        if (updates.minStockLevel !== undefined) updatePayload.min_stock_level = updates.minStockLevel
        if (updates.unitOfMeasure) updatePayload.unit_of_measure = updates.unitOfMeasure
        if (updates.expiryDate) updatePayload.expiry_date = updates.expiryDate
        updatePayload.last_updated = new Date().toISOString()

        try {
          const { error } = await supabase.from("inventory_items").update(updatePayload).eq("id", id)
          if (error) throw error
          set((state) => ({
            inventoryItems: state.inventoryItems.map((item) =>
              item.id === id ? { ...item, ...updates, lastUpdated: updatePayload.last_updated } : item,
            ),
          }))
          return { success: true, message: "Inventory item updated successfully." }
        } catch (e: any) {
          console.error("Error updating inventory item:", e)
          return { success: false, message: `Failed to update item: ${e.message}` }
        }
      },

      addStock: async (itemId, quantity) => {
        const item = get().inventoryItems.find((i) => i.id === itemId)
        if (!item) return { success: false, message: "Item not found." }

        const newStock = item.currentStock + quantity
        const newStatus = newStock <= item.minStockLevel ? "Low Stock" : "In Stock"
        try {
          const { error } = await supabase
            .from("inventory_items")
            .update({ current_stock: newStock, status: newStatus, last_updated: new Date().toISOString() })
            .eq("id", itemId)
          if (error) throw error
          set((state) => ({
            inventoryItems: state.inventoryItems.map((i) =>
              i.id === itemId ? { ...i, currentStock: newStock, status: newStatus } : i,
            ),
          }))
          return { success: true, message: "Stock added successfully." }
        } catch (e: any) {
          console.error("Error adding stock:", e)
          return { success: false, message: `Failed to add stock: ${e.message}` }
        }
      },

      releaseStock: async (itemId, quantity) => {
        const item = get().inventoryItems.find((i) => i.id === itemId)
        if (!item) return { success: false, message: "Item not found." }

        const newStock = item.currentStock - quantity
        if (newStock < 0) {
          return { success: false, message: "Cannot release more stock than available." }
        }
        const newStatus = newStock <= item.minStockLevel ? "Low Stock" : "In Stock"
        try {
          const { error } = await supabase
            .from("inventory_items")
            .update({ current_stock: newStock, status: newStatus, last_updated: new Date().toISOString() })
            .eq("id", itemId)
          if (error) throw error
          set((state) => ({
            inventoryItems: state.inventoryItems.map((i) =>
              i.id === itemId ? { ...i, currentStock: newStock, status: newStatus } : i,
            ),
          }))
          return { success: true, message: "Stock released successfully." }
        } catch (e: any) {
          console.error("Error releasing stock:", e)
          return { success: false, message: `Failed to release stock: ${e.message}` }
        }
      },

      createRequest: async (newRequest) => {
        const request: Request = {
          id: uuidv4(),
          ...newRequest,
          requestDate: new Date().toISOString(),
          status: "Pending", // Default status
        }

        try {
          const { error } = await supabase.from("requests").insert({
            id: request.id,
            requested_by: request.requestedBy,
            requested_by_user_id: request.requestedByUserId,
            department: request.department,
            items: request.items,
            status: request.status,
            priority: request.priority,
            request_date: request.requestDate,
            notes: request.notes,
          })
          if (error) throw error
          set((state) => ({ requests: [...state.requests, request] }))
          return { success: true, message: "Request created successfully!" }
        } catch (e: any) {
          console.error("Error creating request:", e)
          return { success: false, message: `Failed to create request: ${e.message}` }
        }
      },

      updateRequestStatus: async (id, status, approvedBy) => {
        const updatePayload: any = { status }
        if (status === "Approved" || status === "Rejected") {
          updatePayload.approval_date = new Date().toISOString()
          updatePayload.approved_by = approvedBy
        }
        try {
          const { error } = await supabase.from("requests").update(updatePayload).eq("id", id)
          if (error) throw error
          set((state) => ({
            requests: state.requests.map((req) =>
              req.id === id
                ? {
                    ...req,
                    status,
                    approvalDate: updatePayload.approval_date,
                    approvedBy: updatePayload.approved_by,
                  }
                : req,
            ),
          }))
          return { success: true, message: "Request status updated successfully." }
        } catch (e: any) {
          console.error("Error updating request status:", e)
          return { success: false, message: `Failed to update request status: ${e.message}` }
        }
      },

      createOrder: async (newOrder) => {
        const order: Order = {
          id: uuidv4(),
          ...newOrder,
          orderDate: new Date().toISOString(),
          status: "Pending",
        }
        try {
          const { error } = await supabase.from("orders").insert({
            id: order.id,
            order_date: order.orderDate,
            supplier: order.supplier,
            items: order.items,
            total_amount: order.totalAmount,
            status: order.status,
            ordered_by: order.orderedBy,
            received_date: order.receivedDate,
          })
          if (error) throw error
          set((state) => ({ orders: [...state.orders, order] }))
          return { success: true, message: "Order created successfully." }
        } catch (e: any) {
          console.error("Error creating order:", e)
          return { success: false, message: `Failed to create order: ${e.message}` }
        }
      },

      createRelease: async (newRelease) => {
        const release: Release = {
          id: uuidv4(),
          ...newRelease,
          releaseDate: new Date().toISOString(),
        }
        try {
          const { error } = await supabase.from("releases").insert({
            id: release.id,
            release_date: release.releaseDate,
            released_by: release.releasedBy,
            department: release.department,
            items: release.items,
            notes: release.notes,
          })
          if (error) throw error
          set((state) => ({ releases: [...state.releases, release] }))
          return { success: true, message: "Release created successfully." }
        } catch (e: any) {
          console.error("Error creating release:", e)
          return { success: false, message: `Failed to create release: ${e.message}` }
        }
      },
    }),
    {
      name: "hospital-inventory-store", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      version: 1, // Version for migrations
      onRehydrateStorage: () => {
        console.log("Hospital store rehydration started")
        return (_persistedState, error) => {
          if (error) {
            console.error("Failed to rehydrate hospital store:", error)
          } else {
            console.log("Hospital store rehydration finished")
          }
        }
      },
      // Only persist necessary parts of the state
      partialize: (state) => ({
        inventoryItems: state.inventoryItems,
        users: state.users,
        requests: state.requests,
        orders: state.orders,
        releases: state.releases,
        isInitialized: state.isInitialized,
      }),
    },
  ),
)
