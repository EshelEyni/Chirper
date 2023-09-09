import mongoose, { Schema } from "mongoose";
import { AppError } from "../../services/error/errorService";
import { IPoll, IPollLength, IPollOption } from "../../types/ITypes";

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
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

pollOptionSchema
  .virtual("voteCount")
  .get(function (this: IPollOption) {
    return this._voteCount;
  })
  .set(function (this: IPollOption, voteCount: number) {
    this._voteCount = voteCount;
  });

pollOptionSchema
  .virtual("isLoggedInUserVoted")
  .get(function (this: IPollOption) {
    return this._isLoggedInUserVoted;
  })
  .set(function (this: IPollOption, isLoggedInUserVoted: boolean) {
    this._isLoggedInUserVoted = isLoggedInUserVoted;
  });

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

const pollSchema: Schema<IPoll> = new mongoose.Schema(
  {
    options: [pollOptionSchema],
    length: {
      type: pollLengthSchema,
    },
  },
  {
    timestamps: true,
    _id: false,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

pollSchema
  .virtual("isVotingOff")
  .get(function (this: IPoll) {
    return this._isVotingOff;
  })
  .set(function (this: IPoll, isVotingOff: boolean) {
    this._isVotingOff = isVotingOff;
  });

pollSchema.pre("save", function (next) {
  const { options } = this as IPoll;

  if (options.length < 2) {
    next(new AppError("Poll must have at least 2 options", 400));
  }

  if (options.length > 5) {
    next(new AppError("Poll cannot have more than 5 options", 400));
  }
  next();
});

export { pollSchema, imgsSchema, locationSchema };
