import mongoose, { model } from "mongoose";
import { UserModel } from "../user/user.model";

export enum UserRelationKind {
  Follow = "Follow",
  Block = "Block",
  Mute = "Mute",
}

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

userRelationSchema.index({ fromUserId: 1, toUserId: 1, discriminatorKey: 1 }, { unique: true });
userRelationSchema.index({ toUserId: 1 });
userRelationSchema.index({ fromUserId: 1 });

userRelationSchema.pre("save", async function (this: IFollower) {
  if (this.kind === UserRelationKind.Follow) {
    await UserRelationModel.findOneAndDelete({
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      kind: UserRelationKind.Block,
    }).exec();
  }

  if (this.kind === UserRelationKind.Block) {
    await UserRelationModel.findOneAndDelete({
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      kind: UserRelationKind.Follow,
    }).exec();
  }
});

interface IUserRelationBase {
  fromUserId: string;
  toUserId: string;
  kind: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollower extends IUserRelationBase, mongoose.Document {}

const UserRelationModel = model<IFollower>("UserRelation", userRelationSchema, "user_relations");

const FollowerModel = UserRelationModel.discriminator<IFollower>(
  UserRelationKind.Follow,
  new mongoose.Schema({})
);

const MuteModel = UserRelationModel.discriminator<IFollower>(
  UserRelationKind.Mute,
  new mongoose.Schema({})
);

const BlockModel = UserRelationModel.discriminator<IFollower>(
  UserRelationKind.Block,
  new mongoose.Schema({})
);

export { UserRelationModel, FollowerModel, BlockModel, MuteModel };

// Path: src\api\user\models\follower.model.ts
