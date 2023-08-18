import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../services/post.service";
import { Post } from "../../../../shared/interfaces/post.interface";
import { UserMsg } from "../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../services/util/utils.service";

export function useRemoveRepost() {
  const queryClient = useQueryClient();

  const { mutate: removeRepost, isLoading: isRemoving } = useMutation({
    mutationFn: postService.removeRepost,
    onSuccess: (post: Post) => {
      const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
      if (!currentPosts) return;

      const updatedPosts = currentPosts.map(p => {
        if (p.id === post.id) return post;
        return p;
      });
      queryClient.setQueryData(["posts"], updatedPosts);
    },
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
    },
  });

  return { isRemoving, removeRepost };
}
