import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../../services/post.service";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../../../services/util/utils.service";
import reactQueryService from "../../../services/reactQuery/reactQuery.service";
import { Post } from "../../../../../shared/interfaces/post.interface";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const { mutate: updatePost, isLoading: isUpdating } = useMutation({
    mutationFn: postService.update,
    onSuccess: (post: Post) => {
      const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
      if (!currentPosts) return;

      //TODO: check if can use service function from reactQuery.service.ts

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

  return { isUpdating, updatePost };
}
