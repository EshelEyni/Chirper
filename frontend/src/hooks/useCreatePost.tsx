import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postApiService from "../services/postApi/postApiService";
import postUtilService from "../services/postUtil/postUtilService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import { NewPost, Post, PostReplyResult } from "../../../shared/types/post";
import { NewPostType } from "../store/slices/postEditSlice";
import { UserMsg as TypeOfUserMsg } from "../../../shared/types/system";
import { getDefaultErrorMsg } from "../services/util/utilService";

type OnCreatePostProps = {
  posts: NewPost[];
  type: NewPostType;
};

type useCreatePostProps = {
  onSuccessFn?: () => void;
};

export function useCreatePost({ onSuccessFn }: useCreatePostProps = {}) {
  const queryClient = useQueryClient();

  async function onCreatePost({ posts, type }: OnCreatePostProps) {
    switch (type) {
      case NewPostType.Quote:
        return await postApiService.addQuote(posts[0]);
      case NewPostType.Reply:
        return await postApiService.addReply(posts[0]);
      default:
        return await postApiService.add(posts);
    }
  }

  function getMessage(data: Post | PostReplyResult): TypeOfUserMsg {
    const postId = postUtilService.isPostReplyRes(data) ? data.reply.id : data.id;
    const isAddedToSchedule = "schedule" in data;
    return postUtilService.getPostAddedMsg({
      postId: postId,
      date: isAddedToSchedule ? data.schedule : undefined,
    });
  }

  const { mutate: createPost, isLoading: isCreating } = useMutation({
    mutationFn: onCreatePost,
    onSuccess: data => {
      const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
      const addedPost = postUtilService.isPostRepostRes(data)
        ? data.repost
        : postUtilService.isPostReplyRes(data)
        ? data.reply
        : data;
      const updatedPosts = [addedPost, ...currentPosts];
      queryClient.setQueryData(["posts"], updatedPosts);
      if (onSuccessFn) onSuccessFn();

      if (postUtilService.isPostRepostRes(data)) return;

      const msg = getMessage(data);
      toast.success(t => <UserMsg userMsg={msg} onDissmisToast={() => toast.dismiss(t.id)} />);
    },
    onError: () => {
      toast.error(t => (
        <UserMsg userMsg={getDefaultErrorMsg()} onDissmisToast={() => toast.dismiss(t.id)} />
      ));
    },
  });

  return { isCreating, createPost };
}
