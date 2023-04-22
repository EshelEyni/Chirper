import React from "react";
import { AiOutlineClose } from "react-icons/ai";

interface PostEditGiffPickerProps {
  giffUrl: string;
  setGiffUrl: (url: string) => void;
  setIsGiffPickerShown: (isShown: boolean) => void;
}

export const PostEditGiffPickerModal: React.FC<PostEditGiffPickerProps> = ({
  giffUrl,
  setGiffUrl,
  setIsGiffPickerShown,
}) => {
  return (
    <React.Fragment>
      <div
        className="main-screen dark"
        onClick={() => setIsGiffPickerShown(false)}
      ></div>
      <div className="post-edit-giff-picker">
        <div className="post-edit-giff-picker-header">
          <button
            className="post-edit-giff-picker-header-close"
            onClick={() => setIsGiffPickerShown(false)}
          >
            <AiOutlineClose />
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};
