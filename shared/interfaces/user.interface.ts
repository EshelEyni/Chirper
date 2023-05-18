export interface User {
  id: string;
  username: string;
  password?: string;
  passwordConfirm?: string;
  email: string;
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
  isAdmin?: boolean;
  isVerified?: boolean;
  imgUrl: string;
}
