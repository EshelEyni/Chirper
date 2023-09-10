import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../services/post.service";
import reactQueryService from "../services/reactQuery/reactQuery.service";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../services/util/utils.service";

export function useAddLike() {
  const queryClient = useQueryClient();

  const { mutate: addLike, isLoading: isAdding } = useMutation({
    mutationFn: postService.addLike,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      toast.error(t => (
        <UserMsg userMsg={getDefaultErrorMsg()} onDissmisToast={() => toast.dismiss(t.id)} />
      ));
    },
  });

  return { isAdding, addLike };
}
