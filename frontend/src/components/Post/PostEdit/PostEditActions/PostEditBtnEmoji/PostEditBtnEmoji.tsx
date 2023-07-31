import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FC } from "react";
import { Emoji } from "../../../../../../../shared/interfaces/post.interface";
import {
  ElementVisibility,
  PostEditActionBtn,
  UIElement,
} from "../PostEditActions/PostEditActions";
import { MainScreen } from "../../../../App/MainScreen/MainScreen";

type PostEditBtnEmojiProps = {
  btn: PostEditActionBtn;
  elementVisibility: ElementVisibility;
  onToggleElementVisibility: (element: UIElement) => void;
  onEmojiPicked: (emoji: Emoji) => void;
};

export const PostEditBtnEmoji: FC<PostEditBtnEmojiProps> = ({
  btn,
  elementVisibility,
  onToggleElementVisibility,
  onEmojiPicked,
}) => {
  return (
    <div className="emoji-button-container">
      <button
        className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
        disabled={btn.isDisabled}
        onClick={btn.onClickFn}
      >
        <div className="post-edit-action-icon-container">{btn.icon}</div>
      </button>
      {elementVisibility.emojiPicker && (
        <div className="emoji-picker-container">
          <MainScreen onClickFn={() => onToggleElementVisibility("emojiPicker")} />
          <div className="emoji-post-edit-option-container">
            <Picker data={data} onEmojiSelect={onEmojiPicked} />
          </div>
        </div>
      )}
    </div>
  );
};
