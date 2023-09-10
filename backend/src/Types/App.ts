import { PostType, UserRelationKind } from "./enums";

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

export type IsFollowingMap = {
  [key: string]: boolean;
};

export type GetPromptResult = {
  rawPrompt: string;
  prompt: string;
};

export type MovieDetails = {
  title: string;
  year: string;
  imgUrl: string;
  released: string;
  director: string;
  writer: string;
};
