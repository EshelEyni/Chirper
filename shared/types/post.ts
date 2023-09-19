import { Gif } from "./GIF";
import { Location } from "./location";
import { User } from "./user";

export type PostReplyResult = {
  updatedPost: Post;
  reply: Reply;
};

export type PostRepostResult = {
  post: Post;
  repost: Repost;
};

export type PostImg = {
  url: string;
  sortOrder: number;
};

export type NewPostImg = { url: string; isLoading?: boolean; file?: File };
export type NewPostVideo = {
  url: string;
  isLoading: boolean;
  file: File | null;
};

export type repliedPostDetails = {
  readonly postId: string;
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
  readonly tempId: string;
  imgs: NewPostImg[];
  poll: NewPoll | null;
  quotedPostId?: string;
  isDraft?: boolean;
  repliesCount?: number;
  parentPostId?: string;
  schedule?: Date;
}

// Post With no LoggedInUserActionState, Stat Counts and RepostedBy
export interface QuotedPost extends BasicPost {
  readonly id: string;
  imgs: PostImg[];
  poll: Poll | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Post extends BasicPost {
  readonly id: string;
  readonly createdAt: string;
  updatedAt: string;
  repliesCount: number;
  repostsCount: number;
  likesCount: number;
  viewsCount: number;
  imgs: PostImg[];
  poll: Poll | null;
  quotedPost?: QuotedPost;
  createdBy: User;
  loggedInUserActionState: LoggedInUserActionState;
  schedule?: string;
}

export interface Repost extends Post {
  repostedBy: User;
}

export interface Reply extends Post {
  parentPostId: string;
}

export interface PromotionalPost extends Post {
  isPromotional: boolean;
  companyName: string;
  linkToSite: string;
  linkToRepo?: string;
}

export type AnyPost = Post | Repost | Reply | PromotionalPost;

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
  createdAt: string;
  updatedAt: string;
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
  readonly id: string;
  keywords: string[];
  name: string;
  native: string;
  shortCodes: string;
  unified: string;
}

export type PostStatsBody = {
  readonly postId: string;
  readonly userId: string;
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
  viewsCount: number;
  detailsViewsCount: number;
  profileViewsCount: number;
  followFromPostCount: number;
  hashTagClicksCount: number;
  linkClicksCount: number;
  engagementCount: number;
  postLinkCopyCount: number;
  postSharedCount: number;
  postViaMsgCount: number;
  postBookmarksCount: number;
};
