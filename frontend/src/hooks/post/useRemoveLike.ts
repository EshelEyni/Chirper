import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../services/post.service";
import reactQueryService from "../../services/reactQuery/reactQuery.service";

export function useRemoveLike() {
  const queryClient = useQueryClient();

  const { mutate: removeLike, isLoading: isRemoving } = useMutation({
    mutationFn: postService.removeLike,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: err => {
      const errMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMessage);
    },
  });

  return { isRemoving, removeLike };
}
