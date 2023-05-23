import { FC, useState } from "react";
import { PlaybackRatePickerModal } from "../modals/playback-rate-picker-modal";
import { useModalPosition } from "../../hooks/useModalPosition";
import { IoSettingsOutline } from "react-icons/io5";

type BtnToggleVideoSettingProps = {
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
};

export const BtnToggleVideoSetting: FC<BtnToggleVideoSettingProps> = ({
  playbackRate,
  setPlaybackRate,
}) => {
  const modalHeight = 305;
  const { btnRef, isModalAbove, updateModalPosition } = useModalPosition(modalHeight);

  const [isPlaybackRatePickerModal, setIsPlaybackRaterPickerModal] = useState(false);

  const onTogglePlaybackRatePickerModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateModalPosition();
    setIsPlaybackRaterPickerModal(!isPlaybackRatePickerModal);
  };

  return (
    <div className="btn-toggle-video-setting-container">
      {isPlaybackRatePickerModal && (
        <PlaybackRatePickerModal
          playbackRate={playbackRate}
          setPlaybackRate={setPlaybackRate}
          onToggleModal={setIsPlaybackRaterPickerModal}
          isModalAbove={isModalAbove}
        />
      )}

      <button onClick={onTogglePlaybackRatePickerModal} ref={btnRef}>
        <IoSettingsOutline size={20} color="white" />
      </button>
    </div>
  );
};
