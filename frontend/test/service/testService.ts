import { Post } from "../../../shared/types/post";
import { User } from "../../../shared/types/user";
import { createId } from "../../src/services/util/utilService";

function createMantTestPosts(count: number): Post[] {
  return Array.from({ length: count }, () => createTestPost());
}

function createTestPost(): Post {
  return {
    id: createId(),
    text: "postText",
    createdAt: "2021-01-01T00:00:00.000Z",
    updatedAt: "2021-01-01T00:00:00.000Z",
    createdBy: createTestUser(),
    imgs: [],
    videoUrl: "",
    gif: null,
    poll: null,
    isPublic: true,
    isPinned: false,
    audience: "everyone",
    repliersType: "everyone",
    repliesCount: 0,
    repostsCount: 0,
    likesCount: 0,
    viewsCount: 0,
    loggedInUserActionState: createTestLoggedInUserActionState(),
  };
}

function createTestUser(): User {
  return {
    id: "userId1",
    username: "username1",
    fullname: "fullname1",
    email: "email1",
    bio: "bio1",
    imgUrl: "profilePicUrl1",
    isVerified: false,
    isAdmin: false,
    isBot: false,
    followingCount: 0,
    followersCount: 0,
    createdAt: "2021-01-01T00:00:00.000Z",
    isApprovedLocation: false,
  };
}

function createTestLoggedInUserActionState() {
  return {
    isLiked: false,
    isReposted: false,
    isViewed: false,
    isDetailedViewed: false,
    isProfileViewed: false,
    isHashTagClicked: false,
    isLinkClicked: false,
    isBookmarked: false,
    isPostLinkCopied: false,
    isPostShared: false,
    isPostSendInMessage: false,
    isPostBookmarked: false,
  };
}

export default {
  createMantTestPosts,
  createTestPost,
  createTestUser,
  createTestLoggedInUserActionState,
};
