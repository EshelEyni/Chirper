import { FC, useState } from "react";
import { AiTwotoneSetting } from "react-icons/ai";
import { PlaybackRatePickerModal } from "../modals/playback-rate-picker-modal";
import { useModalPosition } from "../../hooks/useModalPosition";

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
    <div className="video-setting-container">
      {isPlaybackRatePickerModal && (
        <PlaybackRatePickerModal
          playbackRate={playbackRate}
          onToggleModal={setIsPlaybackRaterPickerModal}
          isModalAbove={isModalAbove}
        />
      )}

      <button onClick={onTogglePlaybackRatePickerModal} ref={btnRef}>
        <AiTwotoneSetting size={20} />
      </button>
    </div>
  );
};
