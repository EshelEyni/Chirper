import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../../../services/reactQuery/reactQuery.service";
import userService from "../../../services/user.service";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";

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
    onError: () => {
      const msg = {
        type: "error",
        text: "Something went wrong, but don’t fret — let’s give it another shot.",
      } as TypeOfUserMsg;
      toast.error(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
    },
  });

  return { addFollowFromPost };
}
