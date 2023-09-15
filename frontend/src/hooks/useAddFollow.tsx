import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../services/reactQuery/reactQueryService";
import userRelationService from "../services/userRelation/userRelationApiService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../shared/types/system";
import { getDefaultErrorMsg } from "../services/util/utilService";

export default function useAddFollow() {
  const queryClient = useQueryClient();

  const { mutate: addFollow } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId?: string }) =>
      await userRelationService.followUser(userId, postId),
    onSuccess: post => {
      const isDataPost = "createdBy" in post;
      if (!isDataPost) return;
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);

      const msg = {
        type: "success",
        text: `You followed ${post.createdBy.username}.`,
      } as TypeOfUserMsg;

      toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
    onError: () => {
      toast.error(t => (
        <UserMsg userMsg={getDefaultErrorMsg()} onDissmisToast={() => toast.dismiss(t.id)} />
      ));
    },
  });

  return { addFollow };
}
