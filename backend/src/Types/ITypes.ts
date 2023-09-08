import mongoose from "mongoose";
import { Document } from "mongoose";
import {
  LoggedInUserActionState,
  Post,
  PostImg,
  Repost,
} from "../../../shared/types/post.interface";
import { Gif } from "../../../shared/types/gif.interface";
import { User } from "../../../shared/types/user.interface";

export interface IPost extends Document {
  audience: string;
  repliersType: string;
  isPublic: boolean;
  isDraft?: boolean;
  isPinned: boolean;
  parentPostId?: string;
  createdById: mongoose.Schema.Types.ObjectId;
  text?: string;
  imgs?: PostImg[];
  videoUrl?: string;
  gif?: Gif;
  poll?: IPoll;
  schedule?: Date;
  location?: Location;
  quotedPostId?: string;
  _repostsCount: number;
  _repliesCount: number;
  _likesCount: number;
  _viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDoc extends IPost {
  createdBy: User;
  quotedPost?: Post;
  loggedInUserActionState: LoggedInUserActionState;
  repostsCount: number;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
}

export interface IPromotionalPost extends IPost {
  isPromotional: boolean;
  companyName: string;
  linkToSite: string;
  linkToRepo?: string;
}

export interface IPromotionalPostDoc extends IPromotionalPost, mongoose.Document {
  createdBy: User;
  loggedInUserActionState: LoggedInUserActionState;
  repostsCount: number;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
}

interface IPollVote {
  postId: mongoose.Types.ObjectId;
  optionIdx: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _isLoggedInUserVoted: boolean;
}

export interface IPollVoteDoc extends IPollVote {
  _id: mongoose.Types.ObjectId;
}

interface IRepost {
  postId: mongoose.Types.ObjectId;
  repostOwnerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRepostDoc extends IRepost, Document {
  post: Post;
  repost: Repost;
}

export interface IBotPrompt extends Document {
  botId: mongoose.Schema.Types.ObjectId;
  prompt: string;
  type: "text" | "image" | "poll" | "video";
}

export interface IUser extends Document {
  username: string;
  password: string;
  passwordConfirm: string;
  email: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  fullname: string;
  imgUrl: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBot: boolean;
  isApprovedLocation: boolean;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  // eslint-disable-next-line no-unused-vars
  checkPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
  loginAttempts: number;
  lockedUntil: number;
  bio: string;
  _followingCount: number;
  _followersCount: number;
  _isFollowing: boolean;
  _isMuted: boolean;
  _isBlocked: boolean;
}

export interface IUserDoc extends IUser {
  followingCount: number;
  followersCount: number;
  isFollowing: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

interface IUserRelation {
  fromUserId: string;
  toUserId: string;
  kind: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRelationDoc extends IUserRelation, mongoose.Document {}

export interface IPollOption extends Document {
  text: string;
  voteCount: number;
  _voteCount: number;
  isLoggedInUserVoted: boolean;
  _isLoggedInUserVoted: boolean;
}

export interface IPollLength extends Document {
  days: number;
  hours: number;
  minutes: number;
}

export interface IPoll extends Document {
  options: IPollOption[];
  length: IPollLength;
  _isVotingOff: boolean;
  createdAt: Date;
  updatedAt: Date;
}
