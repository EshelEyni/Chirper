// import { NewPost, Post, repliedPostDetails } from "../../../../shared/interfaces/post.interface";
// import { makeId } from "../../services/util/utils.service";

// export type NewPostState = {
//   homePage: {
//     posts: NewPost[];
//     currPostIdx: number;
//   };
//   sideBar: {
//     posts: NewPost[];
//     currPostIdx: number;
//   };
//   reply: {
//     repliedToPost: Post | null;
//     reply: NewPost;
//   };
//   quote: {
//     quotedPost: Post | null;
//     quote: NewPost;
//   };
//   newPostType: NewPostType;
// };

// type NewPostsAction = {
//   type: string;
//   repliedToPost: Post;
//   quotedPost: Post;
//   newPosts: NewPost[];
//   newPost: NewPost | null;
//   updatedPost: NewPost;
//   newPostType: NewPostType;
//   currPostIdx: number;
// };

// export enum NewPostType {
//   HomePage = "homePage",
//   SideBar = "sideBar",
//   Reply = "reply",
//   Quote = "quote",
// }

// const getDefaultNewPost = (
//   repliedPostDetails?: repliedPostDetails[],
//   quotedPostId?: string
// ): NewPost => {
//   return {
//     tempId: makeId(),
//     text: "",
//     audience: "everyone",
//     repliersType: "everyone",
//     previousThreadPostId: repliedPostDetails?.length
//       ? repliedPostDetails.at(-1)?.postId
//       : undefined,
//     repliedPostDetails,
//     isPublic: true,
//     quotedPostId: quotedPostId,
//     imgs: [],
//     video: null,
//     videoUrl: "",
//     gif: null,
//     poll: null,
//   };
// };

// const initialState: NewPostState = {
//   homePage: {
//     posts: [getDefaultNewPost()],
//     currPostIdx: 0,
//   },
//   sideBar: {
//     posts: [getDefaultNewPost()],
//     currPostIdx: 0,
//   },
//   reply: {
//     repliedToPost: null,
//     reply: getDefaultNewPost(),
//   },
//   quote: {
//     quotedPost: null,
//     quote: getDefaultNewPost(),
//   },
//   newPostType: NewPostType.HomePage,
// };

// function getReply(repliedToPost: Post): { repliedToPost: Post | null; reply: NewPost } {
//   const {
//     id,
//     createdBy: { id: userId, username },
//   } = repliedToPost;

//   const currRepliedPostDetails = {
//     postId: id,
//     postOwner: { userId, username },
//   };

//   const repliedPostDetails = repliedToPost.repliedPostDetails?.length
//     ? [...repliedToPost.repliedPostDetails, currRepliedPostDetails]
//     : [currRepliedPostDetails];

//   return repliedToPost
//     ? {
//         repliedToPost: repliedToPost,
//         reply: getDefaultNewPost(repliedPostDetails),
//       }
//     : { repliedToPost: null, reply: getDefaultNewPost() };
// }

// function getQuote(quotedPost: Post): { quotedPost: Post | null; quote: NewPost } {
//   return quotedPost
//     ? {
//         quotedPost: quotedPost,
//         quote: getDefaultNewPost(undefined, quotedPost.id),
//       }
//     : {
//         quotedPost: null,
//         quote: getDefaultNewPost(),
//       };
// }

// export function newPostReducer(state = initialState, action: NewPostsAction): NewPostState {
//   switch (action.type) {
//     case "SET_NEW_POST_TYPE": {
//       return { ...state, newPostType: action.newPostType };
//     }
//     case "SET_NEW_POSTS": {
//       const { newPostType } = action;

//       switch (newPostType) {
//         case NewPostType.HomePage:
//           return {
//             ...state,
//             homePage: {
//               posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
//               currPostIdx: 0,
//             },
//           };
//         case NewPostType.SideBar:
//           return {
//             ...state,
//             sideBar: {
//               posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
//               currPostIdx: 0,
//             },
//           };
//         case NewPostType.Reply:
//           return {
//             ...state,
//             reply: getReply(action.repliedToPost),
//           };
//         case NewPostType.Quote:
//           return {
//             ...state,
//             quote: getQuote(action.quotedPost),
//           };
//         default:
//           return state;
//       }
//     }
//     case "SET_NEW_POST": {
//       const { newPost, newPostType } = action;
//       if (newPost === null) return state;
//       const isThreadType =
//         newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
//       if (!isThreadType) return state;
//       return {
//         ...state,
//         [newPostType]: {
//           ...state[newPostType],
//           currPostIdx: state[newPostType].posts.findIndex(p => p.tempId === newPost.tempId),
//         },
//       };
//     }
//     case "ADD_NEW_POST": {
//       const { newPostType } = action;
//       if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return state;

//       return {
//         ...state,
//         [newPostType]: {
//           ...state[newPostType],
//           posts: [...state[newPostType].posts, getDefaultNewPost()],
//           currPostIdx: state[newPostType].posts.length,
//         },
//       };
//     }
//     case "UPDATE_NEW_POST": {
//       const { newPostType } = action;

//       switch (newPostType) {
//         case NewPostType.HomePage:
//           return {
//             ...state,
//             homePage: {
//               ...state.homePage,
//               posts: state.homePage.posts.map(post => {
//                 if (post.tempId === action.updatedPost.tempId) return action.updatedPost;
//                 return post;
//               }),
//             },
//           };
//         case NewPostType.SideBar:
//           return {
//             ...state,
//             sideBar: {
//               ...state.sideBar,
//               posts: state.sideBar.posts.map(post => {
//                 if (post.tempId === action.updatedPost.tempId) return action.updatedPost;
//                 return post;
//               }),
//             },
//           };
//         case NewPostType.Reply:
//           return {
//             ...state,
//             reply: {
//               ...state.reply,
//               reply: action.updatedPost,
//             },
//           };
//         case NewPostType.Quote:
//           return {
//             ...state,
//             quote: {
//               ...state.quote,
//               quote: action.updatedPost,
//             },
//           };
//         default:
//           return state;
//       }
//     }
//     case "REMOVE_NEW_POST": {
//       const { newPostType } = action;
//       if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return state;
//       return {
//         ...state,
//         [newPostType]: {
//           ...state[newPostType],
//           posts: state[newPostType].posts.filter(
//             (_, idx) => state[newPostType].currPostIdx !== idx
//           ),
//           currPostIdx: state[newPostType].currPostIdx - 1 || 0,
//         },
//       };
//     }
//     case "CLEAR_NEW_POSTS": {
//       return { ...initialState };
//     }
//     default:
//       return state;
//   }
// }
