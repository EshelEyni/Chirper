import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../../services/post.service";
import { Post, PostRepostResult } from "../../../../../shared/types/post.interface";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../../services/util/utils.service";

export function useCreateRepost() {
  const queryClient = useQueryClient();

  const { mutate: addRepost, isLoading: isCreating } = useMutation({
    mutationFn: postService.addRepost,
    onSuccess: (data: PostRepostResult) => {
      const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
      if (!currentPosts) return;
      const updatedPosts = [
        data.repost,
        ...currentPosts.map(p => {
          if (p.id === data.post.id) return data.post;
          return p;
        }),
      ];
      queryClient.setQueryData(["posts"], updatedPosts);
    },
    onError: () => {
      toast.error(t => (
        <UserMsg userMsg={getDefaultErrorMsg()} onDissmisToast={() => toast.dismiss(t.id)} />
      ));
    },
  });

  return { isCreating, addRepost };
}
