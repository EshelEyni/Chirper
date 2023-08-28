import { FC } from "react";
import { FaAt, FaGlobeAmericas, FaUserCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { Modal } from "../../Modal/Modal";
import { PostEditOption } from "../../Modal/PostEditOption/PostEditOption";

export const BtnToggleRepliers: FC = () => {
  const { currNewPost } = usePostEdit();
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  if (!currNewPost) return null;
  const { repliersType } = currNewPost;

  const title = getTitle(repliersType);

  function getTitle(value: string) {
    switch (value) {
      case "everyone":
        return "Everyone";
      case "followed":
        return "Only people you follow";
      case "mentioned":
        return "Only people you mentioned";
      default:
        return "Everyone";
    }
  }

  function onOptionClick(value: string) {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, repliersType: value }, newPostType }));
  }

  return (
    <div className="btn-toggle-repliers-container">
      <Modal>
        <Modal.OpenBtn modalName="repliers" setPositionByRef={true} modalHeight={200}>
          <button className="btn-toggle-repliers">
            <FaGlobeAmericas />
            <span>{title}</span>
            can reply
          </button>
        </Modal.OpenBtn>
        <Modal.Window
          name="repliers"
          className="post-edit-option repliers"
          mainScreenMode="transparent"
          mainScreenZIndex={1000}
        >
          <h1 className="post-edit-option-title">Choose who can reply</h1>

          <Modal.CloseBtn onClickFn={() => onOptionClick("everyone")}>
            <div>
              <PostEditOption
                title={"Everyone"}
                icon={<FaGlobeAmericas />}
                isSelected={repliersType === "everyone"}
              />
            </div>
          </Modal.CloseBtn>
          <Modal.CloseBtn onClickFn={() => onOptionClick("followed")}>
            <div>
              <PostEditOption
                title={"Only people you follow"}
                icon={<FaUserCheck />}
                isSelected={repliersType === "followed"}
              />
            </div>
          </Modal.CloseBtn>
          <Modal.CloseBtn onClickFn={() => onOptionClick("mentioned")}>
            <div>
              <PostEditOption
                title={"Only people you mentioned"}
                icon={<FaAt />}
                isSelected={repliersType === "mentioned"}
              />
            </div>
          </Modal.CloseBtn>
        </Modal.Window>
      </Modal>
    </div>
  );
};
