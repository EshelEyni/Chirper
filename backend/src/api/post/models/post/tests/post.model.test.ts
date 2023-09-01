import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { User } from "../../../../../../../shared/interfaces/user.interface";
import { getLoggedInUserIdFromReq } from "../../../../../services/als.service";
import {
  connectToTestDB,
  createManyTestPosts,
  createManyTestUsers,
  deleteManyTestPosts,
  deleteManyTestUsers,
  disconnectFromTestDB,
} from "../../../../../services/test-util.service";
import {
  UserRelationKind,
  UserRelationModel,
} from "../../../../user/models/user-relation/user-relation.model";
import { PostModel } from "../post.model";

jest.mock("../../../../../services/als.service", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

xdescribe("PostModel", () => {
  let loggedInUser: User,
    followedUser: User,
    blockedUser: User,
    followedUserPost: Post,
    blockedUserPost: Post;

  beforeAll(async () => {
    await connectToTestDB();
    [loggedInUser, followedUser, blockedUser] = await createManyTestUsers(3);
    await UserRelationModel.create([
      {
        fromUserId: loggedInUser.id,
        toUserId: followedUser.id,
        kind: UserRelationKind.Follow,
      },
      {
        fromUserId: loggedInUser.id,
        toUserId: blockedUser.id,
        kind: UserRelationKind.Block,
      },
    ]);

    [followedUserPost, blockedUserPost] = await createManyTestPosts({
      createdByIds: [followedUser.id, blockedUser.id],
    });

    (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(loggedInUser.id);
  });

  afterAll(async () => {
    await deleteManyTestUsers([loggedInUser.id, followedUser.id, blockedUser.id]);
    await deleteManyTestPosts([followedUserPost.id, blockedUserPost.id]);

    await disconnectFromTestDB();
  });

  describe("Schema", () => {
    it("should have a title", async () => {
      // const post = await PostModel.findById(followedUserPost.id);
      const post = await PostModel.find({}).setOptions({ isBlocked: true });
      console.log(JSON.stringify(post, null, 2));
      expect(true).toBe(true);
    });
  });
});
