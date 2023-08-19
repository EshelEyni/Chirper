import { Tippy } from "../../App/Tippy/Tippy";
import "./BtnTogglePostStatsInfoModal.scss";
import { Modal } from "../../Modals/Modal/Modal";
import { GoInfo } from "react-icons/go";

type PostStatsInfoModalProps = {
  name: string;
  desc: string;
  elementId: string;
};

export const BtnTogglePostStatsInfoModal: React.FC<PostStatsInfoModalProps> = ({
  elementId,
  name,
  desc,
}) => {
  return (
    <Modal>
      <Modal.OpenBtn modalName={name}>
        <span className="btn-post-stats-data-item-info" id={elementId}>
          <GoInfo size={15} />
        </span>
      </Modal.OpenBtn>
      <Modal.Window
        name={name}
        className="post-stats-info"
        mainScreenMode="dark"
        mainScreenZIndex={1000}
        elementId={elementId}
      >
        <div className="post-stats-info-text">
          <h1>{name}</h1>
          <p>{desc}</p>
        </div>
        <Modal.CloseBtn>
          <button className="btn-go-back">
            <span>OK</span>
          </button>
        </Modal.CloseBtn>
        <Tippy isModalAbove={true} />
      </Modal.Window>
    </Modal>
  );
};
