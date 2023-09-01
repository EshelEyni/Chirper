import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { AppError } from "../../../../services/error/error.service";
import { queryEntityExists } from "../../../../services/util/util.service";
import { PostModel } from "../post/post.model";
import { UserModel } from "../../../user/models/user/user.model";
import { IPollLength } from "../post/post-sub-schemas";

type IPollVoteBase = {
  postId: mongoose.Types.ObjectId;
  optionIdx: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const pollVoteSchema: Schema<IPollVoteBase> = new mongoose.Schema(
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
        validator: async (id: ObjectId) => queryEntityExists(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
    },
  },
  {
    timestamps: true,
  }
);

pollVoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

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

  if (currTime > pollEndTime) next(new AppError("Poll has expired", 400));

  next();
});

const PollVoteModel = mongoose.model("PollResult", pollVoteSchema, "poll_results");

export { PollVoteModel };
