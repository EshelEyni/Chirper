import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import postApiService from "../services/postApiService/postApiService";
import reactQueryService from "../services/reactQuery/reactQueryService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../services/util/utilService";

export function useAddPollVote() {
  const queryClient = useQueryClient();

  const { mutate: addPollVote, isLoading: isVoting } = useMutation({
    mutationFn: postApiService.addPollVote,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      toast.error(t => (
        <UserMsg userMsg={getDefaultErrorMsg()} onDissmisToast={() => toast.dismiss(t.id)} />
      ));
    },
  });
  return { isVoting, addPollVote };
}
