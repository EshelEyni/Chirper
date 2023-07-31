import { FC } from "react";
import { PlaybackRatePickerModal } from "../../Modals/PlaybackRatePickerModal/PlaybackRatePickerModal";
import { useModalPosition } from "../../../hooks/useModalPosition";
import { IoSettingsOutline } from "react-icons/io5";
import "./BtnToggleVideoSetting.scss";
import { useVideoCustomControls } from "../../../contexts/VideoCustomControlsContext";

export const BtnToggleVideoSetting: FC = () => {
  const { isModalShown, setIsModalShown } = useVideoCustomControls();
  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLButtonElement>({
    modalHeight: 200,
  });

  function onTogglePlaybackRatePickerModal(e: React.MouseEvent) {
    e.stopPropagation();
    updateModalPosition();
    setIsModalShown(prev => !prev);
  }

  return (
    <div className="btn-toggle-video-setting-container" onClick={e => e.stopPropagation()}>
      <button
        className="btn-toggle-video-setting"
        onClick={onTogglePlaybackRatePickerModal}
        ref={elementRef}
      >
        <IoSettingsOutline size={20} color="white" />
      </button>
      {isModalShown && <PlaybackRatePickerModal isModalAbove={isModalAbove} />}
    </div>
  );
};
