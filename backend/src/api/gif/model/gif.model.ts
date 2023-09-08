import mongoose, { Document } from "mongoose";

interface IGif extends Document {
  url: string;
  staticUrl: string;
  description: string;
  sortOrder: number;
  category: string;
  size: {
    width: number;
    height: number;
  };
  placeholderUrl: string;
  staticPlaceholderUrl: string;
}

interface IGifCategory extends Document {
  name: string;
  sortOrder: number;
  imgUrl: string;
}

const gifSchema = new mongoose.Schema<IGif>(
  {
    url: {
      type: String,
      required: [true, "A gif must have a url"],
    },
    staticUrl: {
      type: String,
      required: [true, "A gif must have a static url"],
    },
    description: {
      type: String,
      required: [true, "A gif must have a description"],
    },
    sortOrder: {
      type: Number,
    },
    category: {
      type: String,
      required: [true, "A gif must have a category"],
      validate: {
        validator: (category: string) => {
          return mongoose.model("GifCategory").exists({ name: category });
        },
        message: props => `${props.value} is not a valid category`,
      },
    },
    size: {
      type: {
        width: Number,
        height: Number,
      },
      required: [true, "A gif must have a size"],
    },
    placeholderUrl: {
      type: String,
      required: [true, "A gif must have a placeholder url"],
    },
    staticPlaceholderUrl: {
      type: String,
      required: [true, "A gif must have a static placeholder url"],
    },
  },
  {
    toObject: {
      virtuals: true,
      transform: (_: IGif, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_: IGif, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

gifSchema.index({ category: 1 });

gifSchema.pre("save", async function (next) {
  if (this.isNew) this.sortOrder = await GifModel.countDocuments({ category: this.category });
  next();
});

const gifCategorySchema = new mongoose.Schema<IGifCategory>(
  {
    name: {
      type: String,
      required: [true, "A gif category must have a name"],
    },
    sortOrder: {
      type: Number,
    },
    imgUrl: {
      type: String,
      required: [true, "A gif category must have an image url"],
    },
  },
  {
    toObject: {
      virtuals: true,
      transform: (_: Document, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_: Document, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

gifCategorySchema.index({ name: 1 }, { unique: true });

gifCategorySchema.pre("save", async function (next) {
  if (this.isNew) this.sortOrder = await GifCategoryModel.countDocuments();
  next();
});

const GifModel = mongoose.model<IGif>("Gif", gifSchema);
const GifCategoryModel = mongoose.model<IGifCategory>(
  "GifCategory",
  gifCategorySchema,
  "gif_categories"
);

export { gifSchema, GifModel, gifCategorySchema, GifCategoryModel };
