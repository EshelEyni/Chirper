import { PostType, UserRelationKind } from "./Enums";

export type alStoreType = Record<string, string>;

export interface ParsedReqQuery {
  [key: string]: string | undefined;
}

export type CreateBotPostOptions = {
  prompt?: string;
  schedule?: Date;
  numOfPosts?: number;
  postType?: PostType;
  numberOfImages?: number;
  addTextToContent?: boolean;
};

export type UserRelationParams = {
  fromUserId: string;
  toUserId: string;
  kind: UserRelationKind;
  postId?: string;
};

export type isFollowingMap = {
  [key: string]: boolean;
};
