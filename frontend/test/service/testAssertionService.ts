import { expect } from "vitest";
import { BotPrompt } from "../../../shared/types/bot";
import { Gif, GifCategory } from "../../../shared/types/GIF";
import {
  LoggedInUserActionState,
  NewPost,
  Poll,
  Post,
  PostStats,
  PromotionalPost,
  QuotedPost,
  Repost,
} from "../../../shared/types/post";
import { User } from "../../../shared/types/user";

function assertNewPost(newPost: NewPost) {
  expect(newPost).toEqual(
    expect.objectContaining({
      tempId: expect.any(String),
      audience: expect.any(String),
      repliersType: expect.any(String),
      imgs: expect.any(Array),
    })
  );
}

function assertUser(user: User) {
  expect(user).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      username: expect.any(String),
      fullname: expect.any(String),
      email: expect.any(String),
      bio: expect.any(String),
      imgUrl: expect.any(String),
      isAdmin: expect.any(Boolean),
      isVerified: expect.any(Boolean),
      isApprovedLocation: expect.any(Boolean),
      followingCount: expect.any(Number),
      followersCount: expect.any(Number),
    })
  );

  expect(typeof user.createdAt === "string" || typeof user.createdAt === "object").toBeTruthy();
}

function assertPost(post: Post) {
  expect(post).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      audience: expect.any(String),
      repliersType: expect.any(String),
      repliesCount: expect.any(Number),
      repostsCount: expect.any(Number),
      likesCount: expect.any(Number),
      viewsCount: expect.any(Number),
    })
  );
  expect(typeof post.createdAt === "string" || typeof post.createdAt === "object").toBeTruthy();
  expect(typeof post.updatedAt === "string" || typeof post.updatedAt === "object").toBeTruthy();

  assertLoggedInUserState(post.loggedInUserActionState);
  assertUser(post.createdBy);
}

function assertPromotionalPost(post: PromotionalPost) {
  assertPost(post);
  expect(post).toEqual(
    expect.objectContaining({
      companyName: expect.any(String),
      linkToSite: expect.any(String),
    })
  );
}

function assertRepost(repost: Repost) {
  assertPost(repost);
  const { repostedBy } = repost;
  assertUser(repostedBy);
}

function assertQuotedPost(post: QuotedPost) {
  expect(post).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      audience: expect.any(String),
      repliersType: expect.any(String),
    })
  );
  expect(typeof post.createdAt === "string" || typeof post.createdAt === "object").toBeTruthy();
  assertUser(post.createdBy);
}

function assertLoggedInUserState(loggedInUserState: LoggedInUserActionState) {
  expect(loggedInUserState).toEqual({
    isLiked: expect.any(Boolean),
    isReposted: expect.any(Boolean),
    isViewed: expect.any(Boolean),
    isDetailedViewed: expect.any(Boolean),
    isProfileViewed: expect.any(Boolean),
    isHashTagClicked: expect.any(Boolean),
    isLinkClicked: expect.any(Boolean),
    isBookmarked: expect.any(Boolean),
    isPostLinkCopied: expect.any(Boolean),
    isPostShared: expect.any(Boolean),
    isPostSendInMessage: expect.any(Boolean),
    isPostBookmarked: expect.any(Boolean),
  });
}

function assertGifCategory(category: GifCategory) {
  expect(category).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      imgUrl: expect.any(String),
      sortOrder: expect.any(Number),
    })
  );
}

function assertGif(gif: Gif) {
  expect(gif).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      url: expect.any(String),
      staticUrl: expect.any(String),
      description: expect.any(String),
      size: expect.objectContaining({
        height: expect.any(Number),
        width: expect.any(Number),
      }),
      placeholderUrl: expect.any(String),
      staticPlaceholderUrl: expect.any(String),
    })
  );
}

function assertPoll(poll: Poll) {
  expect(poll).toEqual(
    expect.objectContaining({
      options: expect.any(Array),
      isVotingOff: expect.any(Boolean),
      createdAt: expect.anything(),
    })
  );

  for (const option of poll.options) {
    expect(option).toEqual(
      expect.objectContaining({
        text: expect.any(String),
        voteCount: expect.any(Number),
        isLoggedInUserVoted: expect.any(Boolean),
      })
    );
  }

  expect(poll.options.length).toBeGreaterThanOrEqual(2);
  expect(poll.options.length).toBeLessThanOrEqual(5);

  const timeStamp = new Date(poll.createdAt).getTime();
  expect(timeStamp).toBeLessThanOrEqual(Date.now());

  expect(poll.length).toEqual({
    days: expect.any(Number),
    hours: expect.any(Number),
    minutes: expect.any(Number),
  });
}

function assertPostImgs(...postImgs: any) {
  for (const postImg of postImgs) {
    expect(postImg).toEqual(
      expect.objectContaining({
        url: expect.any(String),
        sortOrder: expect.any(Number),
      })
    );
  }
}

function assertBotPrompt(botPrompt: BotPrompt) {
  expect(botPrompt).toEqual(
    expect.objectContaining({
      botId: expect.any(String),
      prompt: expect.any(String),
      type: expect.any(String),
    })
  );
}

function assertPostStats(stats: PostStats) {
  expect(stats).toEqual(
    expect.objectContaining({
      likesCount: expect.any(Number),
      repostCount: expect.any(Number),
      repliesCount: expect.any(Number),
      viewsCount: expect.any(Number),
      detailsViewsCount: expect.any(Number),
      profileViewsCount: expect.any(Number),
      followFromPostCount: expect.any(Number),
      hashTagClicksCount: expect.any(Number),
      linkClicksCount: expect.any(Number),
      engagementCount: expect.any(Number),
    })
  );
}

export {
  assertNewPost,
  assertUser,
  assertPost,
  assertPromotionalPost,
  assertRepost,
  assertQuotedPost,
  assertGifCategory,
  assertGif,
  assertPoll,
  assertPostImgs,
  assertBotPrompt,
  assertLoggedInUserState,
  assertPostStats,
};
