import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatar: String,
  githubConnected: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  passwordExists: { type: Boolean, default: false },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

const User = mongoose.model("User", userSchema);
export default User;