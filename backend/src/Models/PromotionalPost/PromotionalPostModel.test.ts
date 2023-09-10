import { PromotionalPost } from "../../../../shared/types/post";
import {
  createManyTestPromotionalPosts,
  createTestPromotionalPost,
} from "../../services/test/testUtilService";
import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";
import * as PromotionalPostModelModule from "./promotionalPostModel";
import * as populatePostData from "../../services/post/populatePostData";
import { assertPost } from "../../services/test/testAssertionService";

const { PromotionalPostModel } = PromotionalPostModelModule;

describe("PromotionalPostModel", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await PromotionalPostModel.deleteMany({});
    await disconnectFromTestDB();
  });

  describe("Post find hook - should populate user", () => {
    it("Should call populatePostData when post is found.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPromotionalPost({});
      const postFromDB = (await PromotionalPostModel.findById(
        post.id
      )) as unknown as PromotionalPost;
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      assertPost(postFromDB);
    });

    it("Should return early if the found doc is null or undefined.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPromotionalPost({});
      const postFromDB = (await PromotionalPostModel.findById(
        post.id
      )) as unknown as PromotionalPost;
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      assertPost(postFromDB);
    });

    it("Should return early if skipHooks option is true.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPromotionalPost({});
      const postFromDB = (await PromotionalPostModel.findById(
        post.id
      )) as unknown as PromotionalPost;
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      assertPost(postFromDB);
    });

    it("Should handle both single and multiple result sets.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const [post1, post2] = await createManyTestPromotionalPosts({});
      const postFromDB = (await PromotionalPostModel.find({
        _id: { $in: [post1.id, post2.id] },
      })) as unknown as PromotionalPost[];
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      postFromDB.forEach(assertPost);
    });
  });
});
