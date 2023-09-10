import { useQuery } from "@tanstack/react-query";
import gifService from "../services/GIF/GIFService";

export function useQueryGifCategories() {
  const {
    data: gifCategories,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["gifCategories"],
    queryFn: gifService.getGifCategroies,
  });

  const isEmpty = gifCategories && gifCategories.length === 0;

  return { gifCategories, error, isLoading, isSuccess, isError, isEmpty };
}

// Path: src\hooks\useQueryPosts.ts
