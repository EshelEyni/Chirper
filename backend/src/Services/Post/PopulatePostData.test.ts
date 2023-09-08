/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post, QuotedPost } from "../../../../shared/types/post.interface";
import { IPost } from "../../Types/ITypes";
import { User } from "../../../../shared/types/user.interface";
import {
  CreatePostStatParams,
  RepostParams,
  createManyTestUsers,
  createTestPollVote,
  createTestLike,
  createTestPoll,
  createTestPost,
  createTestReposts,
  createTestUser,
  createTestView,
} from "../Test/TestUtilService";
import { UserModel } from "../../Models/User/UserModel";
import { PostLikeModel } from "../../Models/PostLike/PostLikeModel";
import { RepostModel } from "../../Models/Repost/RepostModel";
import { PostModel } from "../../Models/Post/PostModel";
import { populatePostData } from "./PopulatePostData";
import { getLoggedInUserIdFromReq } from "../ALSService";
import { PollVoteModel } from "../../Models/PollVote/PollVoteModel";
import {
  assertLoggedInUserState,
  assertPoll,
  assertPost,
  assertQuotedPost,
  assertUser,
} from "../Test/TestAssertionService";
import { connectToTestDB, disconnectFromTestDB } from "../Test/TestDBService";

jest.mock("../ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

type GetPostDocParams = {
  createdById?: string;
};

type CreatePostStatDetailsConfig = {
  postId: string;
  userIdKey?: "userId" | "repostOwnerId";
  users: User[];
};

describe("PostModel: PostDataPopulator", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await RepostModel.deleteMany({});
    await PostLikeModel.deleteMany({});
    await PollVoteModel.deleteMany({});
    await disconnectFromTestDB();
  });

  it("should correctly get post.", async () => {
    const post = await _createTestPostAndPopulate({});
    assertPost(post);
  });

  it("Should correctly populate createdBy from UserModel.", async () => {
    const user = await createTestUser();
    const post = await _createTestPostAndPopulate({
      createdById: user.id,
    });
    const { createdBy } = post;
    expect(createdBy).toBeDefined();
    expect(createdBy.id).toBe(user.id);
    assertUser(createdBy);
  });

  it("Should correctly set loggedInUserActionState.", async () => {
    const post = await _createTestPostAndPopulate({});
    const { loggedInUserActionState } = post;

    expect(loggedInUserActionState).toBeDefined();
    assertLoggedInUserState(loggedInUserActionState);
  });

  it("Should correctly set repostsCount", async () => {
    const post = await _createTestPostAndPopulate({});
    const { repostsCount } = post;
    expect(repostsCount).toBe(0);
    const [user1, user2, user3] = await createManyTestUsers(3);
    const repostDetails = _createPostStatDetails({
      postId: post.id,
      users: [user1, user2, user3],
      userIdKey: "repostOwnerId",
    }) as RepostParams[];
    await createTestReposts(...repostDetails);
    const updatedPost = await _getTestPostAndPopulate(post.id);
    expect(updatedPost.repostsCount).toBe(3);
  });

  it("Should correctly set likesCount", async () => {
    const post = await _createTestPostAndPopulate({});
    const { likesCount } = post;
    expect(likesCount).toBe(0);

    const [user1, user2, user3] = await createManyTestUsers(3);

    const likeDetails = _createPostStatDetails({
      postId: post.id,
      users: [user1, user2, user3],
    }) as CreatePostStatParams[];

    await createTestLike(...likeDetails);

    const updatedPost = await _getTestPostAndPopulate(post.id);
    expect(updatedPost.likesCount).toBe(3);
  });

  it("Should correctly set viewsCount.", async () => {
    const post = await _createTestPostAndPopulate({});
    const { viewsCount } = post;

    expect(viewsCount).toBe(0);

    const [user1, user2, user3] = await createManyTestUsers(3);

    const viewDetails = _createPostStatDetails({
      postId: post.id,
      users: [user1, user2, user3],
    }) as CreatePostStatParams[];

    await createTestView(...viewDetails);

    const updatedPost = await _getTestPostAndPopulate(post.id);
    expect(updatedPost.viewsCount).toBe(3);
  });

  it("Should correctly set repliesCount.", async () => {
    const post = await _createTestPostAndPopulate({});
    const { repliesCount } = post;

    expect(repliesCount).toBe(0);

    const [user1, user2, user3] = await createManyTestUsers(3);

    for (const user of [user1, user2, user3]) {
      await createTestPost({
        createdById: user.id,
        body: {
          text: "Hello world",
          parentPostId: post.id,
        },
      });
    }

    const updatedPost = await _getTestPostAndPopulate(post.id);
    expect(updatedPost.repliesCount).toBe(3);
  });

  it("Should populate quoted posts correctly.", async () => {
    const quotedPost = await createTestPost({});
    const post = await createTestPost({
      body: { quotedPostId: quotedPost.id },
    });

    const updatedPost = await _getTestPostAndPopulate(post.id);
    expect(updatedPost.quotedPost).toBeDefined();
    assertQuotedPost(updatedPost.quotedPost as QuotedPost);
  });

  it("Should populate post poll data correctly.", async () => {
    const [user1, user2, user3] = await createManyTestUsers(3);
    mockGetLoggedInUserIdFromReq(user1.id);

    const post1 = await createTestPost({
      body: {
        poll: createTestPoll({
          options: [{ text: "Option 1" }, { text: "Option 2" }, { text: "Option 3" }],
        }),
      },
    });

    const pollVotes = [
      { userId: user1.id, postId: post1.id, optionIdx: 0 },
      { userId: user2.id, postId: post1.id, optionIdx: 1 },
      { userId: user3.id, postId: post1.id, optionIdx: 1 },
    ];

    createTestPollVote(...pollVotes);

    const updatedPost = await _getTestPostAndPopulate(post1.id);
    assertPost(updatedPost);

    const { poll } = updatedPost;
    if (!poll) throw new Error("Poll is undefined.");
    assertPoll(poll);

    expect(poll.options[0].voteCount).toBe(1);
    expect(poll.options[1].voteCount).toBe(2);
    expect(poll.options[2].voteCount).toBe(0);

    expect(poll.options[0].isLoggedInUserVoted).toBe(true);
    expect(poll.options[1].isLoggedInUserVoted).toBe(false);
    expect(poll.options[2].isLoggedInUserVoted).toBe(false);

    expect(poll.isVotingOff).toBe(true);

    mockGetLoggedInUserIdFromReq(user2.id);
    const updatedPost2 = await _getTestPostAndPopulate(post1.id);
    assertPost(updatedPost2);

    const { poll: poll2 } = updatedPost2;
    if (!poll2) throw new Error("Poll is undefined.");
    assertPoll(poll2);

    expect(poll2.options[0].voteCount).toBe(1);
    expect(poll2.options[1].voteCount).toBe(2);
    expect(poll2.options[2].voteCount).toBe(0);

    expect(poll2.options[0].isLoggedInUserVoted).toBe(false);
    expect(poll2.options[1].isLoggedInUserVoted).toBe(true);
    expect(poll2.options[2].isLoggedInUserVoted).toBe(false);

    expect(poll2.isVotingOff).toBe(true);
  });

  it("Should correctly set poll voting is off when poll length has passed", async () => {
    const post = await createTestPost({
      body: {
        poll: createTestPoll({
          options: [{ text: "Option 1" }, { text: "Option 2" }, { text: "Option 3" }],
          length: { days: 0, hours: 0, minutes: 1 },
        }),
        createdAt: new Date(Date.now() - 1000 * 120),
      },
    });

    const updatedPost = await _getTestPostAndPopulate(post.id);
    assertPost(updatedPost);

    const { poll } = updatedPost;
    if (!poll) throw new Error("Poll is undefined.");
    assertPoll(poll);

    expect(poll.isVotingOff).toBe(true);
  });

  it("Should correctly set poll voting is off when user is not logged in", async () => {
    mockGetLoggedInUserIdFromReq(null);
    const post = await createTestPost({
      body: {
        poll: createTestPoll({
          options: [{ text: "Option 1" }, { text: "Option 2" }, { text: "Option 3" }],
        }),
      },
    });

    const updatedPost = await _getTestPostAndPopulate(post.id);
    assertPost(updatedPost);

    const { poll } = updatedPost;
    if (!poll) throw new Error("Poll is undefined.");
    assertPoll(poll);

    expect(poll.isVotingOff).toBe(true);
  });
});

