/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient } from "@tanstack/react-query";
import reactQueryService from "./reactQueryService";
import { Post } from "../../../../shared/types/post";
import { describe, it, expect, beforeEach } from "vitest";

describe("Query Data Manipulation Functions", () => {
  let queryClient: QueryClient;
  let mockPosts: Partial<Post>[];

  beforeEach(() => {
    queryClient = new QueryClient();
    mockPosts = [{ id: "1" }, { id: "2" }, { id: "3" }];
    queryClient.setQueryData(["posts"], mockPosts);
  });

  it("should update a post in query data", () => {
    const updatedPost: any = { id: "1" };
    reactQueryService.setUpdatePostIntoQueryData(updatedPost, queryClient);

    const currentData = queryClient.getQueryData(["posts"]) as unknown as any[];
    expect(currentData).toEqual(expect.arrayContaining([updatedPost]));
  });

  it("should remove a post from query data", () => {
    const postToRemove: any = { id: "1" };
    reactQueryService.removePostFromQueryData(postToRemove, queryClient);

    const currentData = queryClient.getQueryData(["posts"]) as unknown as any[];
    expect(currentData).not.toEqual(expect.arrayContaining([postToRemove]));
  });

  it("should not modify query data if it is not set", () => {
    queryClient.removeQueries(["posts"]);

    const post: any = { id: "1" };
    reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    reactQueryService.removePostFromQueryData(post, queryClient);

    const currentData = queryClient.getQueryData(["posts"]);
    expect(currentData).toBeUndefined();
  });
});
