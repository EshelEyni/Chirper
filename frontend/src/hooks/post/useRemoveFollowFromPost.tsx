import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../../services/reactQuery/reactQuery.service";
import userService from "../../services/user.service";
import { UserMsg } from "../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../services/util/utils.service";

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
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
    },
  });

  return { removeFollowFromPost };
}