async function _createTestPostAndPopulate({ createdById }: GetPostDocParams): Promise<Post> {
  const postDoc = await _createAndGetPostDoc({ createdById });
  return await _populatedPostDocAndConvertToObj(postDoc);
}

async function _getTestPostAndPopulate(postId: string): Promise<Post> {
  const postDoc = await _getPostDoc(postId);
  return await _populatedPostDocAndConvertToObj(postDoc);
}

async function _createAndGetPostDoc({ createdById }: GetPostDocParams): Promise<IPost> {
  const post = await createTestPost({ createdById });
  return await _getPostDoc(post.id);
}

async function _getPostDoc(postId: string): Promise<IPost> {
  // We need a fresh copy of the post doc to avoid hooks
  // When saving a doc, mongoose runs the post save hook on the doc
  // We need to avoid this because the post save hook will call PostDataPopulator
  return (await PostModel.findById(postId).setOptions({
    skipHooks: true,
  })) as unknown as IPost;
}

async function _populatedPostDocAndConvertToObj(postDoc: IPost): Promise<Post> {
  await populatePostData(postDoc);
  return _getPostObj(postDoc);
}

function _getPostObj(postDoc: IPost): Post {
  return postDoc.toObject() as Post;
}

function _createPostStatDetails({
  postId,
  userIdKey = "userId",
  users,
}: CreatePostStatDetailsConfig) {
  return users.map(user => ({
    postId,
    [userIdKey]: user.id,
  }));
}

function mockGetLoggedInUserIdFromReq(value: any) {
  (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(value);
}
