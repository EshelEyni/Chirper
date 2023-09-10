import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../services/post.service";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { getDefaultErrorMsg } from "../services/util/utils.service";
import reactQueryService from "../services/reactQuery/reactQuery.service";
import { Post } from "../../../shared/types/post.interface";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  const { mutate: updatePost, isLoading: isUpdating } = useMutation({
    mutationFn: postService.update,
    onSuccess: (post: Post) => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
    },
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
  });

  return { isUpdating, updatePost };
}