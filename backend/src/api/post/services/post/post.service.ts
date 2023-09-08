import { Repost } from "../../../../../../shared/interfaces/post.interface";
import { APIFeatures, QueryObj, shuffleArray } from "../../../../services/util/util.service";
import { IPostDoc, PostModel } from "../../models/post/post.model";
import { RepostModel } from "../../models/repost/repost.model";
import {
  IPromotionalPostDoc,
  PromotionalPostModel,
} from "../../models/post/promotional-post.model";

type CombinedPostType = IPostDoc | Repost | IPromotionalPostDoc;

async function query(queryString: QueryObj): Promise<CombinedPostType[]> {
  const features = new APIFeatures(PostModel.find({}), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const postDocs = (await features.getQuery().exec()) as unknown as IPostDoc[];
  const reposts = (await RepostModel.find({})).map(doc => doc.toObject().repost);
  const promotionalPosts = shuffleArray(await PromotionalPostModel.find({}));

  const posts = [...postDocs, ...reposts].reduce((acc, curr, i) => {
    acc.push(curr);
    if (i !== 0 && i % 9 === 0 && promotionalPosts.length > 0) {
      const promoPost = promotionalPosts.shift();
      if (promoPost) acc.push(promoPost);
    }
    return acc;
  }, [] as CombinedPostType[]);

  return posts;
}

export default { query };
