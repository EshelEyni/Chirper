import { GifUrl } from "./gif.interface";

export interface NewPost {
  text: string;
  imgUrls?: string[];
  videoUrl?: string;
  gifUrl?: GifUrl;
  poll?: Poll;
  schedule?: Date;
  location?: string;
  audience: string;
  repliersType: string;
  isPublic: boolean;
  user: {
    _id: string;
    username: string;
    fullname: string;
    imgUrl: string;
  };
}

export interface Post extends NewPost {
  _id: string;
  createdAt: number;
  commentSum: number;
  rechirps: number;
  likes: number;
  views: number;
}

export interface Poll {
  choices: string[];
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
