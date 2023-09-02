import mongoose, { Schema } from "mongoose";
import { AppError } from "../../../../services/error/error.service";
import { ObjectId } from "mongodb";
import { queryEntityExists } from "../../../../services/util/util.service";
import { UserModel } from "../../../user/models/user/user.model";

type IPollOption = {
  text: string;
  voteCount: number;
};

export type IPollLength = {
  days: number;
  hours: number;
  minutes: number;
};

type IPollBase = {
  options: IPollOption[];
  length: IPollLength;
  createdAt: Date;
  updatedAt: Date;
};

type RepliedPostDetails = {
  postId: mongoose.Types.ObjectId;
  postOwner: {
    userId: mongoose.Types.ObjectId;
    username: string;
  };
};

const imgsSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image url is required"],
    },
    sortOrder: {
      type: Number,
      required: [true, "Image sort order is required"],
    },
  },
  {
    _id: false,
    default: null,
  }
);

const locationSchema = new mongoose.Schema(
  {
    placeId: {
      type: String,
      required: [true, "Place id is required"],
    },
    name: {
      type: String,
      required: [true, "Place name is required"],
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required"],
    },
  },
  {
    _id: false,
    default: null,
  }
);

const pollOptionSchema: Schema<IPollOption> = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      message: "Option text is required",
    },
  },
  {
    _id: false,
  }
);

const pollLengthSchema: Schema<IPollLength> = new mongoose.Schema(
  {
    days: {
      type: Number,
      default: 1,
    },
    hours: {
      type: Number,
      default: 0,
    },
    minutes: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
    required: true,
  }
);

pollLengthSchema.pre("validate", function (next) {
  const { days, hours, minutes } = this as IPollLength;

  if (days < 0 || hours < 0 || minutes < 0) {
    next(new AppError("Poll length cannot be negative", 400));
  }

  if (days === 0 && hours === 0 && minutes === 0) {
    next(new AppError("Poll length cannot be 0", 400));
  }

  next();
});

pollLengthSchema.pre("save", function (next) {
  const { days, hours, minutes } = this as IPollLength;

  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

  if (totalMinutes > 7 * 24 * 60) {
    next(new AppError("Poll length cannot be greater than 7 days", 400));
  }

  next();
});

const pollSchema: Schema<IPollBase> = new mongoose.Schema(
  {
    options: [pollOptionSchema],
    length: {
      type: pollLengthSchema,
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

pollSchema.pre("save", function (next) {
  const { options } = this as IPollBase;

  if (options.length < 2) {
    next(new AppError("Poll must have at least 2 options", 400));
  }

  if (options.length > 5) {
    next(new AppError("Poll cannot have more than 5 options", 400));
  }
  next();
});

const repliedPostDetailsSchema: Schema<RepliedPostDetails> = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    validate: {
      validator: async (id: ObjectId) => !!(await mongoose.models.Post.findById({ _id: id })),
      message: "Referenced replied post does not exist",
    },
  },
  postOwner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Replied post owner must have a userId"],
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
    },
  },
});
export { pollSchema, imgsSchema, locationSchema, repliedPostDetailsSchema };
