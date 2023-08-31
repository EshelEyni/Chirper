import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../../../services/reactQuery/reactQuery.service";
import userRelationService from "../../../services/userRelation.service";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../../services/util/utils.service";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";

export default function useRemoveFollow() {
  const queryClient = useQueryClient();

  const { mutate: removeFollow } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId?: string }) =>
      userRelationService.unFollowUser(userId, postId),
    onSuccess: post => {
      const isDataPost = "createdBy" in post;
      if (!isDataPost) return;
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);

      const msg = {
        type: "success",
        text: `You unfollowed ${post.createdBy.username}.`,
      } as TypeOfUserMsg;

      toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
    onError: () => {
      toast.error(t => (
        <UserMsg userMsg={getDefaultErrorMsg()} onDissmisToast={() => toast.dismiss(t.id)} />
      ));
    },
  });

  return { removeFollow };
}
