export interface UserCredenitials {
  username: string;
  fullname: string;
  password?: string;
  passwordConfirm?: string;
  email: string;
}

export interface User extends UserCredenitials {
  id: string;
  bio: string;
  imgUrl: string;
  isAdmin: boolean;
  isVerified: boolean;
  isApprovedLocation: boolean;
  followingCount: number;
  followersCount: number;
  createdAt: number;
  isFollowing?: boolean;
}

export interface MiniUser {
  id: string;
  username: string;
  fullname: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  imgUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export type FollowingResult = {
  updatedFollower: User;
  updatedFollowing: User;
};
