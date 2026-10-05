import { Schema, model, models } from "mongoose";
import User from "./user";

const UserModel = models.User || model("User", User.schema);

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
    },
    budget: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: UserModel.modelName,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ user: 1 });

const Category = models.Category || model("Category", CategorySchema);

export default Category;
