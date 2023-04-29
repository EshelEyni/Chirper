import { AiOutlinePlus } from "react-icons/ai";
import { Poll } from "../../../../shared/interfaces/post.interface";
import { createRef, useState, useEffect } from "react";

interface PollChoicesInputProps {
  poll: Poll;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
}
export const PollChoicesInput: React.FC<PollChoicesInputProps> = ({
  poll,
  setPoll,
}) => {
  const [inputRefs, setInputRefs] = useState<
    React.RefObject<HTMLInputElement>[]
  >([]);

  useEffect(() => {
    setInputRefs(poll.choices.map(() => createRef<HTMLInputElement>()));
    inputRefs[0]?.current?.focus();
  }, [poll.choices.length]);

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
    if (poll.choices.length < 5) {
      setPoll({ ...poll, choices: [...poll.choices, ""] });
    }
  };

  const onFocusChoice = (idx: number) => {
    setFocused({ ...focused, [`choice${idx + 1}`]: true });
    setTimeout(() => {
      inputRefs[idx].current?.focus();
    }, 0);
  };

  const onBlurChoice = (idx: number) => {
    setFocused({ ...focused, [`choice${idx + 1}`]: false });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const choices = [...poll.choices];
    choices[idx] = e.target.value;
    setPoll({ ...poll, choices });
  };

  return (
    <div className="poll-choices-container">
      {poll.choices.map((choice, idx) => (
        <div
          key={idx}
          className={
            "poll-choice-container" +
            (focused[`choice${idx + 1}`] ? " choice-focused" : "")
          }
        >
          <div className="poll-choice">
            <input
              className={`poll-choice-input ${idx}`}
              type="text"
              onChange={(e) => {
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
            <span
              className={
                "choice-input-placeholder" + (choice ? " text-filled" : "")
              }
            >
              {`Choice ${idx + 1}`}
            </span>
            {focused[`choice${idx + 1}`] && (
              <span className="choice-text-indicator">
                {choice.length + "/" + 25}
              </span>
            )}
          </div>
          {idx === poll.choices.length - 1 && idx != 3 && (
            <button className="btn-add-choice" onClick={onAddChoice}>
              <AiOutlinePlus className="add-choice-icon" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
