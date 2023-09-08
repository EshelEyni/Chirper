import PostStatsService, { defaultPostStats } from "./PostStatsService";
import { PostLikeModel } from "../../Models/PostLike/PostLikeModel";
import { PostStatsModel } from "../../Models/PostStats/PostStatsModel";
import { PostModel } from "../../Models/Post/PostModel";
import { RepostModel } from "../../Models/Repost/RepostModel";
import { getMongoId } from "../Test/TestUtilService";
import { assertPostStats } from "../Test/TestAssertionService";

jest.mock("../../Models/PostLike/PostLikeModel", () => ({
  PostLikeModel: {
    countDocuments: jest.fn(),
  },
}));
jest.mock("../../Models/PostStats/PostStatsModel", () => ({
  PostStatsModel: {
    aggregate: jest.fn(),
  },
}));
jest.mock("../../Models/Post/PostModel", () => ({
  PostModel: {
    countDocuments: jest.fn(),
  },
}));
jest.mock("../../Models/Repost/RepostModel", () => ({
  RepostModel: {
    countDocuments: jest.fn(),
  },
}));
jest.mock("../../Models/PromotionalPost/PromotionalPostModel", () => ({
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
