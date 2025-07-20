import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs" // Synchronous bcrypt for server-side hashing
import { v4 as uuidv4 } from "uuid"

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback to a stub client if keys are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Using a stub Supabase client.")
    return {
      from: () => ({
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: [], error: null }),
        update: async () => ({ data: [], error: null }),
        delete: async () => ({ data: [], error: null }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        updateUser: async () => ({ data: { user: null }, error: null }),
      },
    } as any // Cast to any to match the SupabaseClient type loosely
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// Type Definitions
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
  passwordHash?: string // Stored separately for security, but useful for initial setup/migration
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  unitOfMeasure: string
  minStockLevel: number
  expiryDate?: string
  status: "In Stock" | "Low Stock" | "Critical" | "Expired"
  location: string
  supplier: string
  lastUpdated: string
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
  requestDate: string
  approvalDate?: string
  approvedBy?: string
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
  orderDate: string
  supplier: string
  items: OrderItem[]
  totalAmount: number
  status: "Pending" | "Ordered" | "Received" | "Cancelled"
  orderedBy: string
  receivedDate?: string
}

export interface ReleaseItem {
  itemId: string
  itemName: string
  quantity: number
  unitOfMeasure: string
}

export interface Release {
  id: string
  releaseDate: string
  releasedBy: string
  department: string
  items: ReleaseItem[]
  notes?: string
}

