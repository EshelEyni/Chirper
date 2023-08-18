import { Document, Query, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../../../../shared/interfaces/user.interface";
import { FollowerModel } from "./followers.model";

export interface IUser extends Document {
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
  isBot: boolean;
  isApprovedLocation: boolean;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  // eslint-disable-next-line no-unused-vars
  checkPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
  loginAttempts: number;
  lockedUntil: number;
  bio: string;
  followingCount: number;
  followersCount: number;
}

const userSchema: Schema<IUser> = new Schema(
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
        message: "Please provide a valid email",
      },
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isBot: { type: Boolean, default: false },
    isApprovedLocation: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    // TODO: delete followingCount and followersCount from userSchema and set them to be virtuals
    followingCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
  },
  {
    toObject: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.passwordConfirm;
        delete ret._id;
        delete ret.active;
        delete ret.loginAttempts;
        delete ret.lockedUntil;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.passwordConfirm;
        delete ret._id;
        delete ret.active;
        delete ret.loginAttempts;
        delete ret.lockedUntil;
        return ret;
      },
    },
    timestamps: true,
  }
);

userSchema.pre(/^find/, function (this: Query<User[], User & Document>, next) {
  const options = this.getOptions();
  if (options.active === false) return next();
  this.find({ active: { $ne: false } });
  next();
});

userSchema.post(/^find/, async function (this: Query<User[], User & Document>, doc) {
  const options = this.getOptions();
  if (!doc || options.skipHooks) return;
  doc.followingCount = await FollowerModel.countDocuments({ fromUserId: doc._id });
  doc.followersCount = await FollowerModel.countDocuments({ toUserId: doc._id });
});

userSchema.post(/\bfind\b/, async function (this: Query<User[], User & Document>, docs) {
  if (!docs || docs.length === undefined) return;
  for (const doc of docs) {
    doc.followingCount = await FollowerModel.countDocuments({ fromUserId: doc._id });
    doc.followersCount = await FollowerModel.countDocuments({ toUserId: doc._id });
  }
});

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
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return JWTTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const TEN_MINUTES = 10 * 60 * 1000;
  this.passwordResetExpires = Date.now() + TEN_MINUTES;
  return resetToken;
};

const UserModel = model<IUser>("User", userSchema);

export { userSchema, UserModel };
