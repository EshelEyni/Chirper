import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface IUser extends Document {
  username: string;
  password: string;
  passwordConfirm: string;
  email: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  fullname: string;
  imgUrl: string;
  isAdmin: boolean;
  isVerified: boolean;
  isApprovedLocation: boolean;
  createdAt: number;
  // eslint-disable-next-line no-unused-vars
  checkPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
}

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
        validator: function (v: string): boolean {
          return v.length >= 8 && v.length <= 20;
        },
        message: "password must be between 8 and 20 characters",
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (this: IUser, v: string): boolean {
          return v === this.password;
        },
        message: "passwords must match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    fullname: { type: String, required: [true, "Please provide you full name"] },
    imgUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      validate: {
        validator: function (v: string): boolean {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: "email must be valid",
      },
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isApprovedLocation: { type: Boolean, default: false },
    createdAt: { type: Number, default: Date.now },
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = "";
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const UserModel = model<IUser>("User", userSchema);

export { userSchema, UserModel };
