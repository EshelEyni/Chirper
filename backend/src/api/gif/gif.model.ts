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
    sortOrder: Number,
    category: String,
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

const gifCategorySchema = new mongoose.Schema(
  {
    name: String,
    sortOrder: Number,
    imgUrl: String,
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

const GifModel = mongoose.model("Gif", gifSchema);
const GifCategoryModel = mongoose.model("GifCategory", gifCategorySchema, "gif_categories");

export { gifSchema, GifModel, gifCategorySchema, GifCategoryModel };
