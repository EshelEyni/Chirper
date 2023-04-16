export interface Post {
  _id: string;
  text: string;
  createdAt: number;
  commentSum: number;
  shares: number;
  likes: number;
  views: number;
  imgUrl?: string | null;
  videoUrl?: string | null;
  gifUrl?: string | null;
  poll_id?: string | null;
  schedule?: string | null;
  location?: string | null;
  user: {
    _id: number;
    username: string;
    fullname: string;
    imgUrl: string;
  };
}
