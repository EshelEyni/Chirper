import { Document } from "mongoose";
import { Gif } from "./gif.interface";
import { Location } from "./location.interface";

export type PostDocument = Post & Document;

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

export interface NewPost {
  text: string;
  imgs: NewPostImg[];
  video?: NewPostVideo | null;
  videoUrl?: string;
  gif: Gif | null;
  poll?: Poll;
  schedule?: Date;
  location?: Location;
  audience: string;
  repliersType: string;
  isPublic: boolean;
  userId: string;
}

export interface Post extends NewPost {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  commentSum: number;
  rechirps: number;
  likes: number;
  views: number;
  user: {
    id: string;
    username: string;
    fullname: string;
    isAdmin?: boolean;
    isVerified?: boolean;
    imgUrl: string;
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