interface HospitalState {
  users: UserProfile[]
  inventoryItems: InventoryItem[]
  requests: Request[]
  orders: Order[]
  releases: Release[]
  currentUser: UserProfile | null
  isAuthenticated: boolean
  loginError: string | null
  isInitialized: boolean
  passwordHashes: Record<string, string> // Store password hashes by employeeId
  initializeStore: () => Promise<void>
  login: (employeeId: string, password: string) => Promise<boolean>
  logout: () => void
  registerUser: (
    userData: Omit<UserProfile, "id" | "createdAt" | "status" | "firstLogin"> & { password: string },
  ) => Promise<{ success: boolean; message: string }>
  updateUser: (id: string, updates: Partial<UserProfile>) => void
  deleteUser: (id: string) => void
  addInventoryItem: (item: Omit<InventoryItem, "id" | "lastUpdated" | "status">) => void
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
  addStock: (itemId: string, quantity: number) => void
  releaseStock: (itemId: string, quantity: number) => void
  createRequest: (
    request: Omit<Request, "id" | "requestDate" | "status" | "requestedByUserId">,
  ) => Promise<{ success: boolean; message: string }>
  updateRequestStatus: (id: string, status: Request["status"], approvedBy?: string) => void
  createOrder: (order: Omit<Order, "id" | "orderDate" | "status">) => void
  createRelease: (release: Omit<Release, "id" | "releaseDate">) => void
  changePassword: (
    employeeId: string,
    oldPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>
  resetPassword: (employeeId: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  checkFirstLogin: (employeeId: string) => void
  updateUserLastLogin: (employeeId: string) => void
  updateUserStatus: (employeeId: string, status: UserStatus) => void
  updateUserRole: (employeeId: string, role: UserRole) => void
  updateUserPermissions: (employeeId: string, permissions: UserRole) => void // Assuming role implies permissions
}

// Helper to generate initial data if store is empty
const getInitialData = (): Omit<
  HospitalState,
  | "initializeStore"
  | "login"
  | "logout"
  | "registerUser"
  | "updateUser"
  | "deleteUser"
  | "addInventoryItem"
  | "updateInventoryItem"
  | "addStock"
  | "releaseStock"
  | "createRequest"
  | "updateRequestStatus"
  | "createOrder"
  | "createRelease"
  | "changePassword"
  | "resetPassword"
  | "checkFirstLogin"
  | "updateUserLastLogin"
  | "updateUserStatus"
  | "updateUserRole"
  | "updateUserPermissions"
> => {
  const defaultAdminPassword = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD || "admin123"
  const adminPasswordHash = bcrypt.hashSync(defaultAdminPassword, 10)

  const initialUsers: UserProfile[] = [
    {
      id: uuidv4(),
      employeeId: "EMP001",
      username: "Admin User",
      email: "admin@example.com",
      role: "admin",
      status: "Active",
      createdAt: new Date().toISOString(),
      firstLogin: true,
    },
    {
      id: uuidv4(),
      employeeId: "EMP002",
      username: "Dr. Smith",
      email: "smith@example.com",
      role: "doctor",
      status: "Active",
      createdAt: new Date().toISOString(),
      firstLogin: true,
    },
    {
      id: uuidv4(),
      employeeId: "EMP003",
      username: "Nurse Jane",
      email: "jane@example.com",
      role: "nurse",
      status: "Active",
      createdAt: new Date().toISOString(),
      firstLogin: true,
    },
  ]

  const initialPasswordHashes: Record<string, string> = {
    EMP001: adminPasswordHash,
    EMP002: bcrypt.hashSync("doctor123", 10),
    EMP003: bcrypt.hashSync("nurse123", 10),
  }

  const initialInventoryItems: InventoryItem[] = [
    {
      id: uuidv4(),
      name: "Paracetamol 500mg",
      category: "Medication",
      currentStock: 1500,
      unitOfMeasure: "tablets",
      minStockLevel: 500,
      expiryDate: "2025-12-31",
      status: "In Stock",
      location: "Pharmacy Shelf A1",
      supplier: "PharmaCorp",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Sterile Gloves",
      category: "Medical Supplies",
      currentStock: 300,
      unitOfMeasure: "pairs",
      minStockLevel: 100,
      expiryDate: "2024-10-15",
      status: "In Stock",
      location: "Storage Room B2",
      supplier: "MediSupply",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Bandages (Assorted)",
      category: "Medical Supplies",
      currentStock: 80,
      unitOfMeasure: "rolls",
      minStockLevel: 50,
      expiryDate: "2025-06-01",
      status: "In Stock",
      location: "Ward 1 Supply",
      supplier: "HealthAid",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Syringes 5ml",
      category: "Medical Supplies",
      currentStock: 400,
      unitOfMeasure: "units",
      minStockLevel: 200,
      expiryDate: "2024-09-01",
      status: "In Stock",
      location: "Pharmacy Shelf A2",
      supplier: "PharmaCorp",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Amoxicillin 250mg",
      category: "Medication",
      currentStock: 120,
      unitOfMeasure: "capsules",
      minStockLevel: 150,
      expiryDate: "2024-08-20",
      status: "Low Stock",
      location: "Pharmacy Shelf B1",
      supplier: "Global Meds",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Surgical Masks",
      category: "PPE",
      currentStock: 50,
      unitOfMeasure: "boxes",
      minStockLevel: 75,
      expiryDate: "2025-01-01",
      status: "Low Stock",
      location: "Storage Room C1",
      supplier: "Safety First",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "IV Fluids (Saline)",
      category: "Medication",
      currentStock: 15,
      unitOfMeasure: "bags",
      minStockLevel: 20,
      expiryDate: "2024-07-10",
      status: "Critical",
      location: "Emergency Stock",
      supplier: "LifeLine Pharma",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Defibrillator Pads",
      category: "Equipment",
      currentStock: 5,
      unitOfMeasure: "pairs",
      minStockLevel: 10,
      expiryDate: "2024-06-30",
      status: "Critical",
      location: "Emergency Room",
      supplier: "MedTech Solutions",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Hand Sanitizer",
      category: "Hygiene",
      currentStock: 200,
      unitOfMeasure: "bottles",
      minStockLevel: 100,
      expiryDate: "2025-11-01",
      status: "In Stock",
      location: "Various Wards",
      supplier: "CleanCare",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Blood Pressure Cuffs",
      category: "Equipment",
      currentStock: 30,
      unitOfMeasure: "units",
      minStockLevel: 15,
      expiryDate: "N/A", // No expiry for equipment
      status: "In Stock",
      location: "Equipment Storage",
      supplier: "HealthDevices",
      lastUpdated: new Date().toISOString(),
    },
  ]

  const initialRequests: Request[] = [
    {
      id: uuidv4(),
      requestedBy: "Dr. Smith",
      requestedByUserId: initialUsers[1].id, // Link to Dr. Smith
      department: "Emergency",
      items: [
        { itemId: initialInventoryItems[6].id, itemName: "IV Fluids (Saline)", quantity: 5, unitOfMeasure: "bags" },
        { itemId: initialInventoryItems[7].id, itemName: "Defibrillator Pads", quantity: 2, unitOfMeasure: "pairs" },
      ],
      status: "Pending",
      priority: "Urgent",
      requestDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      notes: "Patient in critical condition, urgent need.",
    },
    {
      id: uuidv4(),
      requestedBy: "Nurse Jane",
      requestedByUserId: initialUsers[2].id, // Link to Nurse Jane
      department: "Ward 3",
      items: [
        { itemId: initialInventoryItems[0].id, itemName: "Paracetamol 500mg", quantity: 100, unitOfMeasure: "tablets" },
        { itemId: initialInventoryItems[2].id, itemName: "Bandages (Assorted)", quantity: 10, unitOfMeasure: "rolls" },
      ],
      status: "Approved",
      priority: "Medium",
      requestDate: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      approvalDate: new Date(Date.now() - 1.5 * 86400000).toISOString(),
      approvedBy: "Admin User",
      notes: "Routine ward supply.",
    },
    {
      id: uuidv4(),
      requestedBy: "Admin User",
      requestedByUserId: initialUsers[0].id, // Link to Admin User
      department: "Pharmacy",
      items: [
        { itemId: initialInventoryItems[4].id, itemName: "Amoxicillin 250mg", quantity: 50, unitOfMeasure: "capsules" },
      ],
      status: "Pending",
      priority: "High",
      requestDate: new Date().toISOString(), // Today
      notes: "Replenish low stock.",
    },
  ]

  return {
    users: initialUsers,
    inventoryItems: initialInventoryItems,
    requests: initialRequests,
    orders: [],
    releases: [],
    currentUser: null,
    isAuthenticated: false,
    loginError: null,
    isInitialized: false,
    passwordHashes: initialPasswordHashes,
  }
}

export const useHospitalStore = create<HospitalState>()(
  persist(
    (set, get) => ({
      ...getInitialData(), // Initialize with default data
      isInitialized: false, // Set to false initially, will be true after rehydration

      initializeStore: async () => {
        if (get().isInitialized) return

        set({ isLoading: true })
        try {
          // Fetch users from Supabase
          const { data: usersData, error: usersError } = await supabase.from("users").select("*")
          if (usersError) {
            console.error("Error fetching users from Supabase:", usersError)
            // If table doesn't exist (42P01), log warning and proceed with empty array
            if (usersError.code === "42P01") {
              console.warn('Table "public.users" does not exist. Initializing with in-memory data.')
              set({ isInitialized: true, isLoading: false })
              return // Exit if table doesn't exist, use in-memory data
            }
            throw usersError
          }

          // Fetch inventory items from Supabase
          const { data: inventoryData, error: inventoryError } = await supabase.from("inventory_items").select("*")
          if (inventoryError) {
            console.error("Error fetching inventory items from Supabase:", inventoryError)
            if (inventoryError.code === "42P01") {
              console.warn('Table "public.inventory_items" does not exist. Initializing with in-memory data.')
              set({ isInitialized: true, isLoading: false })
              return
            }
            throw inventoryError
          }

          // Fetch requests from Supabase
          const { data: requestsData, error: requestsError } = await supabase.from("requests").select("*")
          if (requestsError) {
            console.error("Error fetching requests from Supabase:", requestsError)
            if (requestsError.code === "42P01") {
              console.warn('Table "public.requests" does not exist. Initializing with in-memory data.')
              set({ isInitialized: true, isLoading: false })
              return
            }
            throw requestsError
          }

          // Fetch orders from Supabase
          const { data: ordersData, error: ordersError } = await supabase.from("orders").select("*")
          if (ordersError) {
            console.error("Error fetching orders from Supabase:", ordersError)
            if (ordersError.code === "42P01") {
              console.warn('Table "public.orders" does not exist. Initializing with in-memory data.')
              set({ isInitialized: true, isLoading: false })
              return
            }
            throw ordersError
          }

          // Fetch releases from Supabase
          const { data: releasesData, error: releasesError } = await supabase.from("releases").select("*")
          if (releasesError) {
            console.error("Error fetching releases from Supabase:", releasesError)
            if (releasesError.code === "42P01") {
              console.warn('Table "public.releases" does not exist. Initializing with in-memory data.')
              set({ isInitialized: true, isLoading: false })
              return
            }
            throw releasesError
          }

          // Only use fetched data if it's not empty, otherwise use initial data
          const usersToUse = usersData && usersData.length > 0 ? usersData : getInitialData().users
          const inventoryToUse =
            inventoryData && inventoryData.length > 0 ? inventoryData : getInitialData().inventoryItems
          const requestsToUse = requestsData && requestsData.length > 0 ? requestsData : getInitialData().requests
          const ordersToUse = ordersData && ordersData.length > 0 ? ordersData : getInitialData().orders
          const releasesToUse = releasesData && releasesData.length > 0 ? releasesData : getInitialData().releases

          // Reconstruct password hashes from fetched users if they exist, otherwise use initial
          const passwordHashesToUse: Record<string, string> = {}
          if (usersData && usersData.length > 0) {
            usersData.forEach((user: any) => {
              if (user.password_hash) {
                passwordHashesToUse[user.employeeId] = user.password_hash
              }
            })
          } else {
            Object.assign(passwordHashesToUse, getInitialData().passwordHashes)
          }

          set({
            users: usersToUse as UserProfile[],
            inventoryItems: inventoryToUse as InventoryItem[],
            requests: requestsToUse as Request[],
            orders: ordersToUse as Order[],
            releases: releasesToUse as Release[],
            passwordHashes: passwordHashesToUse,
            isInitialized: true,
            isLoading: false,
          })
        } catch (error) {
          console.error("Failed to initialize store from Supabase:", error)
          // Fallback to initial data if Supabase fetch fails for any other reason
          set({ ...getInitialData(), isInitialized: true, isLoading: false })
        }
      },

      login: async (employeeId, password) => {
        set({ loginError: null })
        const state = get()
        const user = state.users.find((u) => u.employeeId === employeeId)

        if (!user) {
          set({ loginError: "Login error: User not found." })
          return false
        }

        if (user.status === "Locked") {
          set({ loginError: "Login error: Account is locked. Please contact support." })
          return false
        }
        if (user.status === "Inactive") {
          set({ loginError: "Login error: Account is inactive. Please contact support." })
          return false
        }
        if (user.status === "Pending") {
          set({ loginError: "Login error: Account is pending approval. Please contact support." })
          return false
        }

        const storedHash = state.passwordHashes[employeeId]

        if (!storedHash) {
          set({ loginError: "Login error: Password not set for this user." })
          return false
        }

        // Use synchronous bcrypt.compareSync
        const isPasswordValid = bcrypt.compareSync(password, storedHash)

        if (isPasswordValid) {
          set({
            currentUser: { ...user, firstLogin: user.firstLogin ?? true },
            isAuthenticated: true,
            loginError: null,
          })
          // Update last login and first login status
          get().updateUserLastLogin(employeeId)
          if (user.firstLogin) {
            get().checkFirstLogin(employeeId)
          }
          return true
        } else {
          set({ loginError: "Login error: Invalid password." })
          return false
        }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, loginError: null })
      },

      registerUser: async (userData) => {
        const state = get()
        if (state.users.some((u) => u.employeeId === userData.employeeId)) {
          return { success: false, message: "Employee ID already exists." }
        }
        if (state.users.some((u) => u.email === userData.email)) {
          return { success: false, message: "Email already registered." }
        }

        const newUserId = uuidv4()
        const hashedPassword = bcrypt.hashSync(userData.password, 10) // Hash password synchronously

        const newUser: UserProfile = {
          id: newUserId,
          ...userData,
          status: "Active", // Default status for new users
          createdAt: new Date().toISOString(),
          firstLogin: true, // Mark as first login
        }

        try {
          // Insert into Supabase
          const { data, error } = await supabase
            .from("users")
            .insert({
              id: newUser.id,
              employee_id: newUser.employeeId,
              username: newUser.username,
              email: newUser.email,
              role: newUser.role,
              status: newUser.status,
              created_at: newUser.createdAt,
              first_login: newUser.firstLogin,
              password_hash: hashedPassword, // Store hash in DB
            })
            .select()

          if (error) {
            console.error("Supabase registration error:", error)
            return { success: false, message: `Registration failed: ${error.message}` }
          }

          set((state) => ({
            users: [...state.users, newUser],
            passwordHashes: {
              ...state.passwordHashes,
              [newUser.employeeId]: hashedPassword,
            },
          }))
          return { success: true, message: "User registered successfully!" }
        } catch (e: any) {
          console.error("Registration failed:", e)
          return { success: false, message: `Registration failed: ${e.message || "Unknown error"}` }
        }
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }))
      },

