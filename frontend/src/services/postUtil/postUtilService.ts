import {
  AnyPost,
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
  PromotionalPost,
  Repost,
} from "../../../../shared/types/post";
import { UserMsg } from "../../../../shared/types/system";

type Data = Post | PostReplyResult | PostRepostResult;

const getPostAddedMsg = ({ postId, date }: { postId: string; date?: Date }): UserMsg => {
  let text = "Your Chirp has been sent!";

  if (date) {
    const dateStr = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date);

    text = `Your Chirp will be sent on ${dateStr}`;
  }

  return {
    type: "info",
    text,
    link: { url: `/post/${postId}` },
  };
};

/*  
  newPostText is the text of the new post from the textarea, that has own state,
  due to the fact that we don't want to dispatch to redux store on every keystroke
  */

function checkPostValidity(post: NewPost | null, newPostText: string): boolean {
  const checkPostTextValidity = (text: string): boolean =>
    !!text && text.length > 0 && text.length <= 247;

  const checkPostPollValidity = (post: NewPost): boolean =>
    post.poll!.options.every(option => option.text.length > 0);

  if (!post) return false;
  if (post.poll) return checkPostPollValidity(post) && checkPostTextValidity(newPostText);
  return (
    checkPostTextValidity(newPostText) ||
    post.imgs.length > 0 ||
    !!post.gif ||
    !!post.video ||
    !!post.quotedPostId
  );
}

function checkPostArrayValidity(newPosts: NewPost[], newPostText: string): boolean {
  return newPosts.every(post => checkPostValidity(post, newPostText));
}

function isPost(post: AnyPost): post is Post {
  return "createdBy" in post;
}

function isRepost(post: AnyPost): post is Repost {
  return "repostedBy" in post;
}
function isPromotionalPost(post: AnyPost): post is PromotionalPost {
  return "companyName" in post;
}

function isPostRepostRes(data: Data): data is PostRepostResult {
  return "updatedPost" in data && "repost" in data;
}

function isPostReplyRes(data: Data): data is PostReplyResult {
  return "updatedPost" in data && "reply" in data;
}

export default {
  getPostAddedMsg,
  checkPostValidity,
  checkPostArrayValidity,
  isRepost,
  isPromotionalPost,
  isPost,
  isPostRepostRes,
  isPostReplyRes,
};
