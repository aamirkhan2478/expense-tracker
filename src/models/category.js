import { Schema, model, models } from "mongoose";
import User from "./user";

const UserModel = models.User || model("User", User.schema);

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      require: [true, "Name is required"],
    },
    icon: {
      type: String,
      require: [true, "Icon is required"],
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

const Category = models.Category || model("Category", CategorySchema);

export default Category;
