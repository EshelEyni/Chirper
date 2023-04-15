export interface User {
  _id: string;
  username: string;
  password: string;
  fullname: string;
  imgUrl: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MiniUser {
  _id: string;
  username: string;
  fullname: string;
  imgUrl: string;
}
