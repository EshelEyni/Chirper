import { FC } from "react";
import { PollOption as TypeOfPollOption } from "../../../../../../shared/interfaces/post.interface";
import { AiOutlinePlus } from "react-icons/ai";
import "./PollOption.scss";

type PollOptionProps = {
  idx: number;
  option: TypeOfPollOption;
  optionsLength: number;
  inputRefs: React.RefObject<HTMLInputElement>[];
  focused: Record<string, boolean>;
  onAddChoice: () => void;
  onFocusChoice: (idx: number) => void;
  onBlurChoice: (idx: number) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
};

export const PollOption: FC<PollOptionProps> = ({
  idx,
  option,
  optionsLength,
  inputRefs,
  focused,
  onAddChoice,
  onFocusChoice,
  onBlurChoice,
  handleChange,
}) => {
  const isTextIndicatorShown = focused[`option${idx + 1}`];
  const isAddOptionBtnShown = idx === optionsLength - 1 && idx != 3;

  return (
    <div
      className={"poll-option-container" + (focused[`option${idx + 1}`] ? " option-focused" : "")}
    >
      <div className="poll-option">
        <input
          className={`poll-option-input ${idx}`}
          type="text"
          onChange={e => {
            handleChange(e, idx);
          }}
          onFocus={() => {
            onFocusChoice(idx);
          }}
          onBlur={() => {
            onBlurChoice(idx);
          }}
          ref={inputRefs[idx]}
          maxLength={25}
          value={option.text}
        />
        <span className={"option-input-placeholder" + (option ? " text-filled" : "")}>
          {`Choice ${idx + 1}`}
        </span>
        {isTextIndicatorShown && (
          <span className="option-text-indicator">{option.text.length + "/" + 25}</span>
        )}
      </div>
      {isAddOptionBtnShown && (
        <button className="btn-add-option" onClick={onAddChoice}>
          <AiOutlinePlus className="add-option-icon" />
        </button>
      )}
    </div>
  );
};
