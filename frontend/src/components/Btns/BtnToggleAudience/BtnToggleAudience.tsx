import { FC } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { GoGlobe } from "react-icons/go";
import { ReactComponent as ChirperCircleIcon } from "../../../assets/svg/chirper-circle-solid.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { Modal } from "../../Modal/Modal";
import { PostEditOption } from "../../Modal/PostEditOption/PostEditOption";

export const BtnToggleAudience: FC = () => {
  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const dispatch: AppDispatch = useDispatch();

  const { currNewPost } = usePostEdit();
  if (!currNewPost) return null;
  const { audience } = currNewPost;
  const title = getTitle(audience);

  function getTitle(value: string) {
    switch (value) {
      case "everyone":
        return "Everyone";
      case "chirper-circle":
        return "Chirper Circle";
      default:
        return "Everyone";
    }
  }

  function onOptionClick(option: string) {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, audience: option }, newPostType }));
  }

  return (
    <div className="btn-toggle-audience-cotnainer">
      <Modal>
        <Modal.OpenBtn modalName="audience" setPositionByRef={true} modalHeight={200}>
          <button className="btn-toggle-audience">
            <span>{title}</span>
            <IoChevronDownOutline />
          </button>
        </Modal.OpenBtn>
        <Modal.Window
          name="audience"
          className="post-edit-option"
          mainScreenMode="transparent"
          mainScreenZIndex={1000}
        >
          <h1 className="post-edit-option-title">Choose audience</h1>
          <Modal.CloseBtn onClickFn={() => onOptionClick("everyone")}>
            <div>
              <PostEditOption
                title="Everyone"
                icon={<GoGlobe />}
                isSelected={audience === "everyone"}
              />
            </div>
          </Modal.CloseBtn>
          <Modal.CloseBtn onClickFn={() => onOptionClick("chirper-circle")}>
            <div>
              <PostEditOption
                title="Chirper Circle"
                icon={<ChirperCircleIcon />}
                isSelected={audience === "chirper-circle"}
              />
            </div>
          </Modal.CloseBtn>
        </Modal.Window>
      </Modal>
    </div>
  );
};
