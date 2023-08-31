import mongoose from "mongoose";
import { postSchema } from "./post/post.model";

const promotionalPostSchema = new mongoose.Schema({
  ...postSchema.obj,
  isPromotional: {
    type: Boolean,
    default: true,
  },
  companyName: {
    type: String,
    required: [true, "Please provide a company name"],
  },
  linkToSite: {
    type: String,
    required: [true, "Please provide a link to your site"],
  },
  linkToRepo: {
    type: String,
  },
});

const PromotionalPostModel = mongoose.model(
  "PromotionalPost",
  promotionalPostSchema,
  "promotional_posts"
);

export { PromotionalPostModel };
