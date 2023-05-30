import { AiOutlinePlus } from "react-icons/ai";
import { createRef, useState, useEffect, FC } from "react";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../store/actions/post.actions";

type PollOptionsInputProps = {
  currNewPost: NewPost;
};

export const PollOptionsInput: FC<PollOptionsInputProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const {
    newPostState: { sideBar, homePage, newPostType },
  } = useSelector((state: RootState) => state.postModule);

  const [inputRefs, setInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);

  useEffect(() => {
    setInputRefs(currNewPost.poll!.options.map(() => createRef<HTMLInputElement>()));
    inputRefs[0]?.current?.focus();
  }, [currNewPost.poll!.options.length]);

  useEffect(() => {
    if (inputRefs.length > 0) {
      if (newPostType === "home-page" && currNewPost.currIdx === homePage.currPostIdx) {
        inputRefs[0].current?.focus();
      } else if (newPostType === "side-bar" && currNewPost.currIdx === sideBar.currPostIdx) {
        inputRefs[0].current?.focus();
      }
    }
  }, [inputRefs]);

  const [focused, setFocused] = useState<Record<string, boolean>>({
    choice1: false,
    choice2: false,
    choice3: false,
    choice4: false,
  });

  const onAddChoice = () => {
    if (currNewPost.poll!.options.length < 5) {
      const defaultOption = {
        text: "",
        voteSum: 0,
        isLoggedinUserVoted: false,
      };
      const newPost = {
        ...currNewPost,
        poll: {
          ...currNewPost.poll!,
          options: [...currNewPost.poll!.options, defaultOption],
        },
      };
      dispatch(updateCurrNewPost(newPost, newPostType));
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
    const options = [...currNewPost.poll!.options];
    options[idx].text = e.target.value;
    const newPost = {
      ...currNewPost,
      poll: {
        ...currNewPost.poll!,
        options,
      },
    };
    dispatch(updateCurrNewPost(newPost, newPostType));
  };

  return (
    <div className="poll-options-container">
      {currNewPost.poll!.options.map((option, idx) => (
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
              value={option.text}
            />
            <span className={"option-input-placeholder" + (option ? " text-filled" : "")}>
              {`Choice ${idx + 1}`}
            </span>
            {focused[`option${idx + 1}`] && (
              <span className="option-text-indicator">{option.text.length + "/" + 25}</span>
            )}
          </div>
          {idx === currNewPost.poll!.options.length - 1 && idx != 3 && (
            <button className="btn-add-option" onClick={onAddChoice}>
              <AiOutlinePlus className="add-option-icon" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
