import { useState, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import postService from "../../../services/post.service";
import { SavePostDraftModal } from "../../../components/Modals/SavePostDraftModal/SavePostDraftModal";
import { ConfirmDeletePostDraftModal } from "../../../components/Modals/ConfirmDeletePostDraftModal/ConfirmDeletePostDraftModal";
import "./Compose.scss";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";
import { getBasePathName } from "../../../services/util/utils.service";
import { PostEditProvider } from "../../../contexts/PostEditContext";
import { SpinnerLoader } from "../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import {
  NewPostType,
  setNewPost,
  setNewPostType,
  setNewPosts,
} from "../../../store/slices/postEditSlice";
const PostEdit = lazy(() => import("../../../components/Post/PostEdit/PostEdit"));

const ComposePage = () => {
  const [isSavePostDraftModalOpen, setIsSavePostDraftModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const { sideBar, homePage, newPostType } = useSelector((state: RootState) => state.postEdit);

  async function discardPostThread() {
    switch (newPostType) {
      case NewPostType.HomePage:
        dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.HomePage }));
        break;
      case NewPostType.SideBar:
        dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.SideBar }));
        break;
      case NewPostType.Reply:
        dispatch(setNewPost({ newPost: null, newPostType: NewPostType.Reply }));
        break;
      case NewPostType.Quote:
        dispatch(setNewPost({ newPost: null, newPostType: NewPostType.Quote }));
        break;
      default:
        dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.HomePage }));
        break;
    }
    dispatch(setNewPostType(NewPostType.HomePage));
    const basePath = getBasePathName(location.pathname, "compose");
    navigate(basePath);
  }

  async function onSavePostDraft() {
    const postToSave =
      newPostType === "homePage" ? { ...homePage.posts[0] } : { ...sideBar.posts[0] };
    if (!postToSave) return;
    postToSave.isDraft = true;
    await postService.add([postToSave]);
    discardPostThread();
  }

  async function onGoBack() {
    const isThread = homePage.posts.length > 1 || sideBar.posts.length > 1;
    if (isThread) {
      setIsConfirmDeleteModalOpen(true);
    } else {
      const currPost =
        newPostType === "homePage" ? { ...homePage.posts[0] } : { ...sideBar.posts[0] };
      const isValidPost =
        currPost.text || currPost.imgs.length > 0 || currPost.video || currPost.gif;
      if (isValidPost) setIsSavePostDraftModalOpen(true);
      else discardPostThread();
    }
  }

  function onCloseModal() {
    if (isSavePostDraftModalOpen) setIsSavePostDraftModalOpen(false);
    if (isConfirmDeleteModalOpen) setIsConfirmDeleteModalOpen(false);
  }

  return (
    <main className="compose">
      <MainScreen onClickFn={onGoBack} mode="light" zIndex={2000} />
      <PostEditProvider>
        <Suspense fallback={<SpinnerLoader />}>
          <PostEdit onClickBtnClose={onGoBack} isHomePage={false} />
        </Suspense>
      </PostEditProvider>
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

export default ComposePage;
