import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false, // Don't include password in queries by default
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
    select: false,
  },
  passwordResetToken: {
    type: String,
    default: null,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
    select: false,
  },
  // Account lockout fields
  loginAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  lockUntil: {
    type: Date,
    default: null,
    select: false,
  },
  // Refresh token for session management
  refreshToken: {
    type: String,
    default: null,
    select: false,
  },
  refreshTokenExpires: {
    type: Date,
    default: null,
    select: false,
  },
  // Last login tracking
  lastLoginAt: {
    type: Date,
    default: null,
  },
  // Notification preferences
  notificationPreferences: {
    type: {
      loginNotification: { type: Boolean, default: true },
      largeExpenseAlert: { type: Boolean, default: true },
      upcomingReminder: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: true },
      recurringBatchSummary: { type: Boolean, default: true },
      overspendingAlert: { type: Boolean, default: true },
      savingsMilestone: { type: Boolean, default: true },
      bulkImportSummary: { type: Boolean, default: true },
      budgetWarning: { type: Boolean, default: true },
      budgetExceeded: { type: Boolean, default: true },
      failedLogin: { type: Boolean, default: true },

      reminderDaysBefore: { type: Number, default: 3 }, // 1, 3, or 7
      spendingAlertThreshold: { type: Number, default: 1000 },
      largeExpenseThreshold: { type: Number, default: 500 },
      weeklySummaryDay: { type: Number, default: 1 }, // 1 = Monday, 7 = Sunday
      timezone: { type: String, default: "UTC" },
    },
    default: () => ({
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
    })
  }
}, {
  timestamps: true,
});

// Virtual for checking if account is locked
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Encrypt Password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Normalize email
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }
  // Trim name
  if (this.isModified("name")) {
    this.name = this.name.trim();
  }
  next();
});

// Compare Password
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token (short-lived)
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, type: "access", role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "24h",
      issuer: "spendwise",
      audience: "spendwise-client",
    }
  );
};

// Generate Refresh Token (long-lived)
UserSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id, type: "refresh" },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "spendwise",
      audience: "spendwise-client",
    }
  );
  this.refreshToken = refreshToken;
  this.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return refreshToken;
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 min
  }

  return this.updateOne(updates);
};

// Reset login attempts on successful login
UserSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Invalidate refresh token
UserSchema.methods.invalidateRefreshToken = async function () {
  this.refreshToken = null;
  this.refreshTokenExpires = null;
  await this.save({ validateBeforeSave: false });
};

const User = models.User || model("User", UserSchema);

export default User;
