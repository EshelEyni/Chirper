import { FC } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { HiOutlinePencilAlt } from "react-icons/hi";
import "./RepostOptionsModal.scss";
import { Modal } from "../Modal/Modal";

type RepostOptionsModalProps = {
  onToggleModal: () => void;
  isReposted: boolean;
  onRepost: () => void;
  onRemoveRepost: () => void;
  onQuotePost: () => void;
};

export const RepostOptionsModal: FC<RepostOptionsModalProps> = ({
  onToggleModal,
  isReposted,
  onRepost,
  onRemoveRepost,
  onQuotePost,
}) => {
  const btns = [
    {
      text: isReposted ? "undo rechirp" : "rechirp",
      icon: <AiOutlineRetweet size={20} />,
      onClickFunc: isReposted ? onRemoveRepost : onRepost,
    },
    {
      text: "quote rechirp",
      icon: <HiOutlinePencilAlt size={20} />,
      onClickFunc: () => onQuotePost(),
    },
  ];
  return (
    <Modal className="repost-options" onClickMainScreen={onToggleModal}>
      {btns.map((btn, i) => (
        <button className="btn-repost-option" key={i} onClick={btn.onClickFunc}>
          {btn.icon}
          <span>{btn.text}</span>
        </button>
      ))}
    </Modal>
  );
};
