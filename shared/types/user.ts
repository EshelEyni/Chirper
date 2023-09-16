export interface UserCredenitials {
  username: string;
  fullname: string;
  password: string;
  passwordConfirm: string;
  email: string;
}

export interface UserCredenitialsWithId extends UserCredenitials {
  readonly id: string;
}

export interface User {
  readonly id: string;
  username: string;
  fullname: string;
  email: string;
  bio: string;
  imgUrl: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBot: boolean;
  isApprovedLocation: boolean;
  followingCount: number;
  followersCount: number;
  createdAt: string;
  isFollowing?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export type FollowingResult = {
  loggedInUser: User;
  targetUser: User;
};
