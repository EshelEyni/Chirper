export interface Post {
  _id: string;
  text: string;
  createdAt: string;
  commentSum: number;
  shares: number;
  likes: number;
  views: number;
  user: {
    _id: number;
    username: string;
    fullname: string;
    imgUrl: string;
  };
}
