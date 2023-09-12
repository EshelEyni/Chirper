import { useQuery } from "@tanstack/react-query";
import postApiService from "../services/postApiService/postApiService";

export function useQueryPosts() {
  const {
    data: posts,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => postApiService.query(),
  });
  const isEmpty = posts && posts.length === 0 ? true : false;

  return { posts, error, isLoading, isSuccess, isError, isEmpty };
}

// Path: src\hooks\useQueryPosts.ts
