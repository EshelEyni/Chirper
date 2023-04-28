import { IoClose } from "react-icons/io5";

interface BtnCloseProps {
  onClickBtn: () => void;
}

export const BtnClose: React.FC<BtnCloseProps> = ({ onClickBtn }) => {
  return (
    <div className="btn-container">
      <button className="btn-close" onClick={onClickBtn}>
        <IoClose />
      </button>
    </div>
  );
};
