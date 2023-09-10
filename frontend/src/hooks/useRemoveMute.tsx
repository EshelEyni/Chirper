import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../services/reactQuery/reactQuery.service";
import userRelationService from "../services/userRelation.service";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../services/util/utils.service";

export default function useRemoveMute() {
  const queryClient = useQueryClient();

  const { mutate: removeMute } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId: string }) =>
      await userRelationService.unMuteUser(userId, postId),
    onSuccess: post => {
      const isDataPost = "createdBy" in post;
      if (!isDataPost) return;
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      toast.error(<UserMsg userMsg={getDefaultErrorMsg()} />);
    },
  });

  return { removeMute };
}
