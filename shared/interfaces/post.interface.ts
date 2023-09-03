import { Gif } from "./gif.interface";
import { Location } from "./location.interface";
import { User } from "./user.interface";

export type PostReplyResult = {
  updatedPost: Post;
  reply: Post;
};

export type PostRepostResult = {
  updatedPost: Post;
  repost: Post;
};

export type PostImg = {
  url: string;
  sortOrder: number;
};

export type NewPostImg = { url: string; isLoading: boolean; file: File };
export type NewPostVideo = {
  url: string;
  isLoading: boolean;
  file: File | null;
};

export type repliedPostDetails = {
  postId: string;
  postOwner: {
    username: string;
    userId: string;
  };
};

export type BasicPost = {
  text: string;
  video?: NewPostVideo | null;
  videoUrl?: string;
  gif: Gif | null;
  schedule?: Date;
  location?: Location;
  isPublic: boolean;
  isPinned?: boolean;
  audience: string;
  repliersType: string;
  repliedPostDetails?: repliedPostDetails[];
  createdById?: string;
  repostedById?: string;
};

export interface NewPost extends BasicPost {
  tempId: string;
  imgs: NewPostImg[];
  poll: NewPoll | null;
  quotedPostId?: string;
  parentPostId?: string;
  isDraft?: boolean;
  repliesCount?: number;
}

// Post With no LoggedInUserActionState, Stat Counts and RepostedBy
export interface QuotedPost extends BasicPost {
  id: string;
  imgs: PostImg[];
  poll: Poll | null;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post extends BasicPost {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  repliesCount: number;
  repostsCount: number;
  likesCount: number;
  viewsCount: number;
  imgs: PostImg[];
  poll: Poll | null;
  quotedPost?: QuotedPost;
  createdBy: User;
  parentPostId?: string;
  loggedInUserActionState: LoggedInUserActionState;
  isPromotional?: boolean;
  linkToSite?: string;
  linkToRepo?: string;
}

export interface Repost extends Post {
  repostedBy: User;
}

export type LoggedInUserActionState = {
  isLiked: boolean;
  isReposted: boolean;
  isViewed: boolean;
  isDetailedViewed: boolean;
  isProfileViewed: boolean;
  isHashTagClicked: boolean;
  isLinkClicked: boolean;
  isBookmarked: boolean;
  isPostLinkCopied: boolean;
  isPostShared: boolean;
  isPostSendInMessage: boolean;
  isPostBookmarked: boolean;
};

export type LoggedInUserActionStates = {
  [key: string]: LoggedInUserActionState;
};

export type PollOption = {
  text: string;
  voteCount: number;
  isLoggedInUserVoted: boolean;
};

export interface Poll {
  options: PollOption[];
  length: {
    days: number;
    hours: number;
    minutes: number;
  };
  isVotingOff: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NewPoll {
  options: { text: string }[];
  length: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export interface Emoji {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortCodes: string;
  unified: string;
}

export type PostStatsBody = {
  postId: string;
  userId: string;
  isViewed: boolean;
  isDetailedViewed: boolean;
  isProfileViewed: boolean;
  isFollowedFromPost: boolean;
  isHashTagClicked: boolean;
  isLinkClicked: boolean;
  isPostLinkCopied: boolean;
  isPostShared: boolean;
  isPostSendInMessage: boolean;
  isPostBookmarked: boolean;
};

export type PostStats = {
  likesCount: number;
  repostCount: number;
  repliesCount: number;
  isViewedCount: number;
  isDetailedViewedCount: number;
  isProfileViewedCount: number;
  isFollowedFromPostCount: number;
  isHashTagClickedCount: number;
  isLinkClickedCount: number;
  engagementCount: number;
};
