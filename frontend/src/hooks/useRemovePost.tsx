import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postApiService from "../services/post/postApiService";
import { Post } from "../../../shared/types/post";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../shared/types/system";
import { getDefaultErrorMsg } from "../services/util/utilService";

export function useRemovePost() {
  const queryClient = useQueryClient();

  const { mutate: removePost, isLoading: isRemoving } = useMutation<void, unknown, string, unknown>(
    {
      mutationFn: postApiService.remove,
      onSuccess: (_, postId) => {
        const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
        if (!currentPosts) return;

        const updatedPosts = currentPosts.filter(p => p.id !== postId);
        queryClient.setQueryData(["posts"], updatedPosts);

        const msg = {
          type: "info",
          text: "Your post was deleted",
        } as TypeOfUserMsg;

        toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
      },
      onError: () => {
        const msg = getDefaultErrorMsg();
        toast.error(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
      },
    }
  );

  return { isRemoving, removePost };
}
