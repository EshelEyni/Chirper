export interface User {
  id: string;
  username: string;
  password?: string;
  fullname: string;
  imgUrl: string;
  isAdmin: boolean;
  isVerified: boolean;
  isApprovedLocation: boolean;
  createdAt: number;
}

export interface MiniUser {
  id: string;
  username: string;
  fullname: string;
  imgUrl: string;
}
