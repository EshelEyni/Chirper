/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMockPost } from "../test/testUtilService";
import { APIFeatures, shuffleArray } from "../util/utilService";
import { PostModel } from "../../models/post/postModel";
import { PromotionalPostModel } from "../../models/promotionalPost/promotionalPostModel";
import { RepostModel } from "../../models/repost/repostModel";
import postService from "./postService";

jest.mock("../../models/post/postModel");

jest.mock("../util/utilService", () => ({
  APIFeatures: jest.fn(),
  shuffleArray: jest.fn(),
}));

jest.mock("../../models/repost/repostModel", () => ({
  RepostModel: {
    find: jest.fn(),
  },
}));

jest.mock("../../models/promotionalPost/promotionalPostModel", () => ({
  PromotionalPostModel: {
    find: jest.fn(),
  },
}));

describe("postService", () => {
  describe("query", () => {
    const mockToObject = jest.fn().mockReturnThis();

    const mockPosts = Array(50)
      .fill(null)
      .map(() => getMockPost({ body: { type: "post" } }));

    const mockReposts = Array(5)
      .fill(null)
      .map(() => ({
        repost: getMockPost({ body: { type: "repost" } }),
        toObject: mockToObject,
      }));

    const mockPromotionalPosts = Array(5)
      .fill(null)
      .map(() => getMockPost({ body: { type: "promotional-post" } }));

    const mockQueryObj = {
      filter: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limitFields: jest.fn().mockReturnThis(),
      paginate: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockPosts),
    };

    const mockAPIFeatures = jest.fn().mockImplementation(() => mockQueryObj);

    beforeEach(() => {
      (APIFeatures as jest.Mock).mockImplementation(mockAPIFeatures);
      (shuffleArray as jest.Mock).mockReturnValue([...mockPromotionalPosts]);

      (RepostModel.find as jest.Mock).mockResolvedValue(mockReposts);
      (PromotionalPostModel.find as jest.Mock).mockResolvedValue(mockPromotionalPosts);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return posts", async () => {
      const result = await postService.query({});

      expect(mockAPIFeatures).toHaveBeenCalledWith(PostModel.find(), {});
      expect(mockQueryObj.filter).toHaveBeenCalled();
      expect(mockQueryObj.sort).toHaveBeenCalled();
      expect(mockQueryObj.limitFields).toHaveBeenCalled();
      expect(mockQueryObj.paginate).toHaveBeenCalled();
      expect(mockQueryObj.getQuery).toHaveBeenCalled();
      expect(mockQueryObj.exec).toHaveBeenCalled();

      const expectedLength = mockPosts.length + mockPromotionalPosts.length + mockReposts.length;
      expect(result).toHaveLength(expectedLength);
    });

    it("should return posts with reposts", async () => {
      const result = (await postService.query({})) as any[];
      const repostCount = result.filter(post => post?.type === "repost").length;
      expect(repostCount).toBe(mockReposts.length);
    });

    it("should return promotional posts every 10 posts", async () => {
      const result = (await postService.query({})) as any[];
      const promoPostCount = result.filter(post => post?.type === "promotional-post").length;
      expect(promoPostCount).toBe(mockPromotionalPosts.length);
      const allPromoPostFromRes: any[] = [];

      result.forEach((post, index) => {
        if (post.type === "promotional-post")
          allPromoPostFromRes.push({
            type: post.type,
            index,
          });
      });

      expect(allPromoPostFromRes.every(post => post?.index % 10 === 0)).toBe(true);
    });
  });
});
