import { useNavigate } from "react-router-dom";
import { PostEdit } from "../../components/post/post-edit";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setNewPostType, setNewPosts } from "../../store/actions/new-post.actions";
import { RootState } from "../../store/store";
import { useState } from "react";
import { SavePostDraftModal } from "../../components/modals/save-post-draft-modal";
import { ConfirmDeletePostDraftModal } from "../../components/modals/confirm-delete-post-draft-modal";
import { postService } from "../../services/post.service";

export const ComposePage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { sideBar, homePage, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const [isSavePostDraftModalOpen, setIsSavePostDraftModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  const discardPostThread = async () => {
    if (newPostType === "side-bar") {
      await dispatch(setNewPosts([], "side-bar"));
      await dispatch(setNewPostType("home-page"));
    } else {
      await dispatch(setNewPosts([], "home-page"));
      await dispatch(setNewPostType("home-page"));
    }
    navigate(-1);
  };

  const onSavePostDraft = async () => {
    const postToSave =
      newPostType === "home-page" ? { ...homePage.posts[0] } : { ...sideBar.posts[0] };
    if (!postToSave) return;
    postToSave.isDraft = true;
    await postService.add([postToSave]);
    discardPostThread();
  };

  const onOpenModal = async () => {
    if (homePage.posts.length > 1 || sideBar.posts.length > 1) {
      setIsConfirmDeleteModalOpen(true);
    } else {
      const currPost =
        newPostType === "home-page" ? { ...homePage.posts[0] } : { ...sideBar.posts[0] };
      if (currPost.text || currPost.imgs.length > 0 || currPost.video || currPost.gif) {
        setIsSavePostDraftModalOpen(true);
      } else {
        discardPostThread();
      }
    }
  };

  const onCloseModal = () => {
    if (isSavePostDraftModalOpen) setIsSavePostDraftModalOpen(false);
    if (isConfirmDeleteModalOpen) setIsConfirmDeleteModalOpen(false);
  };

  return (
    <main className="compose">
      <div className="main-screen dark-light" style={{ zIndex: 2000 }} onClick={onOpenModal} />
      <PostEdit onClickBtnClose={onOpenModal} />
      {isSavePostDraftModalOpen && (
        <SavePostDraftModal
          onCloseModal={onCloseModal}
          onSavePostDraft={onSavePostDraft}
          discardPostThread={discardPostThread}
        />
      )}
      {isConfirmDeleteModalOpen && (
        <ConfirmDeletePostDraftModal
          onCloseModal={onCloseModal}
          discardPostThread={discardPostThread}
        />
      )}
    </main>
  );
};
