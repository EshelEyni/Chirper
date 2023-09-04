import { NewPost } from "../../../../../../shared/interfaces/post.interface";
import { shuffleArray } from "../../../../services/util/util.service";
import { PromotionalPostModel } from "../../models/post/promotional-post.model";

async function get() {
  const posts = await PromotionalPostModel.find({}).exec();
  return shuffleArray(posts);
}

async function add(post: NewPost) {
  const postDoc = await PromotionalPostModel.create(post);
  return postDoc.toObject();
}

export default { get, add };
