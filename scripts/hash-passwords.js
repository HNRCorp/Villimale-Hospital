const bcrypt = require("bcryptjs")

async function hashPasswords() {
  const passwords = {
    admin123: await bcrypt.hash("admin123", 10),
    inventory123: await bcrypt.hash("inventory123", 10),
    doctor123: await bcrypt.hash("doctor123", 10),
  }

  console.log("Hashed passwords for seed data:")
  console.log("Admin password hash:", passwords["admin123"])
  console.log("Inventory password hash:", passwords["inventory123"])
  console.log("Doctor password hash:", passwords["doctor123"])

  // Generate SQL update statements
  console.log("\nSQL Update statements:")
  console.log(
    `UPDATE users SET password_hash = '${passwords["admin123"]}' WHERE email = 'admin@villimale-hospital.mv';`,
  )
  console.log(
    `UPDATE users SET password_hash = '${passwords["inventory123"]}' WHERE email = 'john.smith@villimale-hospital.mv';`,
  )
  console.log(
    `UPDATE users SET password_hash = '${passwords["doctor123"]}' WHERE email = 'sarah.johnson@villimale-hospital.mv';`,
  )
}

hashPasswords().catch(console.error)
