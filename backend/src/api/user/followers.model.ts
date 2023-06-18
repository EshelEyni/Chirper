import mongoose from "mongoose";

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
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
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

interface IFollowerBase {
  fromUserId: string;
  toUserId: string;
  isAccepted: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollower extends IFollowerBase, mongoose.Document {}

const FollowerModel = mongoose.model<IFollower>("Follower", followerSchema, "followers");

export { FollowerModel };
