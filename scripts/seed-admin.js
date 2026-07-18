/**
 * Admin user seed script.
 *
 * Creates or updates an admin user in the database.
 *
 * Usage:
 *   node scripts/seed-admin.js
 *
 * Environment variables (optional, uses defaults if not set):
 *   ADMIN_EMAIL    — admin email (default: admin@spendwise.app)
 *   ADMIN_PASSWORD — admin password (default: admin123!)
 *   ADMIN_NAME     — admin display name (default: Admin)
 *   MONGODB_URI    — MongoDB connection string (falls back to .env.local)
 *
 * Run this after initial setup to create the first admin account.
 */

const fs = require("fs");
const path = require("path");

// Load .env.local manually (dotenv not in dependencies)
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@spendwise.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Set it in .env.local or as an environment variable.");
  process.exit(1);
}

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log(`🔗 Connected to MongoDB`);

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  const existing = await usersCollection.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`ℹ️  Admin user already exists: ${ADMIN_EMAIL}`);
    } else {
      await usersCollection.updateOne(
        { _id: existing._id },
        { $set: { role: "admin" } }
      );
      console.log(`✅ Upgraded ${ADMIN_EMAIL} to admin role`);
    }
  } else {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await usersCollection.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
      loginAttempts: 0,
      lastLoginAt: null,
      notificationPreferences: {
        loginNotification: true,
        largeExpenseAlert: true,
        upcomingReminder: true,
        weeklySummary: true,
        recurringBatchSummary: true,
        overspendingAlert: true,
        savingsMilestone: true,
        bulkImportSummary: true,
        budgetWarning: true,
        budgetExceeded: true,
        failedLogin: true,
        reminderDaysBefore: 3,
        spendingAlertThreshold: 1000,
        largeExpenseThreshold: 500,
        weeklySummaryDay: 1,
        timezone: "UTC",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Admin user created:`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Name:     ${ADMIN_NAME}`);
    console.log(`   Role:     admin`);
  }

  await mongoose.disconnect();
  console.log(`\n🎉 Done. You can now log in with the admin credentials.`);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
