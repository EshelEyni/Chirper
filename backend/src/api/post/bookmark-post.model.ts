import mongoose, { Document } from "mongoose";

const bookmarkedPostSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    bookmarkOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

bookmarkedPostSchema.index({ postId: 1, bookmarkOwnerId: 1 }, { unique: true });
bookmarkedPostSchema.index({ bookmarkOwnerId: 1 });

bookmarkedPostSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

bookmarkedPostSchema.post(/^find/, async function (docs: Document[]) {
  if (!docs?.length || docs.length === 0) return;
  for (const doc of docs) {
    await doc.populate("post");
  }
});

const BookmarkedPostModel = mongoose.model(
  "BookmarkedPost",
  bookmarkedPostSchema,
  "bookmarked_posts"
);

export { BookmarkedPostModel };