      addInventoryItem: (newItem) => {
        const item: InventoryItem = {
          id: uuidv4(),
          ...newItem,
          lastUpdated: new Date().toISOString(),
          status: newItem.currentStock <= newItem.minStockLevel ? "Low Stock" : "In Stock",
        }
        set((state) => ({ inventoryItems: [...state.inventoryItems, item] }))
      },

      updateInventoryItem: (id, updates) => {
        set((state) => ({
          inventoryItems: state.inventoryItems.map((item) =>
            item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item,
          ),
        }))
      },

      addStock: (itemId, quantity) => {
        set((state) => ({
          inventoryItems: state.inventoryItems.map((item) => {
            if (item.id === itemId) {
              const newStock = item.currentStock + quantity
              return {
                ...item,
                currentStock: newStock,
                status: newStock <= item.minStockLevel ? "Low Stock" : "In Stock",
                lastUpdated: new Date().toISOString(),
              }
            }
            return item
          }),
        }))
      },

      releaseStock: (itemId, quantity) => {
        set((state) => ({
          inventoryItems: state.inventoryItems.map((item) => {
            if (item.id === itemId) {
              const newStock = item.currentStock - quantity
              if (newStock < 0) {
                console.warn(
                  `Attempted to release ${quantity} of ${item.name}, but only ${item.currentStock} available. Stock set to 0.`,
                )
                return {
                  ...item,
                  currentStock: 0,
                  status: "Critical",
                  lastUpdated: new Date().toISOString(),
                }
              }
              return {
                ...item,
                currentStock: newStock,
                status: newStock <= item.minStockLevel ? "Low Stock" : "In Stock",
                lastUpdated: new Date().toISOString(),
              }
            }
            return item
          }),
        }))
      },

