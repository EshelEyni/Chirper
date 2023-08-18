import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import postService from "../../services/post.service";
import { UserMsg } from "../../components/Msg/UserMsg/UserMsg";

type useCreatePostProps = {
  onSuccessFn?: () => void;
};

export function useCreatePost({ onSuccessFn }: useCreatePostProps = {}) {
  const queryClient = useQueryClient();

  const { mutate: createPost, isLoading: isCreating } = useMutation({
    mutationFn: postService.add,
    onSuccess: data => {
      const msg = postService.getPostAddedMsg({
        postId: data.id,
        date: data.schedule,
      });
      toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (onSuccessFn) onSuccessFn();
    },
    onError: err => {
      const errMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMessage);
    },
  });

  return { isCreating, createPost };
}
