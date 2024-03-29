import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { AppError } from "../../services/error/errorService";
import { queryEntityExistsById } from "../../services/util/utilService";
import { PostModel } from "../post/postModel";
import { UserModel } from "../../models/user/userModel";
import { IPollLength, IPollVoteDoc } from "../../types/iTypes";

const pollVoteSchema: Schema<IPollVoteDoc> = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    optionIdx: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: async (id: ObjectId) => queryEntityExistsById(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

pollVoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

pollVoteSchema
  .virtual("isLoggedInUserVoted")
  .get(function () {
    return this._isLoggedInUserVoted;
  })
  .set(function (value: boolean) {
    this._isLoggedInUserVoted = value;
  });

pollVoteSchema.pre("save", async function (next) {
  const pollDoc = await PostModel.findById(this.postId)
    .select(["poll", "createdAt"])
    .setOptions({ skipHooks: true })
    .exec();
  if (!pollDoc) return next(new AppError("Referenced post does not exist", 400));
  if (!pollDoc.poll) return next(new AppError("Referenced post has no poll", 400));

  const { options } = pollDoc.poll;

  if (this.optionIdx < 0 || this.optionIdx >= options.length) {
    next(new AppError("Invalid option index", 400));
  }

  const formatPollLengthToMs = (pollLength: IPollLength) => {
    const { days, hours, minutes } = pollLength;
    const DAY_TS = 24 * 60 * 60 * 1000;
    const HOUR_TS = 60 * 60 * 1000;
    const MINUTE_TS = 60 * 1000;
    return days * DAY_TS + hours * HOUR_TS + minutes * MINUTE_TS;
  };

  const { createdAt } = pollDoc;
  const { length } = pollDoc.poll;
  const pollLength = formatPollLengthToMs(length);
  const pollEndTime = createdAt.getTime() + pollLength;
  const currTime = Date.now();

  if (currTime > pollEndTime) return next(new AppError("Poll has expired", 400));

  next();
});

pollVoteSchema.post("save", async function (doc: IPollVoteDoc) {
  doc._isLoggedInUserVoted = true;
});

const PollVoteModel = mongoose.model<IPollVoteDoc>("PollVote", pollVoteSchema, "poll_votes");

export { PollVoteModel };
