import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import postService from "../services/postService";
import { UserMsg } from "../components/Msg/UserMsg/UserMsg";
import {
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
} from "../../../shared/types/post";
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

type Data = Post | PostReplyResult | PostRepostResult;

export function useCreatePost({ onSuccessFn }: useCreatePostProps = {}) {
  const queryClient = useQueryClient();

  async function onCreatePost({ posts, type }: OnCreatePostProps) {
    switch (type) {
      case NewPostType.Quote:
        return await postService.addQuote(posts[0]);
      case NewPostType.Reply:
        return await postService.addReply(posts[0]);
      default:
        return await postService.add(posts);
    }
  }

  function getMessage(data: Post | PostReplyResult): TypeOfUserMsg {
    const postId = isReply(data) ? data.reply.id : data.id;
    const isAddedToSchedule = "schedule" in data;
    return postService.getPostAddedMsg({
      postId: postId,
      date: isAddedToSchedule ? data.schedule : undefined,
    });
  }

  function isRepost(data: Data): data is PostRepostResult {
    return "updatedPost" in data && "repost" in data;
  }

  function isReply(data: Data): data is PostReplyResult {
    return "updatedPost" in data && "reply" in data;
  }

  const { mutate: createPost, isLoading: isCreating } = useMutation({
    mutationFn: onCreatePost,
    onSuccess: data => {
      const currentPosts = queryClient.getQueryData(["posts"]) as unknown as Post[];
      const addedPost = isRepost(data) ? data.repost : isReply(data) ? data.reply : data;
      const updatedPosts = [addedPost, ...currentPosts];
      queryClient.setQueryData(["posts"], updatedPosts);
      if (onSuccessFn) onSuccessFn();

      if (isRepost(data)) return;

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
