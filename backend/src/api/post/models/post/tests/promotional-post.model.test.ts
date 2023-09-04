import {
  connectToTestDB,
  createTestPromotionalPost,
  disconnectFromTestDB,
} from "../../../../../services/test-util.service";
import { PromotionalPostModel } from "../promotional-post.model";

describe("PromotionalPostModel", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await PromotionalPostModel.deleteMany({});
    await disconnectFromTestDB();
  });

  it("should popluate the user", async () => {
    const post = (await createTestPromotionalPost()) as any;
    console.log(post);
    try {
      const retrievedPost = (await PromotionalPostModel.find({}).exec()) as any;
      console.log(retrievedPost[0]);
    } catch (err) {
      console.log(err);
    }
    // expect(retrievedPost?.createdBy).toBeDefined();
  });
});
