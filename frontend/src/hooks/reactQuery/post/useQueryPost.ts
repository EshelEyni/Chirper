import { useQuery } from "@tanstack/react-query";
import postService from "../../../services/post.service";

export function useQueryPosts() {
  const {
    data: posts,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => postService.query(),
  });
  const isEmpty = posts && posts.length === 0;

  return { posts, error, isLoading, isSuccess, isError, isEmpty };
}

// Path: src\hooks\useQueryPosts.ts
