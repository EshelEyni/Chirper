import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { setNewPostType, setNewPosts } from "../../../store/actions/new-post.actions";
import { RootState } from "../../../store/store";
import { postService } from "../../../services/post.service";
import { PostEdit } from "../../../components/Post/PostEdit/PostEdit";
import { SavePostDraftModal } from "../../../components/Modals/SavePostDraftModal/SavePostDraftModal";
import { ConfirmDeletePostDraftModal } from "../../../components/Modals/ConfirmDeletePostDraftModal/ConfirmDeletePostDraftModal";
import "./Compose.scss";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";
import { getBasePathName } from "../../../services/util/utils.service";
import { Modal } from "../../../components/Modals/Modal/Modal";

export const ComposePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    const basePath = getBasePathName(location.pathname);
    navigate(basePath);
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
      <MainScreen onClickFn={onOpenModal} mode="light" zIndex={2000} />
      <PostEdit onClickBtnClose={onOpenModal} isHomePage={false} />
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
