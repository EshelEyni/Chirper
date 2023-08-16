import mongoose, { model } from "mongoose";
import { UserModel } from "./user.model";

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

followerSchema.post(/^find/, async function (docs: any[]) {
  if (!docs?.length || docs.length === 0) return;
  for (const doc of docs) {
    await doc.populate("fromUser");
    await doc.populate("toUser");
  }
});

followerSchema.post("save", async function (doc, next) {
  await UserModel.findByIdAndUpdate(doc.fromUserId, { $inc: { followingCount: 1 } });
  await UserModel.findByIdAndUpdate(doc.toUserId, { $inc: { followersCount: 1 } });
  next();
});

followerSchema.post("findOneAndDelete", async function (doc, next) {
  await UserModel.findByIdAndUpdate(doc.fromUserId, { $inc: { followingCount: -1 } });
  await UserModel.findByIdAndUpdate(doc.toUserId, { $inc: { followersCount: -1 } });

  next();
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
