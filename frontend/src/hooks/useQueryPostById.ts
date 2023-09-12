import { useQuery } from "@tanstack/react-query";
import { Post } from "../../../shared/types/post";
import postApiService from "../services/postApi/postApiService";

type useQueryPostByIdResult = {
  post: Post | undefined;
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

export function useQueryPostById(id: string): useQueryPostByIdResult {
  const {
    data: post,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [`post/${id}`],
    queryFn: () => {
      if (!id) throw new Error("useQueryPostById: id is required");
      return postApiService.getById(id);
    },
  });

  return { post, error, isLoading, isSuccess, isError };
}
