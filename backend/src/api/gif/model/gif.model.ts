import mongoose from "mongoose";

const gifSchema = new mongoose.Schema(
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
        message: (props: any) => `${props.value} is not a valid category`,
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
    timestamps: true,
  }
);

gifSchema.index({ category: 1 });

gifSchema.pre("save", async function (next) {
  const gif = this as any;
  if (gif.isNew) gif.sortOrder = await GifModel.countDocuments({ category: gif.category });

  next();
});

const gifCategorySchema = new mongoose.Schema(
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
  const gifCategory = this as any;
  if (gifCategory.isNew) gifCategory.sortOrder = await GifCategoryModel.countDocuments();

  next();
});

const GifModel = mongoose.model("Gif", gifSchema);
const GifCategoryModel = mongoose.model("GifCategory", gifCategorySchema, "gif_categories");

export { gifSchema, GifModel, gifCategorySchema, GifCategoryModel };
