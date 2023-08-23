import { FC } from "react";
import { UserImg } from "../../../../User/UserImg/UserImg";
import { PostPreviewUserModalContent } from "../../../../Modal/PostPreviewUserModalContent/PostPreviewUserModalContent";
import { usePostPreview } from "../../../../../contexts/PostPreviewContext";
import { Modal } from "../../../../Modal/Modal";
import "./PostPreviewAside.scss";

export const PostPreviewAside: FC = () => {
  const { post, onNavigateToProfile } = usePostPreview();

  return (
    <aside className={"post-preview-wrapper-aside"}>
      <Modal>
        <Modal.ModalHoverOpen modalName="userPreview">
          <UserImg
            imgUrl={post.createdBy.imgUrl}
            onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
          />
        </Modal.ModalHoverOpen>

        <Modal.Window
          name="userPreview"
          className="user-preview-modal"
          closeOnHover={true}
          style={{ transform: "translate(-50%,-5%)" }}
        >
          <PostPreviewUserModalContent />
        </Modal.Window>
      </Modal>
    </aside>
  );
};
