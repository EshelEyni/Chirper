import mongoose, { model } from "mongoose";
import { UserModel } from "./user.model";
import { AppError } from "../../../services/error/error.service";

const followerSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      validate: {
        validator: function (this: IFollower, v: string): boolean {
          return this.fromUserId.toString() !== v.toString();
        },
        message: "You can't follow yourself",
      },
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

followerSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
followerSchema.index({ toUserId: 1 });
followerSchema.index({ fromUserId: 1 });

followerSchema.virtual("fromUser", {
  ref: "User",
  localField: "fromUserId",
  foreignField: "_id",
  justOne: true,
});

followerSchema.virtual("toUser", {
  ref: "User",
  localField: "toUserId",
  foreignField: "_id",
  justOne: true,
});

followerSchema.pre("save", async function (next) {
  const fromUserExists = await UserModel.exists({ _id: this.fromUserId })
    .setOptions({ skipHooks: true })
    .exec();
  if (!fromUserExists) throw new AppError("Follower not found", 404);

  const toUserExists = await UserModel.exists({ _id: this.toUserId })
    .setOptions({ skipHooks: true })
    .exec();

  if (!toUserExists) throw new AppError("Following not found", 404);

  next();
});

followerSchema.post("find", async function (docs: any[]) {
  // if (!docs?.length || docs.length === 0) return;
  for (const doc of docs) {
    await doc.populate("fromUser");
    await doc.populate("toUser");
  }
});

interface IFollowerBase {
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollower extends IFollowerBase, mongoose.Document {}

const FollowerModel = model<IFollower>("Follower", followerSchema, "followers");

export { FollowerModel };

// Path: src\api\user\models\follower.model.ts
