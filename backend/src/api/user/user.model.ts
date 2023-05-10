import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return v.length >= 3 && v.length <= 20;
        },
        message: "username must be between 3 and 20 characters",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length >= 8 && v.length <= 20;
        },
        message: "password must be between 8 and 20 characters",
      },
    },
    fullname: { type: String, required: true },
    imgUrl: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
    },
    isAdmin: { type: Boolean, required: true, default: false },
    isVerified: { type: Boolean, required: true, default: false },
    isApprovedLocation: { type: Boolean, required: true, default: false },
    createdAt: { type: Number, required: true, default: Date.now },
  },
  {
    toObject: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

module.exports = {
  userSchema,
  UserModel,
};
