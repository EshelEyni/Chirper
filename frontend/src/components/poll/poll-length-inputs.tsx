import { FC, useEffect, useRef } from "react";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { CustomSelect } from "../other/custom-select";
import { useCustomSelect } from "../../hooks/useCustomSelect";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setNewPost } from "../../store/actions/post.actions";
import { NewPostType } from "../../store/reducers/post.reducer";

export const PollLengthInputs: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const handleValueChange = (inputType: string, value: number | string) => {
    const setPollLength = (inputType: string, value: number | string) => {
      if (inputType === "days" && value === 7) {
        return {
          days: value,
          hours: 0,
          minutes: 0,
        };
      } else {
        return {
          ...currPost.poll!.length,
          [inputType]: value,
        };
      }
    };

    dispatch(
      setNewPost(
        {
          ...currPost,
          poll: {
            ...currPost.poll!,
            length: setPollLength(inputType, value),
          },
        },
        newPostType
      )
    );
  };

  useEffect(() => {
    setInputs(prevInputs => {
      return prevInputs.map(input => {
        if (input.type === "hours" || input.type === "minutes") {
          return {
            ...input,
            isDisabled: currPost.poll!.length.days === 7,
            value: currPost.poll!.length.days === 7 ? 0 : input.value,
          };
        }
        return input;
      });
    });
  }, [currPost.poll!.length.days]);

  const { inputs, setInputs, onFocused, onBlurred, onToggleDropdown, onSelected } = useCustomSelect(
    [
      {
        label: "Days",
        type: "days",
        value: currPost.poll!.length.days,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(8).keys()],
      },
      {
        label: "Hours",
        type: "hours",
        value: currPost.poll!.length.hours,
        isDisabled: currPost.poll!.length.days === 7,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(24).keys()],
      },
      {
        label: "Minutes",
        type: "minutes",
        value: currPost.poll!.length.minutes,
        isDisabled: currPost.poll!.length.days === 7,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(60).keys()],
      },
    ],
    handleValueChange
  );

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
