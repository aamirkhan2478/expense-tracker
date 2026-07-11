import { Schema, model, models } from "mongoose";

const TokenBlacklistSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["access", "refresh", "verification", "password_reset"],
      default: "access",
    },
    reason: {
      type: String,
      default: "logout",
    },
  },
  { timestamps: true }
);

// Auto-expire documents after expiresAt
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist =
  models.TokenBlacklist || model("TokenBlacklist", TokenBlacklistSchema);

export default TokenBlacklist;
