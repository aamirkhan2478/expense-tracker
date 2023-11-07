import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exist"],
    require: [true, "Email is required"],
  },
    image: {
    type: String,
    default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
  },
  password:{
  type: String,
  require: [true, "Password is required"],
  }
  
  
});

const User = models.User || model("User", UserSchema);

export default User;
