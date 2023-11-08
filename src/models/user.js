import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
  name: {
    type: String,
    require: [true, "Email is required"],
  },
  email: {
    type: String,
    unique: [true, "Email already exist"],
    require: [true, "Email is required"],
  },
  password: {
    type: String,
    require: [true, "Password is required"],
  },
});

//Encryt Password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = models.User || model("User", UserSchema);

export default User;
