import { FC } from "react";
import { PlaybackRatePickerModal } from "../../Modals/PlaybackRatePickerModal/PlaybackRatePickerModal";
import { useModalPosition } from "../../../hooks/useModalPosition";
import { IoSettingsOutline } from "react-icons/io5";
import "./BtnToggleVideoSetting.scss";

type BtnToggleVideoSettingProps = {
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
  isPlaybackRatePickerModalShown: boolean;
  setIsPlaybackRaterPickerModalShown: (isPlaybackRatePickerModalShown: boolean) => void;
  isFullScreen: boolean;
};

export const BtnToggleVideoSetting: FC<BtnToggleVideoSettingProps> = ({
  playbackRate,
  setPlaybackRate,
  isPlaybackRatePickerModalShown,
  setIsPlaybackRaterPickerModalShown,
  isFullScreen,
}) => {
  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLButtonElement>({
    modalHeight: 200,
  });

  function onTogglePlaybackRatePickerModal(e: React.MouseEvent) {
    e.stopPropagation();
    updateModalPosition();
    setIsPlaybackRaterPickerModalShown(!isPlaybackRatePickerModalShown);
  }

  return (
    <div className="btn-toggle-video-setting-container" onClick={e => e.stopPropagation()}>
      {isPlaybackRatePickerModalShown && (
        <PlaybackRatePickerModal
          playbackRate={playbackRate}
          setPlaybackRate={setPlaybackRate}
          onToggleModal={setIsPlaybackRaterPickerModalShown}
          isModalAbove={isModalAbove}
          isFullScreen={isFullScreen}
        />
      )}

      <button
        className="btn-toggle-video-setting"
        onClick={onTogglePlaybackRatePickerModal}
        ref={elementRef}
      >
        <IoSettingsOutline size={20} color="white" />
      </button>
    </div>
  );
};
