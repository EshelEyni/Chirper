import {
  createManyTestPromotionalPosts,
  createTestPromotionalPost,
} from "../../../../../services/test/test-util.service";
import {
  connectToTestDB,
  disconnectFromTestDB,
} from "../../../../../services/test/test-db.service";
import * as PromotionalPostModelModule from "../promotional-post.model";
import * as populatePostData from "../populate-post-data";
import { PromotionalPost } from "../../../../../../../shared/interfaces/post.interface";
import { assertPost } from "../../../../../services/test/test-assertion.service";

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
