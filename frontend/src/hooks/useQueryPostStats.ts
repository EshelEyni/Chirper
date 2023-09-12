import { useQuery } from "@tanstack/react-query";
import { PostStats } from "../../../shared/types/post";
import postApiService from "../services/postApiService/postApiService";

type useQueryPostStatsResult = {
  postStats: PostStats | undefined;
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

export function useQueryPostStats(id: string): useQueryPostStatsResult {
  const {
    data: postStats,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [`postStats/${id}`],
    queryFn: () => {
      if (!id) throw new Error("useQueryPostStats: id is required");
      return postApiService.getPostStats(id);
    },
  });

  return { postStats, error, isLoading, isSuccess, isError };
}
