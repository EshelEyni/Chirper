import { QueryClient } from "@tanstack/react-query";
import { Post } from "../../../../shared/types/post";

function setUpdatePostIntoQueryData(post: Post, queryClient: QueryClient) {
  const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];

  if (!currentPosts) return;
  const updatedPosts = currentPosts.map(p => {
    if (p.id === post.id) return post;
    return p;
  });
  queryClient.setQueryData(["posts"], updatedPosts);
}

function removePostFromQueryData(post: Post, queryClient: QueryClient) {
  const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];

  if (!currentPosts) return;
  const updatedPosts = currentPosts.filter(p => p.id !== post.id);
  queryClient.setQueryData(["posts"], updatedPosts);
}

export default { setUpdatePostIntoQueryData, removePostFromQueryData };
