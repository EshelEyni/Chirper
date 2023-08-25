import mongoose, { model } from "mongoose";
import { UserModel } from "../user/user.model";

const followerSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      validate: {
        validator: async function (this: IFollower): Promise<boolean> {
          const fromUserExists = await UserModel.exists({ _id: this.fromUserId })
            .setOptions({ skipHooks: true })
            .exec();
          return !!fromUserExists;
        },
        message: "Follower not found",
      },
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      validate: [
        {
          validator: function (this: IFollower, v: string): boolean {
            return this.fromUserId.toString() !== v.toString();
          },
          message: "You can't follow yourself",
        },
        {
          validator: async function (this: IFollower): Promise<boolean> {
            const toUserExists = await UserModel.exists({ _id: this.toUserId })
              .setOptions({ skipHooks: true })
              .exec();

            return !!toUserExists;
          },
          message: "Following not found",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

followerSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
followerSchema.index({ toUserId: 1 });
followerSchema.index({ fromUserId: 1 });

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
