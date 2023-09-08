import mongoose, { model } from "mongoose";
import { IUserRelationDoc } from "../../Types/ITypes";
import { UserRelationKind } from "../../Types/Enums";
import { UserModel } from "../User/UserModel";

const userRelationSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      validate: {
        validator: async function (this: IUserRelationDoc): Promise<boolean> {
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
          validator: function (this: IUserRelationDoc, v: string): boolean {
            return this.fromUserId.toString() !== v.toString();
          },
          message: "You can't target yourself",
        },
        {
          validator: async function (this: IUserRelationDoc): Promise<boolean> {
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

userRelationSchema.pre("save", async function (this: IUserRelationDoc) {
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

const UserRelationModel = model<IUserRelationDoc>(
  "UserRelation",
  userRelationSchema,
  "user_relations"
);

const FollowerModel = UserRelationModel.discriminator<IUserRelationDoc>(
  UserRelationKind.Follow,
  new mongoose.Schema({})
);

const MuteModel = UserRelationModel.discriminator<IUserRelationDoc>(
  UserRelationKind.Mute,
  new mongoose.Schema({})
);

const BlockModel = UserRelationModel.discriminator<IUserRelationDoc>(
  UserRelationKind.Block,
  new mongoose.Schema({})
);

export { UserRelationModel, FollowerModel, BlockModel, MuteModel };

// Path: src\api\user\models\follower.model.ts
