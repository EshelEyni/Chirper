import { Fragment, useState } from "react";
import { Poll } from "../../../../shared/interfaces/post.interface";
import { FiMove, FiTrash } from "react-icons/fi";

interface PollEditProps {
  poll: Poll;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
}

export const PollEdit: React.FC<PollEditProps> = ({ poll, setPoll }) => {
  const [focused, setFocused] = useState<Record<string, boolean>>({
    choice1: false,
    choice2: false,
    choice3: false,
    choice4: false,
  });

  return (
    <Fragment>
      {poll.choices.map((choice, i) => (
        <div key={i} className="poll-choice">
          <input
            type="text"
            placeholder={`Choice ${i + 1}`}
            value={choice}
            onChange={(e) => {
              const choices = [...poll.choices];
              choices[i] = e.target.value;
              setPoll({ ...poll, choices });
            }}
            onFocus={() => setFocused({ ...focused, [`choice${i + 1}`]: true })}
            onBlur={() => setFocused({ ...focused, [`choice${i + 1}`]: false })}
          />
          
        </div>
      ))}
    </Fragment>
  );
};
