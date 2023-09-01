import mongoose, { Schema } from "mongoose";
import { AppError } from "../../../../services/error/error.service";

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

const imgsSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    sortOrder: {
      type: Number,
      required: true,
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
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
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

export { pollSchema, imgsSchema, locationSchema };
