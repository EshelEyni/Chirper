import { FC, useState } from "react";
import { AiTwotoneSetting } from "react-icons/ai";
import { PlaybackRatePickerModal } from "../modals/playback-rate-picker-modal";

type BtnToggleVideoSettingProps = {
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
};

export const BtnToggleVideoSetting: FC<BtnToggleVideoSettingProps> = ({
  playbackRate,
  setPlaybackRate,
}) => {
  const [isPlaybackRatePickerModal, setIsPlaybackRaterPickerModal] = useState(false);

  const onTogglePlaybackRatePickerModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaybackRaterPickerModal(!isPlaybackRatePickerModal);
  };

  return (
    <div className="video-setting-container">
      {isPlaybackRatePickerModal && <PlaybackRatePickerModal playbackRate={playbackRate} />}
      <button onClick={onTogglePlaybackRatePickerModal}>
        <AiTwotoneSetting size={20} />
      </button>
    </div>
  );
};
