import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../../services/post.service";
import { Post, PostRepostResult } from "../../../../../shared/interfaces/post.interface";
import { UserMsg } from "../../../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";

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
    onError: () => {
      const msg = {
        type: "error",
        text: "Something went wrong, but don’t fret — let’s give it another shot.",
      } as TypeOfUserMsg;
      toast.error(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
    },
  });

  return { isCreating, addRepost };
}
