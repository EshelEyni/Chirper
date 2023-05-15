import { AiOutlinePlus } from "react-icons/ai";
import { Poll } from "../../../../shared/interfaces/post.interface";
import { createRef, useState, useEffect } from "react";

interface PollOptionsInputProps {
  poll: Poll;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
}
export const PollOptionsInput: React.FC<PollOptionsInputProps> = ({ poll, setPoll }) => {
  const [inputRefs, setInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);

  useEffect(() => {
    setInputRefs(poll.options.map(() => createRef<HTMLInputElement>()));
    inputRefs[0]?.current?.focus();
  }, [poll.options.length]);

  useEffect(() => {
    if (inputRefs.length > 0) {
      inputRefs[0].current?.focus();
    }
  }, [inputRefs]);

  const [focused, setFocused] = useState<Record<string, boolean>>({
    choice1: false,
    choice2: false,
    choice3: false,
    choice4: false,
  });

  const onAddChoice = () => {
    if (poll.options.length < 5) {
      const defaultOption = {
        text: "",
        voteSum: 0,
        isLoggedinUserVoted: false,
      };
      setPoll({
        ...poll,
        options: [...poll.options, defaultOption],
      });
    }
  };

  const onFocusChoice = (idx: number) => {
    setFocused({ ...focused, [`option${idx + 1}`]: true });
    setTimeout(() => {
      inputRefs[idx].current?.focus();
    }, 0);
  };

  const onBlurChoice = (idx: number) => {
    setFocused({ ...focused, [`option${idx + 1}`]: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const options = [...poll.options];
    options[idx].text = e.target.value;
    setPoll({ ...poll, options });
  };

  return (
    <div className="poll-options-container">
      {poll.options.map((option, idx) => (
        <div
          key={idx}
          className={
            "poll-option-container" + (focused[`option${idx + 1}`] ? " option-focused" : "")
          }
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
            />
            <span className={"option-input-placeholder" + (option ? " text-filled" : "")}>
              {`Choice ${idx + 1}`}
            </span>
            {focused[`option${idx + 1}`] && (
              <span className="option-text-indicator">{option.text.length + "/" + 25}</span>
            )}
          </div>
          {idx === poll.options.length - 1 && idx != 3 && (
            <button className="btn-add-option" onClick={onAddChoice}>
              <AiOutlinePlus className="add-option-icon" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
