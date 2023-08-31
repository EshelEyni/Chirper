export interface UserCredenitials {
  username: string;
  fullname: string;
  password?: string;
  passwordConfirm?: string;
  email: string;
}

export interface UserCredenitialsWithId extends UserCredenitials {
  id: string;
}

export interface User extends UserCredenitials {
  id: string;
  bio: string;
  imgUrl: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBot: boolean;
  isApprovedLocation: boolean;
  followingCount: number;
  followersCount: number;
  createdAt: number;
  isFollowing?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export type FollowingResult = {
  loggedInUser: User;
  targetUser: User;
};
