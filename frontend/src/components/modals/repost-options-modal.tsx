import { FC, Fragment } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { HiOutlinePencilAlt } from "react-icons/hi";
type RepostOptionsModalProps = {
  onToggleModal: () => void;
  isReposted: boolean;
  onRepost: () => void;
  onRemoveRepost: () => void;
};

export const RepostOptionsModal: FC<RepostOptionsModalProps> = ({
  onToggleModal,
  isReposted,
  onRepost,
  onRemoveRepost,
}) => {
  const btns = [
    {
      name: isReposted ? "undo rechirp" : "rechirp",
      icon: <AiOutlineRetweet className="icon" size={20} />,
      onClickFunc: isReposted ? onRemoveRepost : onRepost,
    },
    {
      name: "quote rechirp",
      icon: <HiOutlinePencilAlt className="icon" size={20} />,
      onClickFunc: () => console.log("quote rechirp"),
    },
  ];
  return (
    <Fragment>
      <div className="main-screen" onClick={onToggleModal}></div>
      <section className="repost-options-modal">
        {btns.map((btn, i) => (
          <button className="btn-repost-option" key={i} onClick={btn.onClickFunc}>
            {btn.icon}
            <span>{btn.name}</span>
          </button>
        ))}
      </section>
    </Fragment>
  );
};
