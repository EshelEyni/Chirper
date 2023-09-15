import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import reactQueryService from "../services/reactQuery/reactQueryService";
import userRelationService from "../services/userRelation/userRelationApiService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../services/util/utilService";

export default function useRemoveBlock() {
  const queryClient = useQueryClient();

  const { mutate: removeBlock } = useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId: string }) =>
      await userRelationService.unBlockUser(userId, postId),
    onSuccess: post => {
      const isDataPost = "createdBy" in post;
      if (!isDataPost) return;
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      toast.error(<UserMsg userMsg={getDefaultErrorMsg()} />);
    },
  });

  return { removeBlock };
}
