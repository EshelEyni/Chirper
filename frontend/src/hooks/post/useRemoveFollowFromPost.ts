import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../../services/reactQuery/reactQuery.service";
import userService from "../../services/user.service";

export default function useRemoveFollowFromPost() {
  const queryClient = useQueryClient();

  const { mutate: removeFollowFromPost } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId: string }) =>
      userService.unFollowUser(userId, postId),
    onSuccess: post => {
      const isDataPost = "createdBy" in post;
      if (!isDataPost) return;
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: err => {
      const errMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMessage);
    },
  });

  return { removeFollowFromPost };
}
