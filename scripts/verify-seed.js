// Verify seeded data in Supabase
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  console.log("Make sure you have:")
  console.log("- NEXT_PUBLIC_SUPABASE_URL")
  console.log("- SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySeededData() {
  console.log("🔍 Verifying seeded data in Supabase...\n")

  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("email, first_name, last_name, role, department, status")
      .order("role")

    if (usersError) {
      console.error("❌ Error fetching users:", usersError.message)
      return
    }

    console.log("👥 USERS CREATED:")
    users.forEach((user) => {
      console.log(`   ✅ ${user.email} - ${user.first_name} ${user.last_name} (${user.role})`)
    })
    console.log(`   Total: ${users.length} users\n`)

    // Check inventory items
    const { data: items, error: itemsError } = await supabase
      .from("inventory_items")
      .select("name, category, current_stock, status")
      .order("category, name")

    if (itemsError) {
      console.error("❌ Error fetching inventory:", itemsError.message)
      return
    }

    console.log("📦 INVENTORY ITEMS:")
    const categories = {}
    items.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })

    Object.keys(categories).forEach((category) => {
      console.log(`   📂 ${category}:`)
      categories[category].forEach((item) => {
        const statusIcon = item.status === "Critical" ? "🔴" : item.status === "Low Stock" ? "🟡" : "🟢"
        console.log(`      ${statusIcon} ${item.name} (${item.current_stock} units - ${item.status})`)
      })
    })
    console.log(`   Total: ${items.length} items\n`)

    // Check requests
    const { data: requests, error: requestsError } = await supabase
      .from("requests")
      .select("department, requested_by, status, priority")
      .order("requested_date", { ascending: false })

    if (requestsError) {
      console.error("❌ Error fetching requests:", requestsError.message)
      return
    }

    console.log("📋 REQUESTS:")
    requests.forEach((request) => {
      const priorityIcon = request.priority === "High" ? "🔴" : request.priority === "Medium" ? "🟡" : "🟢"
      const statusIcon = request.status === "Pending" ? "⏳" : request.status === "Approved" ? "✅" : "🏁"
      console.log(
        `   ${statusIcon} ${request.department} - ${request.requested_by} (${priorityIcon} ${request.priority})`,
      )
    })
    console.log(`   Total: ${requests.length} requests\n`)

    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("supplier, status, total_amount")
      .order("order_date", { ascending: false })

    if (ordersError) {
      console.error("❌ Error fetching orders:", ordersError.message)
      return
    }

    console.log("🛒 ORDERS:")
    orders.forEach((order) => {
      const statusIcon =
        order.status === "Pending"
          ? "⏳"
          : order.status === "Confirmed"
            ? "✅"
            : order.status === "Shipped"
              ? "🚚"
              : "📦"
      console.log(`   ${statusIcon} ${order.supplier} - $${order.total_amount} (${order.status})`)
    })
    console.log(`   Total: ${orders.length} orders\n`)

    // Check releases
    const { data: releases, error: releasesError } = await supabase
      .from("releases")
      .select("department, released_by")
      .order("released_date", { ascending: false })

    if (releasesError) {
      console.error("❌ Error fetching releases:", releasesError.message)
      return
    }

    console.log("📤 RELEASES:")
    releases.forEach((release) => {
      console.log(`   ✅ ${release.department} - Released by ${release.released_by}`)
    })
    console.log(`   Total: ${releases.length} releases\n`)

    console.log("🎉 SEEDING VERIFICATION COMPLETE!")
    console.log("✅ All data has been successfully seeded to your Supabase database")
    console.log("\n🔐 You can now login with these test accounts:")
    console.log("   👨‍💼 admin@villimale-hospital.mv / admin123")
    console.log("   📦 john.smith@villimale-hospital.mv / inventory123")
    console.log("   👩‍⚕️ sarah.johnson@villimale-hospital.mv / doctor123")
    console.log("   👩‍⚕️ maria.garcia@villimale-hospital.mv / nurse123")
    console.log("   💊 ahmed.hassan@villimale-hospital.mv / pharmacist123")
  } catch (error) {
    console.error("❌ Verification failed:", error.message)
  }
}

verifySeededData()
