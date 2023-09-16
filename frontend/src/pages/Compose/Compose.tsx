import { useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import postApiService from "../../services/post/postApiService";
import "./Compose.scss";
import { MainScreen } from "../../components/App/MainScreen/MainScreen";
import { PostEditProvider } from "../../contexts/PostEditContext";
import { SpinnerLoader } from "../../components/Loaders/SpinnerLoader/SpinnerLoader";
import {
  clearNewHomePosts,
  clearAllNewPosts,
  clearNewQuote,
  clearNewReply,
  clearNewSideBarPosts,
  setNewPostType,
} from "../../store/slices/postEditSlice";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useGoBack } from "../../hooks/useGoBack";
import { Modal } from "../../components/Modal/Modal";
import postUtilService from "../../services/post/postUtilService";
import { AppDispatch, RootState } from "../../types/app";
import { NewPostType } from "../../types/Enums";
const PostEdit = lazy(() => import("../../components/Post/PostEdit/PostEdit"));

const ComposePage = () => {
  const [openedModalName, setOpenedModalName] = useState("");

  const dispatch: AppDispatch = useDispatch();
  const { postEdit } = useSelector((state: RootState) => state);
  const { newPostType } = postEdit;
  const { goBack } = useGoBack("compose");
  const { outsideClickRef } = useOutsideClick<HTMLDivElement>(onClickBtnClose);

  function onGoBack() {
    goBack();
  }

  async function discardPostThreadAndGoBack() {
    await discardPostThread();
    onGoBack();
  }

  async function discardPostThread() {
    switch (newPostType) {
      case NewPostType.HomePage:
        dispatch(clearNewHomePosts());
        break;
      case NewPostType.SideBar:
        dispatch(clearNewSideBarPosts());
        break;
      case NewPostType.Reply:
        dispatch(clearNewReply());
        break;
      case NewPostType.Quote:
        dispatch(clearNewQuote());
        break;
      default:
        dispatch(clearAllNewPosts());
        break;
    }
    dispatch(setNewPostType(NewPostType.HomePage));
  }

  async function onSavePostDraft() {
    const isThreadType =
      newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
    if (!isThreadType) return discardPostThreadAndGoBack();
    const postToSave = postEdit[newPostType].posts[0];
    if (!postToSave) return;
    postToSave.isDraft = true;
    await postApiService.add([postToSave]);
    discardPostThreadAndGoBack();
  }

  async function onClickBtnClose() {
    const isThreadType =
      newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
    if (!isThreadType) return discardPostThreadAndGoBack();

    const isThread = isThreadType ? postEdit[newPostType].posts.length > 1 : false;
    if (isThread) return setOpenedModalName("confirm-delete-msg");

    const currPost = postEdit[newPostType].posts[0];
    if (postUtilService.isPostValid(currPost)) return setOpenedModalName("save-post-draft");

    discardPostThreadAndGoBack();
  }

  return (
    <main className="compose" id="compose">
      <MainScreen mode="light" zIndex={2000} />
      <div ref={outsideClickRef}>
        <PostEditProvider>
          <Suspense fallback={<SpinnerLoader />}>
            <PostEdit onClickBtnClose={onClickBtnClose} isHomePage={false} />
          </Suspense>
        </PostEditProvider>
      </div>
      <Modal
        externalStateControl={{
          openedModalName: openedModalName,
          setOpenedModalName: setOpenedModalName,
        }}
        onClose={discardPostThreadAndGoBack}
      >
        <Modal.Window name="save-post-draft" mainScreenMode="dark" mainScreenZIndex={3000}>
          <div className="modal-header">
            <span className="modal-title">Save Chirp?</span>
            <p className="modal-description">You can save this to send later from your drafts.</p>
          </div>

          <div className="modal-btns-container">
            <button className="btn btn-save-post-draft" onClick={onSavePostDraft}>
              <span>Save</span>
            </button>
            <Modal.CloseBtn>
              <button className="btn btn-close-modal">
                <span>Discard</span>
              </button>
            </Modal.CloseBtn>
          </div>
        </Modal.Window>

        <Modal.Window name="confirm-delete-msg" mainScreenMode="dark" mainScreenZIndex={3000}>
          <div className="modal-header">
            <span className="modal-title">Discard thread?</span>
            <p className="modal-description">This can’t be undone and you’ll lose your draft.</p>
          </div>

          <div className="modal-btns-container">
            <button className="btn btn-delete" onClick={discardPostThreadAndGoBack}>
              <span>Discard</span>
            </button>
            <Modal.CloseBtn>
              <button className="btn btn-close-modal">
                <span>Cancel</span>
              </button>
            </Modal.CloseBtn>
          </div>
        </Modal.Window>
      </Modal>
    </main>
  );
};

export default ComposePage;
