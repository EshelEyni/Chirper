import { GifUrl } from "./gif.interface";

export interface NewPost {
  text: string;
  imgUrls?: string[];
  videoUrl?: string;
  gifUrl?: GifUrl;
  poll_id?: string;
  schedule?: string;
  location?: string;
  audience: string;
  repliersType: string;
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
