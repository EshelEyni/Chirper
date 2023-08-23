import { formatNumToK } from "../../../../../services/util/utils.service";
import { PostPreviewActionBtn as PostPreviewActionBtnType } from "../PostPreviewActions";
import "./PostPreviewActionBtn.scss";

type PostPreviewActionBtnProps = {
  btn: PostPreviewActionBtnType;
  btnRef?: React.RefObject<HTMLButtonElement>;
};

export const PostPreviewActionBtn: React.FC<PostPreviewActionBtnProps> = ({ btn, btnRef }) => {
  const {
    name,
    //  title,
    isClicked,
    icon,
    count,
    onClickFunc,
  } = btn;

  // const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
  //   btnActionContainer: false,
  // });

  return (
    <div
      className={`btn-action-container ${name}`}
      // onMouseEnter={() => handleMouseEnter("btnActionContainer")}
      // onMouseLeave={() => handleMouseLeave("btnActionContainer")}
    >
      <button
        className={"btn-action " + (isClicked ? " clicked" : "")}
        onClick={onClickFunc}
        ref={name === "share" ? btnRef : undefined}
      >
        <div className="icon-container">{icon}</div>
        {count !== undefined && (
          <span className="count">{count > 0 ? formatNumToK(count) : ""}</span>
        )}
      </button>
      {/* {elementsHoverState?.btnActionContainer && (
        <ElementTitle
          title={title}
          customTop="35px"
          customLeft={count !== undefined && count !== 0 ? "0" : undefined}
          customTransform={count !== undefined && count !== 0 ? "none" : undefined}
        />
      )} */}
    </div>
  );
};
