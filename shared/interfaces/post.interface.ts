import { Document } from "mongoose";
import { Gif } from "./gif.interface";
import { Location } from "./location.interface";

export type PostDocument = Post & Document;

export interface NewPost {
  text: string;
  imgUrls?: {
    url: string;
    sortOrder: number;
  }[];
  videoUrl?: string;
  gifUrl?: Gif;
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
    _id: string;
    username: string;
    fullname: string;
    imgUrl: string;
  };
}

export interface Poll {
  options: string[];
  length: {
    days: number;
    hours: number;
    minutes: number;
  };
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
