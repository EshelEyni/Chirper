import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },

    voteSum: {
      type: Number,
      default: 0,
    },
    isLoggedinUserVoted: {
      type: Boolean,
    },
  },
  {
    _id: false,
  }
);

const pollLengthSchema = new mongoose.Schema(
  {
    days: {
      type: Number,
      default: 1,
      required: true,
    },
    hours: {
      type: Number,
      default: 0,
      required: true,
    },
    minutes: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    _id: false,
    required: true,
  }
);
const pollSchema = new mongoose.Schema(
  {
    options: [pollOptionSchema],
    length: {
      type: pollLengthSchema,
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
);

const PollResultModel = mongoose.model("PollResult", pollResultSchema, "poll_results");

export { pollSchema, PollResultModel };
