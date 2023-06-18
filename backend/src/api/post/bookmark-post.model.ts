import { ObjectId } from "mongodb";
import mongoose, { Document, Model } from "mongoose";

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

interface IBookmarkedPostBase {
  postId: ObjectId;
  bookmarkOwnerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IBookmarkedPostDoc extends IBookmarkedPostBase, mongoose.Document {}

const BookmarkedPostModel: Model<IBookmarkedPostDoc> = mongoose.model<IBookmarkedPostDoc>(
  "BookmarkedPost",
  bookmarkedPostSchema,
  "bookmarked_posts"
);

export { BookmarkedPostModel };
