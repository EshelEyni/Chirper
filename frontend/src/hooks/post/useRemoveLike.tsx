import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../services/post.service";
import reactQueryService from "../../services/reactQuery/reactQuery.service";
import { UserMsg } from "../../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../shared/interfaces/system.interface";

export function useRemoveLike() {
  const queryClient = useQueryClient();

  const { mutate: removeLike, isLoading: isRemoving } = useMutation({
    mutationFn: postService.removeLike,
    onSuccess: post => {
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

  return { isRemoving, removeLike };
}
