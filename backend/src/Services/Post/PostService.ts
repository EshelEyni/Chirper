import { IPostDoc, IPromotionalPostDoc } from "../../Types/ITypes";
import { ParsedReqQuery } from "../../Types/App";
import { Repost } from "../../../../shared/types/post.interface";
import { APIFeatures, shuffleArray } from "../Util/UtilService";
import { PostModel } from "../../Models/Post/PostModel";
import { RepostModel } from "../../Models/Repost/RepostModel";
import { PromotionalPostModel } from "../../Models/PromotionalPost/PromotionalPostModel";

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
