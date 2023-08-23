import { Tooltip } from "react-tooltip";
import { formatNumToK, makeId } from "../../../../../services/util/utils.service";
import { PostPreviewActionBtn as PostPreviewActionBtnType } from "../PostPreviewActions";
import "./PostPreviewActionBtn.scss";
import { useRef } from "react";

type PostPreviewActionBtnProps = {
  btn: PostPreviewActionBtnType;
  btnRef?: React.RefObject<HTMLButtonElement>;
};

export const PostPreviewActionBtn: React.FC<PostPreviewActionBtnProps> = ({ btn, btnRef }) => {
  const { name, title, isClicked, icon, count, onClickFunc } = btn;
  const btnId = useRef(makeId()).current;

  return (
    <>
      <div className={`btn-action-container ${name}`}>
        <button
          className={"btn-action " + (isClicked ? " clicked" : "")}
          onClick={onClickFunc}
          ref={name === "share" ? btnRef : undefined}
        >
          <div
            className="icon-container"
            data-tooltip-id={btnId}
            data-tooltip-content={title}
            data-tooltip-place="bottom"
          >
            {icon}
          </div>
          {/* Share Button doesn't have a count property */}
          {count !== undefined && (
            <span className="count">{count > 0 ? formatNumToK(count) : ""}</span>
          )}
        </button>
      </div>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayHide={100}
        style={{
          fontSize: "12px",
          padding: "5px 10px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1500,
        }}
      />
    </>
  );
};
