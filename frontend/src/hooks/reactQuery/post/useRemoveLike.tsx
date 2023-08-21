import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../../services/post.service";
import reactQueryService from "../../../services/reactQuery/reactQuery.service";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../../services/util/utils.service";

export function useRemoveLike() {
  const queryClient = useQueryClient();

  const { mutate: removeLike, isLoading: isRemoving } = useMutation({
    mutationFn: postService.removeLike,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
    },
  });

  return { isRemoving, removeLike };
}
