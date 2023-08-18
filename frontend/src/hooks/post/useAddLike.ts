import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../services/post.service";
import reactQueryService from "../../services/reactQuery/reactQuery.service";

export function useAddLike() {
  const queryClient = useQueryClient();

  const { mutate: addLike, isLoading: isAdding } = useMutation({
    mutationFn: postService.addLike,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: err => {
      const errMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMessage);
    },
  });

  return { isAdding, addLike };
}