      createRequest: async (newRequest) => {
        const currentUser = get().currentUser
        if (!currentUser) {
          return { success: false, message: "User not authenticated to create request." }
        }

        const request: Request = {
          id: uuidv4(),
          ...newRequest,
          requestedBy: currentUser.username, // Use current user's username
          requestedByUserId: currentUser.id, // Use current user's UUID
          requestDate: new Date().toISOString(),
          status: "Pending", // Default status
        }

        try {
          const { data, error } = await supabase
            .from("requests")
            .insert({
              id: request.id,
              requested_by: request.requestedBy,
              requested_by_user_id: request.requestedByUserId,
              department: request.department,
              items: request.items, // Supabase handles JSONB
              status: request.status,
              priority: request.priority,
              request_date: request.requestDate,
              notes: request.notes,
            })
            .select()

          if (error) {
            console.error("Supabase create request error:", error)
            return { success: false, message: `Failed to create request: ${error.message}` }
          }

          set((state) => ({ requests: [...state.requests, request] }))
          return { success: true, message: "Request created successfully!" }
        } catch (e: any) {
          console.error("Create request failed:", e)
          return { success: false, message: `Failed to create request: ${e.message || "Unknown error"}` }
        }
      },

      updateRequestStatus: (id, status, approvedBy) => {
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === id
              ? {
                  ...req,
                  status,
                  approvalDate:
                    status === "Approved" || status === "Rejected" ? new Date().toISOString() : req.approvalDate,
                  approvedBy: approvedBy || req.approvedBy,
                }
              : req,
          ),
        }))
      },

      createOrder: (newOrder) => {
        const order: Order = {
          id: uuidv4(),
          ...newOrder,
          orderDate: new Date().toISOString(),
          status: "Pending", // Default status
        }
        set((state) => ({ orders: [...state.orders, order] }))
      },

      createRelease: (newRelease) => {
        const release: Release = {
          id: uuidv4(),
          ...newRelease,
          releaseDate: new Date().toISOString(),
        }
        set((state) => ({ releases: [...state.releases, release] }))
      },

      changePassword: async (employeeId, oldPassword, newPassword) => {
        const state = get()
        const storedHash = state.passwordHashes[employeeId]

        if (!storedHash || !bcrypt.compareSync(oldPassword, storedHash)) {
          return { success: false, message: "Invalid old password." }
        }

        const newHashedPassword = bcrypt.hashSync(newPassword, 10)

        try {
          // Update in Supabase
          const { error } = await supabase
            .from("users")
            .update({ password_hash: newHashedPassword })
            .eq("employee_id", employeeId)

          if (error) {
            console.error("Supabase password change error:", error)
            return { success: false, message: `Failed to change password: ${error.message}` }
          }

          set((state) => ({
            passwordHashes: {
              ...state.passwordHashes,
              [employeeId]: newHashedPassword,
            },
            users: state.users.map((user) => (user.employeeId === employeeId ? { ...user, firstLogin: false } : user)),
          }))
          return { success: true, message: "Password changed successfully." }
        } catch (e: any) {
          console.error("Password change failed:", e)
          return { success: false, message: `Password change failed: ${e.message || "Unknown error"}` }
        }
      },

      resetPassword: async (employeeId, newPassword) => {
        const newHashedPassword = bcrypt.hashSync(newPassword, 10)

        try {
          // Update in Supabase
          const { error } = await supabase
            .from("users")
            .update({ password_hash: newHashedPassword, first_login: false })
            .eq("employee_id", employeeId)

          if (error) {
            console.error("Supabase password reset error:", error)
            return { success: false, message: `Failed to reset password: ${error.message}` }
          }

          set((state) => ({
            passwordHashes: {
              ...state.passwordHashes,
              [employeeId]: newHashedPassword,
            },
            users: state.users.map((user) => (user.employeeId === employeeId ? { ...user, firstLogin: false } : user)),
          }))
          return { success: true, message: "Password reset successfully." }
        } catch (e: any) {
          console.error("Password reset failed:", e)
          return { success: false, message: `Password reset failed: ${e.message || "Unknown error"}` }
        }
      },

      checkFirstLogin: (employeeId) => {
        set((state) => ({
          users: state.users.map((user) => (user.employeeId === employeeId ? { ...user, firstLogin: false } : user)),
        }))
      },

      updateUserLastLogin: (employeeId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.employeeId === employeeId ? { ...user, lastLogin: new Date().toISOString() } : user,
          ),
        }))
      },

      updateUserStatus: (employeeId, status) => {
        set((state) => ({
          users: state.users.map((user) => (user.employeeId === employeeId ? { ...user, status } : user)),
        }))
      },

      updateUserRole: (employeeId, role) => {
        set((state) => ({
          users: state.users.map((user) => (user.employeeId === employeeId ? { ...user, role } : user)),
        }))
      },

      updateUserPermissions: (employeeId, permissions) => {
        // In this simplified model, role directly implies permissions.
        // If you had a more granular permission system, you'd update that here.
        set((state) => ({
          users: state.users.map((user) => (user.employeeId === employeeId ? { ...user, role: permissions } : user)),
        }))
      },
    }),
    {
      name: "hospital-store", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      version: 1, // Version for migrations
      migrate: (persistedState, version) => {
        if (version === 0) {
          // If you had a previous version 0, you could migrate it here.
          // For now, we're starting at version 1.
        }
        return persistedState as HospitalState
      },
      onRehydrateStorage: () => {
        console.log("Store rehydration started")
        return (_persistedState, error) => {
          if (error) {
            console.error("Failed to rehydrate store:", error)
          } else {
            console.log("Store rehydration finished")
          }
        }
      },
      // Only persist necessary parts of the state
      partialize: (state) => ({
        users: state.users,
        inventoryItems: state.inventoryItems,
        requests: state.requests,
        orders: state.orders,
        releases: state.releases,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        passwordHashes: state.passwordHashes,
        isInitialized: state.isInitialized,
      }),
    },
  ),
)
