import { describe, beforeEach, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import newPostReducer from "./postEditSlice";
import {
  setNewPostType,
  setNewHomePosts,
  clearNewHomePosts,
  setNewSideBarPosts,
  clearNewSideBarPosts,
  setNewReply,
  clearNewReply,
  setNewQuote,
  clearNewQuote,
  setCurrNewPost,
  addNewPostToThread,
  updateNewPost,
  removeNewPost,
  clearAllNewPosts,
} from "./postEditSlice";
import { NewPostType } from "../../types/Enums";
import postUtilService from "../../services/post/postUtilService";
import testUtilService from "../../../test/service/testService";
import { assertNewPost } from "../../../test/service/testAssertionService";

describe("postEditSlice", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        postEdit: newPostReducer,
      },
    });
  });

  describe("setNewPostType", () => {
    it("should set new post type", () => {
      store.dispatch(setNewPostType(NewPostType.HomePage));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.HomePage);

      store.dispatch(setNewPostType(NewPostType.SideBar));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.SideBar);

      store.dispatch(setNewPostType(NewPostType.Reply));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.Reply);

      store.dispatch(setNewPostType(NewPostType.Quote));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.Quote);
    });
  });

  describe("setNewHomePosts", () => {
    it("should set new posts", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      expect(store.getState().postEdit.homePage.posts).toEqual(newPosts);
    });

    it("should set new post type to home page", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.HomePage);
    });

    it("should set curr post idx to 0", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      expect(store.getState().postEdit.homePage.currPostIdx).toBe(0);
    });
  });

  describe("clearNewHomePosts", () => {
    it("should clear new posts", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(clearNewHomePosts());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(1);
      const [post] = store.getState().postEdit.homePage.posts;
      assertNewPost(post);
    });

    it("should clear curr post idx", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(clearNewHomePosts());
      expect(store.getState().postEdit.homePage.currPostIdx).toBe(0);
    });
  });

  describe("setNewSideBarPosts", () => {
    it("should set new posts", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      expect(store.getState().postEdit.sideBar.posts).toEqual(newPosts);
    });

    it("should set new post type to side bar", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.SideBar);
    });

    it("should set curr post idx to 0", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      expect(store.getState().postEdit.sideBar.currPostIdx).toBe(0);
    });
  });

  describe("clearNewSideBarPosts", () => {
    it("should clear new posts", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      store.dispatch(clearNewSideBarPosts());
      expect(store.getState().postEdit.sideBar.posts).toHaveLength(1);
      const [post] = store.getState().postEdit.sideBar.posts;
      assertNewPost(post);
    });

    it("should clear curr post idx", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      store.dispatch(clearNewSideBarPosts());
      expect(store.getState().postEdit.sideBar.currPostIdx).toBe(0);
    });
  });

  describe("setNewReply", () => {
    it("should set replied to post", () => {
      const repliedToPost = testUtilService.createTestPost();
      store.dispatch(setNewReply({ repliedToPost }));
      expect(store.getState().postEdit.reply.repliedToPost).toEqual(repliedToPost);
    });

    it("should set reply", () => {
      const repliedToPost = testUtilService.createTestPost();
      store.dispatch(setNewReply({ repliedToPost }));
      const { reply } = store.getState().postEdit.reply;
      assertNewPost(reply);
    });

    it("should set new post type to reply", () => {
      const repliedToPost = testUtilService.createTestPost();
      store.dispatch(setNewReply({ repliedToPost }));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.Reply);
    });
  });

  describe("clearNewReply", () => {
    it("should clear replied to post", () => {
      const repliedToPost = testUtilService.createTestPost();
      store.dispatch(setNewReply({ repliedToPost }));
      store.dispatch(clearNewReply());
      expect(store.getState().postEdit.reply.repliedToPost).toBeNull();
    });

    it("should clear reply", () => {
      const repliedToPost = testUtilService.createTestPost();
      store.dispatch(setNewReply({ repliedToPost }));
      store.dispatch(clearNewReply());
      expect(store.getState().postEdit.reply.reply).toBeNull();
    });
  });

  describe("setNewQuote", () => {
    it("should set quoted post", () => {
      const quotedPost = testUtilService.createTestPost();
      store.dispatch(setNewQuote({ quotedPost }));
      expect(store.getState().postEdit.quote.quotedPost).toEqual(quotedPost);
    });

    it("should set quote", () => {
      const quotedPost = testUtilService.createTestPost();
      store.dispatch(setNewQuote({ quotedPost }));
      const { quote } = store.getState().postEdit.quote;
      assertNewPost(quote);
    });

    it("should set new post type to quote", () => {
      const quotedPost = testUtilService.createTestPost();
      store.dispatch(setNewQuote({ quotedPost }));
      expect(store.getState().postEdit.newPostType).toBe(NewPostType.Quote);
    });
  });

  describe("clearNewQuote", () => {
    it("should clear quoted post", () => {
      const quotedPost = testUtilService.createTestPost();
      store.dispatch(setNewQuote({ quotedPost }));
      store.dispatch(clearNewQuote());
      expect(store.getState().postEdit.quote.quotedPost).toBeNull();
    });

    it("should clear quote", () => {
      const quotedPost = testUtilService.createTestPost();
      store.dispatch(setNewQuote({ quotedPost }));
      store.dispatch(clearNewQuote());
      expect(store.getState().postEdit.quote.quote).toBeNull();
    });
  });

  describe("setCurrNewPost", () => {
    it("should set curr post idx when NewPostType is HomePage", () => {
      const newPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(setCurrNewPost({ newPost: newPosts[4] }));

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.HomePage);
      expect(state.homePage.currPostIdx).toBe(4);
    });

    it("should set curr post idx when NewPostType is SideBar", () => {
      const newPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      store.dispatch(setCurrNewPost({ newPost: newPosts[4] }));

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.SideBar);
      expect(state.sideBar.currPostIdx).toBe(4);
    });

    it("should early return when NewPostType is Reply or Quote", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(setNewPostType(NewPostType.Reply));
      store.dispatch(setCurrNewPost({ newPost: newPosts[1] }));
      expect(store.getState().postEdit.homePage.currPostIdx).toBe(0);

      store.dispatch(setNewPostType(NewPostType.Quote));
      store.dispatch(setCurrNewPost({ newPost: newPosts[1] }));
      expect(store.getState().postEdit.homePage.currPostIdx).toBe(0);

      store.dispatch(setNewPostType(NewPostType.HomePage));
      store.dispatch(setCurrNewPost({ newPost: newPosts[1] }));
      expect(store.getState().postEdit.homePage.currPostIdx).toBe(1);
    });
  });

  describe("addNewPostToThread", () => {
    it("should add new post to thread when NewPostType is HomePage", () => {
      const newPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(addNewPostToThread());

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.HomePage);
      expect(state.homePage.posts).toHaveLength(6);
      expect(state.homePage.currPostIdx).toBe(5);
    });

    it("should add new post to thread when NewPostType is SideBar", () => {
      const newPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      store.dispatch(addNewPostToThread());

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.SideBar);
      expect(state.sideBar.posts).toHaveLength(6);
      expect(state.sideBar.currPostIdx).toBe(5);
    });

    it("should early return when NewPostType is Reply or Quote", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(setNewPostType(NewPostType.Reply));
      store.dispatch(addNewPostToThread());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(2);

      store.dispatch(setNewPostType(NewPostType.Quote));
      store.dispatch(addNewPostToThread());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(2);

      store.dispatch(setNewPostType(NewPostType.HomePage));
      store.dispatch(addNewPostToThread());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(3);
    });
  });

  describe("updateNewPost", () => {
    const UPDATED_TEXT = "updated text";

    it("should update new post when NewPostType is HomePage", () => {
      const newPosts = [postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));

      const newPost = { ...newPosts[0], text: UPDATED_TEXT };
      store.dispatch(updateNewPost({ newPost }));

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.HomePage);
      expect(state.homePage.posts[0].text).toEqual(UPDATED_TEXT);
    });

    it("should update new post when NewPostType is SideBar", () => {
      const newPosts = [postUtilService.getDefaultNewPost()];

      store.dispatch(setNewSideBarPosts({ newPosts }));
      const newPost = { ...newPosts[0], text: UPDATED_TEXT };
      store.dispatch(updateNewPost({ newPost }));

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.SideBar);
      expect(state.sideBar.posts[0].text).toEqual(UPDATED_TEXT);
    });

    it("should update new post when NewPostType is Reply", () => {
      const repliedToPost = testUtilService.createTestPost();
      store.dispatch(setNewReply({ repliedToPost }));

      // can update the reply directly with a new post, because there is no need for tempId comparison
      const newPost = postUtilService.getDefaultNewPost();
      store.dispatch(updateNewPost({ newPost }));

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.Reply);
      expect(state.reply.reply).toEqual(newPost);
    });

    it("should update new post when NewPostType is Quote", () => {
      const quotedPost = testUtilService.createTestPost();
      store.dispatch(setNewQuote({ quotedPost }));
      const newPost = postUtilService.getDefaultNewPost();
      store.dispatch(updateNewPost({ newPost }));

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.Quote);
      expect(state.quote.quote).toEqual(newPost);
    });
  });

  describe("removeNewPost", () => {
    it("should remove curr new post when NewPostType is HomePage", () => {
      const newPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(setCurrNewPost({ newPost: newPosts[2] }));
      store.dispatch(removeNewPost());

      const state = store.getState().postEdit;

      expect(state.newPostType).toBe(NewPostType.HomePage);
      expect(state.homePage.posts).toHaveLength(2);
      expect(state.homePage.posts[0].tempId).toEqual(newPosts[0].tempId);
      expect(state.homePage.posts[1].tempId).toEqual(newPosts[1].tempId);
    });

    it("should remove curr new post when NewPostType is SideBar", () => {
      const newPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewSideBarPosts({ newPosts }));
      store.dispatch(setCurrNewPost({ newPost: newPosts[2] }));
      store.dispatch(removeNewPost());

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.SideBar);
      expect(state.sideBar.posts).toHaveLength(2);
      expect(state.sideBar.posts[0].tempId).toEqual(newPosts[0].tempId);
      expect(state.sideBar.posts[1].tempId).toEqual(newPosts[1].tempId);
    });

    it("should early return when curr post is the only post", () => {
      const newPosts = [postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(removeNewPost());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(1);
    });

    it("should early return when NewPostType is Reply or Quote", () => {
      const newPosts = [postUtilService.getDefaultNewPost(), postUtilService.getDefaultNewPost()];
      store.dispatch(setNewHomePosts({ newPosts }));
      store.dispatch(setNewPostType(NewPostType.Reply));
      store.dispatch(removeNewPost());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(2);

      store.dispatch(setNewPostType(NewPostType.Quote));
      store.dispatch(removeNewPost());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(2);

      store.dispatch(setNewPostType(NewPostType.HomePage));
      store.dispatch(removeNewPost());
      expect(store.getState().postEdit.homePage.posts).toHaveLength(1);
    });
  });

  describe("clearAllNewPosts", () => {
    it("should set the state to the initial state", () => {
      const homeNewPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];
      store.dispatch(setNewHomePosts({ newPosts: homeNewPosts }));
      store.dispatch(setCurrNewPost({ newPost: homeNewPosts[2] }));

      const sideBarNewPosts = [
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
        postUtilService.getDefaultNewPost(),
      ];

      store.dispatch(setNewSideBarPosts({ newPosts: sideBarNewPosts }));
      store.dispatch(setCurrNewPost({ newPost: sideBarNewPosts[2] }));

      store.dispatch(setNewReply({ repliedToPost: testUtilService.createTestPost() }));
      store.dispatch(setNewQuote({ quotedPost: testUtilService.createTestPost() }));

      store.dispatch(clearAllNewPosts());

      const state = store.getState().postEdit;
      expect(state.newPostType).toBe(NewPostType.HomePage);
      expect(state.homePage.posts).toHaveLength(1);
      const [post] = state.homePage.posts;
      assertNewPost(post);
      expect(state.homePage.currPostIdx).toBe(0);

      expect(state.sideBar.posts).toHaveLength(1);
      const [post2] = state.sideBar.posts;
      assertNewPost(post2);
      expect(state.sideBar.currPostIdx).toBe(0);

      expect(state.reply.repliedToPost).toBeNull();
      expect(state.reply.reply).toBeNull();

      expect(state.quote.quotedPost).toBeNull();
      expect(state.quote.quote).toBeNull();
    });
  });
});
