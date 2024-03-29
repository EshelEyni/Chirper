import { FC } from "react";
import { FaAt, FaGlobeAmericas, FaUserCheck } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { Modal } from "../../Modal/Modal";
import { PostEditOption } from "../../Modal/PostEditOption";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { AppDispatch } from "../../../types/app";

export const BtnRepliers: FC = () => {
  const { currNewPost } = usePostEdit();
  const dispatch: AppDispatch = useDispatch();

  if (!currNewPost) return null;
  const repliersType = currNewPost?.repliersType || "everyone";

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
    dispatch(updateNewPost({ newPost: { ...currNewPost, repliersType: value } }));
  }

  return (
    <div className="btn-toggle-repliers-container">
      <Modal>
        <Modal.OpenBtn modalName="repliers" setPositionByRef={true} modalHeight={300}>
          <button className="btn-toggle-repliers">
            <FaGlobeAmericas />
            <span>{title} can reply</span>
          </button>
        </Modal.OpenBtn>
        <Modal.Window
          name="repliers"
          className="post-edit-option repliers"
          mainScreenMode="transparent"
          mainScreenZIndex={1000}
        >
          <h1 className="post-edit-option-title">Choose who can reply</h1>

          <p className="post-edit-option-desc">
            Choose who can reply to this post. Anyone mentioned can always reply.
          </p>

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
