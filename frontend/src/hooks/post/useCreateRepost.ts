import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../services/post.service";
import { Post, PostRepostResult } from "../../../../shared/interfaces/post.interface";

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
          if (p.id === data.updatedPost.id) return data.updatedPost;
          return p;
        }),
      ];
      queryClient.setQueryData(["posts"], updatedPosts);
    },
    onError: err => {
      const errMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMessage);
    },
  });

  return { isCreating, addRepost };
}
