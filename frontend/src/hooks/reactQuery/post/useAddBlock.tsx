import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import userRelationService from "../../../services/userRelation.service";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";
import { getDefaultErrorMsg } from "../../../services/util/utils.service";
import { Post } from "../../../../../shared/interfaces/post.interface";

export default function useAddBlock() {
  const queryClient = useQueryClient();

  const { mutate: addBlock } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId?: string }) =>
      await userRelationService.blockUser(userId, postId),
    onSuccess: data => {
      const isDataPost = "createdBy" in data;
      if (!isDataPost) return;
      const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
      if (!currentPosts) return;
      const updatedPosts = currentPosts.filter(p => p.id !== data.id);
      queryClient.setQueryData(["posts"], updatedPosts);

      const msg = {
        type: "success",
        text: `You blocked ${data.createdBy.username}.`,
        btn: {
          text: "Unblock",
          fn: () => {
            userRelationService.unBlockUser(data.createdBy.id, data.id);
            queryClient.setQueryData(["posts"], currentPosts);
          },
        },
      } as TypeOfUserMsg;

      toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
    onError: () => {
      toast.error(<UserMsg userMsg={getDefaultErrorMsg()} />);
    },
  });

  return { addBlock };
}
