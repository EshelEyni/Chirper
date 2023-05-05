import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  fullname: { type: String, required: true },
  imgUrl: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  isVerified: { type: Boolean, required: true, default: false },
  isApprovedLocation: { type: Boolean, required: true, default: false },
  createdAt: { type: Number, required: true, default: Date.now },
});

module.exports = model("User", userSchema);
