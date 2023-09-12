import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postApiService from "../services/postApiService/postApiService";
import reactQueryService from "../services/reactQuery/reactQueryService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../services/util/utilService";

export function useRemoveLike() {
  const queryClient = useQueryClient();

  const { mutate: removeLike, isLoading: isRemoving } = useMutation({
    mutationFn: postApiService.removeLike,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
  });

  return { isRemoving, removeLike };
}
