import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../../services/post.service";
import reactQueryService from "../../services/reactQuery/reactQuery.service";
import { UserMsg } from "../../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../shared/interfaces/system.interface";

export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  async function onRemoveBookmark(postId: string) {
    postService.updatePostStats(postId, { isPostBookmarked: false });
    return await postService.removeBookmark(postId);
  }

  const { mutate: removeBookmark, isLoading: isRemoving } = useMutation({
    mutationFn: onRemoveBookmark,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);
      const msg = {
        type: "info",
        text: "Chirp removed from your Bookmarks",
        link: "/bookmarks",
      } as TypeOfUserMsg;

      toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
    },
    onError: err => {
      const errMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMessage);
    },
  });

  return { isRemoving, removeBookmark };
}
