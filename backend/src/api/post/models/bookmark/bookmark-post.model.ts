import { ObjectId } from "mongodb";
import mongoose, { Model } from "mongoose";
import { PostModel } from "../post.model";
import { AppError } from "../../../../services/error/error.service";

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

bookmarkedPostSchema.pre<IBookmarkedPostDoc>("save", async function (next) {
  const postExists = await PostModel.exists({ _id: this.postId })
    .setOptions({ skipHooks: true })
    .exec();
  if (!postExists) throw new AppError("Referenced post does not exist", 404);
  next();
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
