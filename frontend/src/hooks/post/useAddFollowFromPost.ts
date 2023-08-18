import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../../services/reactQuery/reactQuery.service";
import userService from "../../services/user.service";

export default function useAddFollowFromPost() {
  const queryClient = useQueryClient();

  const { mutate: addFollowFromPost } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId: string }) =>
      await userService.followUser(userId, postId),
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

  return { addFollowFromPost };
}
