import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../../services/post.service";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../../services/util/utils.service";

export function useRemovePost() {
  const queryClient = useQueryClient();

  const { mutate: removePost, isLoading: isRemoving } = useMutation<void, unknown, string, unknown>(
    {
      mutationFn: postService.remove,
      onSuccess: (_, postId) => {
        const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
        if (!currentPosts) return;

        const updatedPosts = currentPosts.filter(p => p.id !== postId);
        queryClient.setQueryData(["posts"], updatedPosts);
        toast.success("Your Post was deleted");
      },
      onError: () => {
        const msg = getDefaultErrorMsg();
        toast.error(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
      },
    }
  );

  return { isRemoving, removePost };
}
