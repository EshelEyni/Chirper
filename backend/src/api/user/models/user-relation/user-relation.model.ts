import mongoose, { model } from "mongoose";
import { UserModel } from "../user/user.model";

const userRelationSchema = new mongoose.Schema(
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
        message: "User not found",
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
          message: "You can't target yourself",
        },
        {
          validator: async function (this: IFollower): Promise<boolean> {
            const toUserExists = await UserModel.exists({ _id: this.toUserId })
              .setOptions({ skipHooks: true })
              .exec();

            return !!toUserExists;
          },
          message: "Target User not found",
        },
      ],
    },
  },
  {
    timestamps: true,
    discriminatorKey: "kind", // our discriminator key, could be anything
  }
);

userRelationSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
userRelationSchema.index({ toUserId: 1 });
userRelationSchema.index({ fromUserId: 1 });

interface IUserRelationBase {
  fromUserId: string;
  toUserId: string;
  kind: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollower extends IUserRelationBase, mongoose.Document {}

const UserRelationModel = model<IFollower>("UserRelation", userRelationSchema, "user_relations");

const FollowerModel = UserRelationModel.discriminator<IFollower>("Follow", new mongoose.Schema({}));

const MuteModel = UserRelationModel.discriminator<IFollower>("Mute", new mongoose.Schema({}));

const BlockModel = UserRelationModel.discriminator<IFollower>("Block", new mongoose.Schema({}));

export { UserRelationModel, FollowerModel, BlockModel, MuteModel };

// Path: src\api\user\models\follower.model.ts
