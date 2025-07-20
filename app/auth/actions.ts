// app/auth/actions.ts
"use server"

import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import type { UserProfile, UserRole, UserStatus } from "@/lib/types"

// Supabase client for server actions (uses service role key for elevated privileges)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ensure environment variables are set
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key for server actions.")
  // In a real app, you might throw an error or handle this more gracefully
  // For now, we'll proceed with a client that will likely fail if used.
}

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!)

export async function loginUser(
  employeeId: string,
  password: string,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, employee_id, username, email, role, status, created_at, last_login, first_login, password_hash")
      .eq("employee_id", employeeId)
      .single()

    if (error || !data) {
      console.error("Login error (DB fetch):", error?.message || "User not found")
      return { success: false, error: "Invalid credentials or user not found." }
    }

    const user = {
      id: data.id,
      employeeId: data.employee_id,
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      createdAt: data.created_at,
      lastLogin: data.last_login,
      firstLogin: data.first_login,
    } as UserProfile

    if (user.status === "Locked") {
      return { success: false, error: "Account is locked. Please contact support." }
    }
    if (user.status === "Inactive") {
      return { success: false, error: "Account is inactive. Please contact support." }
    }
    if (user.status === "Pending") {
      return { success: false, error: "Account is pending approval. Please contact support." }
    }

    const isPasswordValid = bcrypt.compareSync(password, data.password_hash)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid password." }
    }

    // Update last login
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    return { success: true, user }
  } catch (e: any) {
    console.error("Server action login error:", e)
    return { success: false, error: `Login failed: ${e.message || "Unknown error"}` }
  }
}

export async function registerUser(
  userData: Omit<UserProfile, "id" | "createdAt" | "status" | "firstLogin" | "lastLogin"> & { password: string },
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if employeeId or email already exists
    const { data: existingUsers, error: existingError } = await supabase
      .from("users")
      .select("id, employee_id, email")
      .or(`employee_id.eq.${userData.employeeId},email.eq.${userData.email}`)

    if (existingError) {
      console.error("Supabase check existing user error:", existingError)
      return { success: false, message: `Registration failed: ${existingError.message}` }
    }

    if (existingUsers && existingUsers.length > 0) {
      if (existingUsers.some((u: any) => u.employee_id === userData.employeeId)) {
        return { success: false, message: "Employee ID already exists." }
      }
      if (existingUsers.some((u: any) => u.email === userData.email)) {
        return { success: false, message: "Email already registered." }
      }
    }

    const newUserId = uuidv4()
    const hashedPassword = bcrypt.hashSync(userData.password, 10)

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: newUserId,
        employee_id: userData.employeeId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: "Active", // Default status for new users
        created_at: new Date().toISOString(),
        first_login: true, // Mark as first login
        password_hash: hashedPassword,
      })
      .select()

    if (error) {
      console.error("Supabase registration error:", error)
      return { success: false, message: `Registration failed: ${error.message}` }
    }

    return { success: true, message: "User registered successfully!" }
  } catch (e: any) {
    console.error("Server action register error:", e)
    return { success: false, message: `Registration failed: ${e.message || "Unknown error"}` }
  }
}

export async function changeUserPassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from("users").select("password_hash").eq("id", userId).single()

    if (error || !data) {
      return { success: false, message: "User not found or password hash missing." }
    }

    const isOldPasswordValid = bcrypt.compareSync(oldPassword, data.password_hash)
    if (!isOldPasswordValid) {
      return { success: false, message: "Invalid old password." }
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10)

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash, first_login: false })
      .eq("id", userId)

    if (updateError) {
      console.error("Supabase password change error:", updateError)
      return { success: false, message: `Failed to change password: ${updateError.message}` }
    }

    return { success: true, message: "Password changed successfully." }
  } catch (e: any) {
    console.error("Server action change password error:", e)
    return { success: false, message: `Password change failed: ${e.message || "Unknown error"}` }
  }
}

export async function resetUserPassword(
  employeeId: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const newPasswordHash = bcrypt.hashSync(newPassword, 10)

    const { error } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash, first_login: false })
      .eq("employee_id", employeeId)

    if (error) {
      console.error("Supabase password reset error:", error)
      return { success: false, message: `Failed to reset password: ${error.message}` }
    }

    return { success: true, message: "Password reset successfully." }
  } catch (e: any) {
    console.error("Server action reset password error:", e)
    return { success: false, message: `Password reset failed: ${e.message || "Unknown error"}` }
  }
}

export async function fetchUsersServer(): Promise<{ users?: UserProfile[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, employee_id, username, email, role, status, created_at, last_login, first_login")

    if (error) {
      console.error("Error fetching users from Supabase (server):", error.message)
      return { error: `Error fetching users: ${error.message}` }
    }

    const users: UserProfile[] = data.map((u: any) => ({
      id: u.id,
      employeeId: u.employee_id,
      username: u.username,
      email: u.email,
      role: u.role as UserRole,
      status: u.status as UserStatus,
      createdAt: u.created_at,
      lastLogin: u.last_login,
      firstLogin: u.first_login,
    }))

    return { users }
  } catch (e: any) {
    console.error("Server action fetch users error:", e)
    return { error: `Failed to fetch users: ${e.message || "Unknown error"}` }
  }
}

export async function updateUserServer(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<{ success: boolean; message: string }> {
  try {
    const updatePayload: any = { ...updates }
    // Map camelCase to snake_case for Supabase columns
    if (updates.employeeId) {
      updatePayload.employee_id = updates.employeeId
      delete updatePayload.employeeId
    }
    if (updates.firstLogin !== undefined) {
      updatePayload.first_login = updates.firstLogin
      delete updatePayload.firstLogin
    }
    if (updates.lastLogin) {
      updatePayload.last_login = updates.lastLogin
      delete updatePayload.lastLogin
    }
    if (updates.createdAt) {
      updatePayload.created_at = updates.createdAt
      delete updatePayload.createdAt
    }

    const { error } = await supabase.from("users").update(updatePayload).eq("id", userId)

    if (error) {
      console.error("Supabase update user error:", error)
      return { success: false, message: `Failed to update user: ${error.message}` }
    }

    return { success: true, message: "User updated successfully." }
  } catch (e: any) {
    console.error("Server action update user error:", e)
    return { success: false, message: `Failed to update user: ${e.message || "Unknown error"}` }
  }
}

export async function deleteUserServer(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Supabase delete user error:", error)
      return { success: false, message: `Failed to delete user: ${error.message}` }
    }

    return { success: true, message: "User deleted successfully." }
  } catch (e: any) {
    console.error("Server action delete user error:", e)
    return { success: false, message: `Failed to delete user: ${e.message || "Unknown error"}` }
  }
}
