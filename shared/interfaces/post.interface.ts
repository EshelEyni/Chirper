import { Document } from "mongoose";
import { Gif } from "./gif.interface";
import { Location } from "./location.interface";
import { ReactIcon } from "../../frontend/src/types/elements.interface";

export type PostDocument = Post & Document;


export type AddPostParams = {
  posts?: NewPost[];
  repostedPost?: Post;
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
  poll: Poll | null;
  schedule?: Date;
  location?: Location;
  isPublic: boolean;
  audience: string;
  repliersType: string;
  repliedPostDetails?: repliedPostDetails[];
  repostedById?: string;
};

export interface NewPost extends BasicPost {
  idx: number;
  imgs: NewPostImg[];
  userId?: string;
  previousThreadPostId?: string;
  isDraft?: boolean;
}

export interface Post extends BasicPost {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  commentSum: number;
  repostSum: number;
  likes: number;
  views: number;
  imgs: PostImg[];
  createdBy: {
    id: string;
    username: string;
    fullname: string;
    isAdmin?: boolean;
    isVerified?: boolean;
    imgUrl: string;
  };
  repostedBy?: {
    id: string;
    username: string;
    fullname: string;
  };
}

export type PollOption = {
  text: string;
  voteSum: number;
  isLoggedinUserVoted: boolean;
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
}

export interface Emoji {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortCodes: string;
  unified: string;
}
