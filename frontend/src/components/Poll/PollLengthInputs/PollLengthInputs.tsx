/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCustomSelect } from "../../../hooks/useCustomSelect";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { CustomSelect } from "../../App/CustomSelect/CustomSelect";
import "./PollLengthInputs.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";

export const PollLengthInputs: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const { currNewPost } = usePostEdit();
  const pollDays = currNewPost!.poll!.length.days;

  function handleValueChange(inputType: string, value: number | string) {
    if (!currNewPost || !currNewPost.poll) return;
    const setPollLength = (inputType: string, value: number | string) => {
      if (inputType === "days" && value === 7) {
        return {
          days: value,
          hours: 0,
          minutes: 0,
        };
      } else {
        return {
          ...currNewPost.poll!.length,
          [inputType]: value,
        };
      }
    };
    const newPost = {
      ...currNewPost,
      poll: {
        ...currNewPost.poll!,
        length: setPollLength(inputType, value),
      },
    };
    dispatch(updateCurrNewPost(newPost, newPostType));
  }

  const { inputs, setInputs, onFocused, onBlurred, onToggleDropdown, onSelected } = useCustomSelect(
    [
      {
        label: "Days",
        type: "days",
        value: currNewPost!.poll!.length.days,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(8).keys()],
      },
      {
        label: "Hours",
        type: "hours",
        value: currNewPost!.poll!.length.hours,
        isDisabled: currNewPost!.poll!.length.days === 7,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(24).keys()],
      },
      {
        label: "Minutes",
        type: "minutes",
        value: currNewPost!.poll!.length.minutes,
        isDisabled: currNewPost!.poll!.length.days === 7,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(60).keys()],
      },
    ],
    handleValueChange
  );

  useEffect(() => {
    setInputs(prevInputs => {
      return prevInputs.map(input => {
        if (input.type === "hours" || input.type === "minutes") {
          return {
            ...input,
            isDisabled: currNewPost!.poll!.length.days === 7,
            value: currNewPost!.poll!.length.days === 7 ? 0 : input.value,
          };
        }
        return input;
      });
    });
  }, [pollDays, currNewPost, setInputs]);

  return (
    <section className="poll-length">
      <h3 className="poll-length-title">Poll length</h3>
      <div className="poll-length-inputs-container">
        {inputs.map(input => (
          <CustomSelect
            input={input}
            key={input.type}
            onSelected={onSelected}
            onFocused={onFocused}
            onBlurred={onBlurred}
            onToggleDropdown={onToggleDropdown}
          />
        ))}
      </div>
    </section>
  );
};
