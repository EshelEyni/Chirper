import { LoggedInUserActionState, Post } from "../../../shared/interfaces/post.interface";
import { MiniUser } from "../../../shared/interfaces/user.interface";
import tokenService from "./token/token.service";

function assertPost(post: Post) {
  expect(post).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      repliesCount: expect.any(Number),
      repostsCount: expect.any(Number),
      likesCount: expect.any(Number),
      viewsCount: expect.any(Number),
    })
  );

  assertLoggedInUserState(post.loggedInUserActionState);
  assertMiniUser(post.createdBy);
}

function assertLoggedInUserState(loggedInUserState: LoggedInUserActionState) {
  expect(loggedInUserState).toEqual({
    isLiked: expect.any(Boolean),
    isReposted: expect.any(Boolean),
    isViewed: expect.any(Boolean),
    isDetailedViewed: expect.any(Boolean),
    isProfileViewed: expect.any(Boolean),
    isFollowedFromPost: expect.any(Boolean),
    isHashTagClicked: expect.any(Boolean),
    isLinkClicked: expect.any(Boolean),
    isBookmarked: expect.any(Boolean),
    isPostLinkCopied: expect.any(Boolean),
    isPostShared: expect.any(Boolean),
    isPostSendInMessage: expect.any(Boolean),
    isPostBookmarked: expect.any(Boolean),
  });
}

function assertMiniUser(miniUser: MiniUser) {
  expect(miniUser).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      username: expect.any(String),
      fullname: expect.any(String),
      imgUrl: expect.any(String),
      bio: expect.any(String),
      followersCount: expect.any(Number),
      followingCount: expect.any(Number),
      isFollowing: expect.any(Boolean),
    })
  );
}

function getLoginTokenStrForTest(validUserId: string) {
  const token = tokenService.signToken(validUserId);
  return `loginToken=${token}`;
}

export { assertPost, getLoginTokenStrForTest };
