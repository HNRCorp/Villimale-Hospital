#!/usr/bin/env node

/**
 * Quick script to verify Supabase environment variables are configured
 * Run with: node scripts/check-env.js
 */

const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

console.log("🔍 Checking Supabase environment variables...\n")

let allGood = true
const results = []

requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 30)}...`)
    results.push({ name: varName, status: "OK", value: value.substring(0, 30) + "..." })
  } else {
    console.log(`❌ ${varName}: NOT SET`)
    results.push({ name: varName, status: "MISSING", value: null })
    allGood = false
  }
})

console.log("\n" + "=".repeat(60))

if (allGood) {
  console.log("🎉 All environment variables are configured!")
  console.log("✅ Supabase client should connect successfully")
  console.log("\nYour Supabase project:")
  console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] || "unknown"}`)
} else {
  console.log("⚠️  Missing environment variables detected!")
  console.log("📋 Please check SUPABASE_SETUP.md for configuration instructions.")
  console.log("\nMissing variables:")
  results
    .filter((r) => r.status === "MISSING")
    .forEach((r) => {
      console.log(`   - ${r.name}`)
    })
}

console.log("\n📋 Next steps:")
if (allGood) {
  console.log("1. ✅ Environment variables configured")
  console.log("2. 🔄 Run SQL scripts in Supabase SQL Editor:")
  console.log("   - Create tables script (see SUPABASE_SETUP.md)")
  console.log("   - Seed data script (see SUPABASE_SETUP.md)")
  console.log("3. 🚀 Start your development server: npm run dev")
  console.log("4. 🧪 Test login with: admin@villimale-hospital.mv / admin123")
} else {
  console.log("1. 📝 Copy .env.example to .env.local")
  console.log("2. 🔑 Add your Supabase keys to .env.local")
  console.log("3. 🔄 Run this script again: node scripts/check-env.js")
}

console.log("\n🔗 Useful links:")
console.log("   Supabase Dashboard: https://supabase.com/dashboard")
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL.split("//")[1]?.split(".")[0]
  console.log(`   Your Project: https://supabase.com/dashboard/project/${projectId}`)
  console.log(`   SQL Editor: https://supabase.com/dashboard/project/${projectId}/sql`)
  console.log(`   Table Editor: https://supabase.com/dashboard/project/${projectId}/editor`)
}
