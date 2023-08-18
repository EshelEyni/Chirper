import { useQuery } from "@tanstack/react-query";
import postService from "../../services/post.service";
import { Post } from "../../../../shared/interfaces/post.interface";

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
      return postService.getById(id);
    },
  });

  return { post, error, isLoading, isSuccess, isError };
}
