import { Document, Query, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { UserRelationKind, UserRelationModel } from "../user-relation/user-relation.model";
import userRelationService from "../../services/user-relation/user-relation.service";
import { getLoggedInUserIdFromReq } from "../../../../services/als.service";

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
  _followingCount: number;
  _followersCount: number;
  _isFollowing: boolean;
  _isMuted: boolean;
  _isBlocked: boolean;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
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
      required: [true, "Please provide a password"],
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
    fullname: { type: String, required: [true, "Please provide your full name"] },
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
    imgUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
    },
    bio: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isBot: { type: Boolean, default: false },
    isApprovedLocation: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Number, default: 0 },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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

userSchema
  .virtual("followingCount")
  .get(function () {
    return this._followingCount ?? 0;
  })
  .set(function (value) {
    this._followingCount = value;
  });

userSchema
  .virtual("followersCount")
  .get(function () {
    return this._followersCount ?? 0;
  })
  .set(function (value) {
    this._followersCount = value;
  });

userSchema
  .virtual("isFollowing")
  .get(function () {
    return this._isFollowing ?? false;
  })
  .set(function (value) {
    this._isFollowing = value;
  });

userSchema
  .virtual("isMuted")
  .get(function () {
    return this._isMuted;
  })
  .set(function (value) {
    this._isMuted = value;
  });

userSchema
  .virtual("isBlocked")
  .get(function () {
    return this._isBlocked;
  })
  .set(function (value) {
    this._isBlocked = value;
  });

userSchema.pre(/^find/, function (this: Query<User[], User & Document>, next) {
  const options = this.getOptions();
  if (options.active === false) return next();
  this.find({ active: { $ne: false } });
  next();
});

userSchema.post(/^find/, async function (this: Query<IUser[], IUser & Document>, res) {
  const options = this.getOptions();
  if (!res || options.skipHooks) return;
  const isResArray = Array.isArray(res);

  if (isResArray) {
    const docs = res;
    if (!docs.length) return;

    // Extract all user IDs
    const userIds = docs.map((doc: IUser) => doc._id.toString());

    // Get the following and followers counts for all user IDs
    const followingCounts = await UserRelationModel.aggregate([
      { $match: { fromUserId: { $in: docs.map((doc: IUser) => doc._id) } } },
      { $group: { _id: "$fromUserId", count: { $sum: 1 } } },
    ]);
    const followersCounts = await UserRelationModel.aggregate([
      { $match: { toUserId: { $in: docs.map((doc: IUser) => doc._id) } } },
      { $group: { _id: "$toUserId", count: { $sum: 1 } } },
    ]);

    // Convert the aggregation results into maps for easier lookup
    const followingCountMap = Object.fromEntries(followingCounts.map(x => [x._id, x.count]));
    const followersCountMap = Object.fromEntries(followersCounts.map(x => [x._id, x.count]));

    // Get the user relation map for all user IDs
    const userRelationMap = await userRelationService.getUserRelation(
      [UserRelationKind.Follow, UserRelationKind.Mute, UserRelationKind.Block],
      getLoggedInUserIdFromReq(),
      ...userIds
    );

    // Iterate through the documents and set the counts and following status
    for (const doc of docs) {
      const userId = doc._id.toString();
      doc._followingCount = followingCountMap[userId] ?? 0;
      doc._followersCount = followersCountMap[userId] ?? 0;
      doc._isFollowing = userRelationMap[userId].isFollowing;
      doc._isMuted = userRelationMap[userId].isMuted;
      doc._isBlocked = userRelationMap[userId].isBlocked;
    }
  } else {
    const doc = res;

    const userId = res._id.toString();
    const followingCount = await UserRelationModel.countDocuments({
      fromUserId: doc._id,
    }).setOptions({
      skipHooks: true,
    });
    const followersCount = await UserRelationModel.countDocuments({ toUserId: doc._id }).setOptions(
      {
        skipHooks: true,
      }
    );

    doc._followingCount = followingCount ?? 0;
    doc._followersCount = followersCount ?? 0;

    const userRelationMap = await userRelationService.getUserRelation(
      [UserRelationKind.Follow, UserRelationKind.Mute, UserRelationKind.Block],
      getLoggedInUserIdFromReq(),
      userId
    );

    doc._isFollowing = userRelationMap[userId].isFollowing;
    doc._isMuted = userRelationMap[userId].isMuted;
    doc._isBlocked = userRelationMap[userId].isBlocked;
  }
});

userSchema.pre("save", async function (next) {
  // Password is only modified when creating a new user or updating the password after a reset
  const isPasswordModified = this.isModified("password");
  if (!isPasswordModified) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = "";
  next();
});

userSchema.post("save", async function (doc) {
  doc._followersCount = 0;
  doc._followingCount = 0;
  doc._isFollowing = false;
  doc._isMuted = false;
  doc._isBlocked = false;
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
