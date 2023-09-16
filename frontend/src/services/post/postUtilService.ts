import {
  AnyPost,
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
  PromotionalPost,
  Repost,
  repliedPostDetails,
} from "../../../../shared/types/post";
import { UserMsg } from "../../../../shared/types/system";
import { createId } from "../util/utilService";

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

function isPostTextValid(text: string): boolean {
  return !!text && text.length > 0 && text.length <= 247;
}

function isPostValid(post: NewPost | null): boolean {
  const isPostPollValid = (post: NewPost): boolean => {
    if (!post.poll) return false;
    return (
      post.poll.options.length >= 2 && post.poll.options.every(option => option.text.length > 0)
    );
  };

  if (!post) return false;
  if (post.poll) return isPostPollValid(post) && isPostTextValid(post.text);
  return (
    isPostTextValid(post.text) ||
    post.imgs?.length > 0 ||
    !!post.gif ||
    !!post.video ||
    !!post.quotedPostId
  );
}

function isPostThreadValid(newPosts: NewPost[]): boolean {
  return newPosts.every(post => isPostValid(post));
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

function getDefaultNewPost(
  repliedPostDetails?: repliedPostDetails[],
  quotedPostId?: string
): NewPost {
  return {
    tempId: createId(),
    text: "",
    audience: "everyone",
    repliersType: "everyone",
    parentPostId: repliedPostDetails?.length ? repliedPostDetails.at(-1)?.postId : undefined,
    repliedPostDetails,
    isPublic: true,
    isPinned: false,
    quotedPostId: quotedPostId,
    imgs: [],
    video: null,
    videoUrl: "",
    gif: null,
    poll: null,
  };
}

function getReply(repliedToPost: Post | null): {
  repliedToPost: Post | null;
  reply: NewPost | null;
} {
  if (!repliedToPost) return { repliedToPost: null, reply: null };
  const {
    createdBy: { id: userId, username },
  } = repliedToPost;

  const currRepliedPostDetails = {
    postId: repliedToPost.id,
    postOwner: { userId, username },
  };

  const repliedPostDetails = repliedToPost.repliedPostDetails?.length
    ? [...repliedToPost.repliedPostDetails, currRepliedPostDetails]
    : [currRepliedPostDetails];

  return {
    repliedToPost: repliedToPost,
    reply: getDefaultNewPost(repliedPostDetails),
  };
}

function getQuote(quotedPost: Post | null): { quotedPost: Post | null; quote: NewPost | null } {
  return quotedPost
    ? {
        quotedPost: quotedPost,
        quote: getDefaultNewPost(undefined, quotedPost.id),
      }
    : {
        quotedPost: null,
        quote: null,
      };
}

export default {
  getPostAddedMsg,
  isPostTextValid,
  isPostValid,
  isPostThreadValid,
  isRepost,
  isPromotionalPost,
  isPost,
  isPostRepostRes,
  isPostReplyRes,
  getDefaultNewPost,
  getReply,
  getQuote,
};
