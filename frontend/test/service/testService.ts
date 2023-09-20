import { store } from "./../../src/store/store";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mock, expect, vi } from "vitest";
import { Gif } from "../../../shared/types/GIF";
import { Poll, PollOption, Post } from "../../../shared/types/post";
import { User } from "../../../shared/types/user";
import { createId } from "../../src/services/util/utilService";
import * as PostEditContextModule from "../../src/contexts/PostEditContext";
import { Location } from "../../../shared/types/location";
import { act, fireEvent } from "@testing-library/react";
import { UserMsg } from "../../../shared/types/system";
import { updateNewPost } from "../../src/store/slices/postEditSlice";

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

function createManyMockLocations(count: number): Location[] {
  return Array.from({ length: count }, (_, idx) => createMockLocation(idx));
}

function createMockLocation(idx?: number): Location {
  return {
    name: idx ? `locationName_${idx}` : "locationName",
    lat: 0,
    lng: 0,
    placeId: idx ? `placeId_${idx}` : "placeId",
  };
}

function createUsrMsg(options?: {
  type?: "info" | "success" | "error" | "warning" | "";
  text?: string;
  link?: {
    text?: string;
    url: string;
  };
  btn?: {
    text: string;
    fn: Mock<any, any>;
  };
}): UserMsg {
  const defaultUserMsg: UserMsg = {
    type: "info",
    text: "test user msg",
  };

  return options ? { ...defaultUserMsg, ...options } : defaultUserMsg;
}

function createTestPoll(options?: {
  isVotingOff?: boolean;
  options?: PollOption[];
  length?: Poll["length"];
  createdAt?: Poll["createdAt"];
  updatedAt?: Poll["updatedAt"];
}): Poll {
  const defaultPoll: Poll = {
    isVotingOff: false,
    options: [
      { text: "Option 1", voteCount: 5, isLoggedInUserVoted: false },
      { text: "Option 2", voteCount: 3, isLoggedInUserVoted: false },
    ],
    length: { days: 1, hours: 0, minutes: 0 },
    createdAt: "2021-01-01T00:00:00.000Z",
    updatedAt: "2021-01-01T00:00:00.000Z",
  };

  return options ? { ...defaultPoll, ...options } : defaultPoll;
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

async function waitForTick() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

function disptachUpdateNewPostWithPoll(poll = createTestPoll()) {
  store.dispatch(
    updateNewPost({
      newPost: {
        ...getCurrNewPostFromStore(),
        poll,
      },
    })
  );
}

function selectAndCheckValue(
  selectElement: HTMLElement,
  indexToClick: number,
  expectedValue: string
) {
  fireEvent.click(selectElement);

  const dropdownItems = selectElement.querySelectorAll(".custom-select-dropdown-item");
  fireEvent.click(dropdownItems[indexToClick]);

  const actualValue = selectElement.querySelector(".custom-select-value")?.textContent;
  expect(actualValue).toBe(expectedValue);
}

export default {
  createMantTestPosts,
  createTestPost,
  createTestUser,
  createTestLoggedInUserActionState,
  createTestGif,
  getCurrNewPostFromStore,
  setSpyUsePostEdit,
  createManyMockLocations,
  createMockLocation,
  createUsrMsg,
  createTestPoll,
  waitForTick,
  disptachUpdateNewPostWithPoll,
  selectAndCheckValue,
};
