import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../services/postService";
import reactQueryService from "../services/reactQuery/reactQueryService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../shared/types/system";
import { getDefaultErrorMsg } from "../services/util/utilService";

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
        link: { url: `/bookmarks` },
      } as TypeOfUserMsg;

      toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
  });

  return { isRemoving, removeBookmark };
}
