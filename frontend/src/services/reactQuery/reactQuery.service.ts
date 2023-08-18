import { QueryClient } from "@tanstack/react-query";
import { Post } from "../../../../shared/interfaces/post.interface";

function setUpdatePostIntoQueryData(post: Post, queryClient: QueryClient) {
  const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
  console.log("currentPosts.length", currentPosts.length);
  if (!currentPosts) return;
  const updatedPosts = currentPosts.map(p => {
    if (p.id === post.id) return post;
    return p;
  });
  console.log("updatedPosts.length", updatedPosts.length);
  queryClient.setQueryData(["posts"], updatedPosts);
}

export default {
  setUpdatePostIntoQueryData,
};
