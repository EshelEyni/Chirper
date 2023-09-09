import { IPostDoc, IPromotionalPostDoc } from "../../types/ITypes";
import { ParsedReqQuery } from "../../types/App";
import { Repost } from "../../../../shared/types/post.interface";
import { APIFeatures, shuffleArray } from "../util/utilService";
import { PostModel } from "../../models/post/postModel";
import { RepostModel } from "../../models/repost/repostModel";
import { PromotionalPostModel } from "../../models/promotionalPost/promotionalPostModel";

type CombinedPostType = IPostDoc | Repost | IPromotionalPostDoc;

async function query(queryString: ParsedReqQuery): Promise<CombinedPostType[]> {
  const features = new APIFeatures(PostModel.find({}), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const postDocs = (await features.getQuery().exec()) as unknown as IPostDoc[];
  const reposts = (await RepostModel.find({})).map(doc => doc.toObject().repost);
  const promotionalPosts = shuffleArray(await PromotionalPostModel.find({}));

  const posts = [...postDocs, ...reposts]
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .reduce((acc, curr, i) => {
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
