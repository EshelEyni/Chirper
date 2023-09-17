import { vi } from "vitest";
import { Gif } from "../../../shared/types/GIF";
import { Post } from "../../../shared/types/post";
import { User } from "../../../shared/types/user";
import { createId } from "../../src/services/util/utilService";
import { store } from "../../src/store/store";
import * as PostEditContextModule from "../../src/contexts/PostEditContext";

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

function createTestGif(): Gif {
  return {
    url: "https://example.com/gif.gif",
    staticUrl: "https://example.com/static.gif",
    description: "Funny GIF",
    size: { height: 300, width: 400 },
    placeholderUrl: "https://example.com/placeholder.gif",
    staticPlaceholderUrl: "https://example.com/static-placeholder.gif",
  };
}

function getCurrNewPostFromStore() {
  const state = store.getState();
  return state.postEdit.homePage.posts[0];
}

function setSpyUsePostEdit() {
  vi.spyOn(PostEditContextModule, "usePostEdit").mockReturnValue({
    currNewPost: getCurrNewPostFromStore(),
  } as any);
}

export default {
  createMantTestPosts,
  createTestPost,
  createTestUser,
  createTestLoggedInUserActionState,
  createTestGif,
  getCurrNewPostFromStore,
  setSpyUsePostEdit,
};
