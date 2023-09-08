import PostStatsService, { defaultPostStats } from "./post-stats.service";
import { PostLikeModel } from "../../models/like/post-like.model";
import { PostStatsModel } from "../../models/post-stats/post-stats.model";
import { PostModel } from "../../models/post/post.model";
import { RepostModel } from "../../models/repost/repost.model";
import { getMongoId } from "../../../../services/test/test-util.service";
import { assertPostStats } from "../../../../services/test/test-assertion.service";

jest.mock("../../models/like/post-like.model", () => ({
  PostLikeModel: {
    countDocuments: jest.fn(),
  },
}));

jest.mock("../../models/post-stats/post-stats.model", () => ({
  PostStatsModel: {
    aggregate: jest.fn(),
  },
}));

jest.mock("../../models/post/post.model", () => ({
  PostModel: {
    countDocuments: jest.fn(),
  },
}));

jest.mock("../../models/repost/repost.model", () => ({
  RepostModel: {
    countDocuments: jest.fn(),
  },
}));

jest.mock("../../models/post/promotional-post.model", () => ({
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
