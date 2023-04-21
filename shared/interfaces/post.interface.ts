export interface NewPost {
  text: string;
  imgUrl?: string | null;
  videoUrl?: string | null;
  gifUrl?: string | null;
  poll_id?: string | null;
  schedule?: string | null;
  location?: string | null;
  audience: "everyone" | "chirper-circle";
  repliersType: "everyone" | "followed" | "mentioned";
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
