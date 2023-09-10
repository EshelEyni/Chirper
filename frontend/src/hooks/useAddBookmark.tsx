import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../services/post.service";
import reactQueryService from "../services/reactQuery/reactQuery.service";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../shared/types/system.interface";
import { getDefaultErrorMsg } from "../services/util/utils.service";

export function useAddBookmark() {
  const queryClient = useQueryClient();

  async function onAddBookmark(postId: string) {
    postService.updatePostStats(postId, { isPostBookmarked: true });
    return await postService.addBookmark(postId);
  }

  const { mutate: addBookmark, isLoading: isAdding } = useMutation({
    mutationFn: onAddBookmark,
    onSuccess: post => {
      reactQueryService.setUpdatePostIntoQueryData(post, queryClient);

      const msg = {
        type: "info",
        text: "Chirp added to your Bookmarks",
        link: { url: `/bookmarks` },
      } as TypeOfUserMsg;

      toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
    onError: () => {
      const msg = getDefaultErrorMsg();
      toast.error(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
  });

  return { isAdding, addBookmark };
}
