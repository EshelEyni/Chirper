import PostStatsService, { defaultPostStats } from "./postStatsService";
import { PostLikeModel } from "../../models/postLike/postLikeModel";
import { PostStatsModel } from "../../models/postStats/postStatsModel";
import { PostModel } from "../../models/post/postModel";
import { RepostModel } from "../../models/repost/repostModel";
import { getMongoId } from "../test/testUtilService";
import { assertPostStats } from "../test/testAssertionService";

jest.mock("../../models/postLike/postLikeModel", () => ({
  PostLikeModel: {
    countDocuments: jest.fn(),
  },
}));
jest.mock("../../models/postStats/postStatsModel", () => ({
  PostStatsModel: {
    aggregate: jest.fn(),
  },
}));
jest.mock("../../models/post/postModel", () => ({
  PostModel: {
    countDocuments: jest.fn(),
  },
}));
jest.mock("../../models/repost/repostModel", () => ({
  RepostModel: {
    countDocuments: jest.fn(),
  },
}));
jest.mock("../../models/promotionalPost/promotionalPostModel", () => ({
  PromotionalPostModel: jest.fn(),
}));

describe("PostStatsService", () => {
  describe("get", () => {
    it("should return the correct PostStats", async () => {
      const mockPostId = getMongoId();
      const mockLikesCount = 10;
      const mockRepostCount = 5;
      const mockRepliesCount = 2;
      const mockPostStatsAggregation = [
        {
          ...defaultPostStats,
          viewsCount: 3,
          detailsViewsCount: 4,
        },
      ];

      (PostLikeModel.countDocuments as jest.Mock).mockResolvedValue(mockLikesCount);
      (RepostModel.countDocuments as jest.Mock).mockResolvedValue(mockRepostCount);
      (PostModel.countDocuments as jest.Mock).mockResolvedValue(mockRepliesCount);
      (PostStatsModel.aggregate as jest.Mock).mockResolvedValue(mockPostStatsAggregation);

      const result = await PostStatsService.get(mockPostId);

      assertPostStats(result);
      expect(result.viewsCount).toEqual(mockPostStatsAggregation[0].viewsCount);
      expect(result.detailsViewsCount).toEqual(mockPostStatsAggregation[0].detailsViewsCount);
    });

    it("should return default PostStats if no stats are found", async () => {
      const mockPostId = getMongoId();

      (PostLikeModel.countDocuments as jest.Mock).mockResolvedValue(0);
      (RepostModel.countDocuments as jest.Mock).mockResolvedValue(0);
      (PostModel.countDocuments as jest.Mock).mockResolvedValue(0);
      (PostStatsModel.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await PostStatsService.get(mockPostId);

      assertPostStats(result);
      expect(result).toEqual(defaultPostStats);
    });
  });
});
