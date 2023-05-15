import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isLoggedinUserVoted: {
          type: Boolean,
          default: false,
        },
        voteSum: {
          type: Number,
          default: 0,
        },
      },
    ],
    length: {
      days: Number,
      hours: Number,
      minutes: Number,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

const pollResultSchema = new mongoose.Schema(
  {
    postId: String,
    optionIdx: Number,
    userId: String,
  },
  {
    timestamps: true,
  }
);

const PollResultModel = mongoose.model("PollResult", pollResultSchema, "poll_results");

export { pollSchema, PollResultModel };
