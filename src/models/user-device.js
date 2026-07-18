import { Schema, model, models } from "mongoose";

const UserDeviceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    device: { type: String, default: "Unknown" },
    ipAddress: { type: String, default: null },
    location: { type: String, default: null },
    userAgent: { type: String, default: null },
    loginMethod: { type: String, default: "password" },
    lastUsedAt: { type: Date, default: Date.now },
    trusted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index to detect new device fingerprints
UserDeviceSchema.index({ userId: 1, browser: 1, os: 1 });

const UserDevice = models.UserDevice || model("UserDevice", UserDeviceSchema);

export default UserDevice;
