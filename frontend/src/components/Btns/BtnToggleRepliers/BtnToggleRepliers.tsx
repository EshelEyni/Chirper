import { FC } from "react";
import { FaAt, FaGlobeAmericas, FaRegComment, FaUserCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { Modal } from "../../Modal/Modal";
import { PostEditOption } from "../../Modal/PostEditOption/PostEditOption";
import { NewPost, Post } from "../../../../../shared/interfaces/post.interface";

type BtnToggleRepliersProps = {
  newPost?: NewPost;
  post?: Post;
  isPostEdit?: boolean;
};

export const BtnToggleRepliers: FC<BtnToggleRepliersProps> = ({
  newPost,
  post,
  isPostEdit = true,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const repliersType = newPost?.repliersType || post?.repliersType || "everyone";

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
    if (newPost)
      return dispatch(updateNewPost({ newPost: { ...newPost, repliersType: value }, newPostType }));

    if (post) {
      // const updatedPost = { ...post, repliersType: value };
      throw new Error("Not implemented");
    }
  }

  return (
    <div className="btn-toggle-repliers-container">
      <Modal>
        <Modal.OpenBtn modalName="repliers" setPositionByRef={true} modalHeight={300}>
          <button className="btn-toggle-repliers">
            {isPostEdit ? (
              <>
                <FaGlobeAmericas />
                <span>{title} can reply</span>
              </>
            ) : (
              <>
                <FaRegComment size={18} />
                <span>Change who can reply</span>
              </>
            )}
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
