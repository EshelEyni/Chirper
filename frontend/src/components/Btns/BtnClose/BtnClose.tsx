import { GrClose } from "react-icons/gr";
import "./BtnClose.scss";

interface BtnCloseProps {
  onClickBtn: () => void;
}

export const BtnClose: React.FC<BtnCloseProps> = ({ onClickBtn }) => {
  return (
    <button className="btn-close" onClick={onClickBtn}>
      <GrClose />
    </button>
  );
};
