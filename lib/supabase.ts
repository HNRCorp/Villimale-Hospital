import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  Supabase environment variables not found!")
  console.warn("📋 Please check your .env.local file contains:")
  console.warn("   - NEXT_PUBLIC_SUPABASE_URL")
  console.warn("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
  console.warn("   - SUPABASE_SERVICE_ROLE_KEY")
  console.warn("")
  console.warn("🔧 Run: node scripts/check-env.js to verify setup")
}

// Supabase client setup for client-side operations (e.g., fetching data with RLS)
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Using a stub Supabase client for client-side operations.")
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
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = createSupabaseClient()

// Create admin client (for server-side operations with elevated privileges)
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : createStubClient()

// Stub client for when environment variables are missing
function createStubClient() {
  const stubResponse = { data: [], error: null }
  const stubAuth = {
    signIn: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  }

  return {
    from: () => ({
      select: () => Promise.resolve(stubResponse),
      insert: () => Promise.resolve(stubResponse),
      update: () => Promise.resolve(stubResponse),
      delete: () => Promise.resolve(stubResponse),
      upsert: () => Promise.resolve(stubResponse),
    }),
    auth: stubAuth,
    rpc: () => Promise.resolve(stubResponse),
  }
}

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          employee_id: string
          role: string
          permissions: string[]
          status: string
          failed_login_attempts: number
          last_login: string | null
          first_login: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          employee_id: string
          role: string
          permissions?: string[]
          status?: string
          failed_login_attempts?: number
          last_login?: string | null
          first_login?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          employee_id?: string
          role?: string
          permissions?: string[]
          status?: string
          failed_login_attempts?: number
          last_login?: string | null
          first_login?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          unit_of_measure: string
          current_stock: number
          minimum_stock: number
          maximum_stock: number
          unit_cost: number
          supplier: string | null
          location: string | null
          expiry_date: string | null
          batch_number: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          unit_of_measure: string
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number
          unit_cost?: number
          supplier?: string | null
          location?: string | null
          expiry_date?: string | null
          batch_number?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          unit_of_measure?: string
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number
          unit_cost?: number
          supplier?: string | null
          location?: string | null
          expiry_date?: string | null
          batch_number?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
