import { useQuery } from "@tanstack/react-query";
import postService from "../../services/post.service";

export function useQueryPosts() {
  const {
    data: posts,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: postService.query,
  });

  return { posts, error, isLoading, isSuccess, isError };
}

// Path: src\hooks\useQueryPosts.ts
