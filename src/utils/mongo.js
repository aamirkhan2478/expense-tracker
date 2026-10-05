import mongoose from "mongoose";

/**
 * Cast a value into a real BSON ObjectId.
 *
 * Mongoose casts ObjectId strings for you in find()/countDocuments(), but
 * aggregate() hands the value straight to the driver with no casting. A string
 * id there silently matches zero documents, which makes totals, sums and counts
 * come back as 0 while the list of documents still looks correct.
 * Always convert ids before using them inside an aggregation $match.
 */
export function toObjectId(value) {
  if (value instanceof mongoose.Types.ObjectId) return value;
  return new mongoose.Types.ObjectId(String(value));
}