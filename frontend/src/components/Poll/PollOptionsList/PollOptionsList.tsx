/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createRef, useState, useEffect, FC } from "react";
import { AppDispatch } from "../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import "./PollOptionsList.scss";
import { PollOption } from "./PollOption/PollOption";
import { NewPostType } from "../../../store/reducers/new-post.reducer";

type PollOptionsInputProps = {
  currNewPost: NewPost;
};

export const PollOptionsList: FC<PollOptionsInputProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const { sideBar, homePage, newPostType } = useSelector((state: RootState) => state.newPostModule);

  const [inputRefs, setInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);
  const [focused, setFocused] = useState<Record<string, boolean>>({});

  function getDefaultOption() {
    return {
      text: "",
      voteCount: 0,
      isLoggedinUserVoted: false,
    };
  }

  function onAddChoice() {
    if (currNewPost.poll!.options.length > 5) return;
    const defaultOption = getDefaultOption();
    const newPost = {
      ...currNewPost,
      poll: {
        ...currNewPost.poll!,
        options: [...currNewPost.poll!.options, defaultOption],
      },
    };
    dispatch(updateCurrNewPost(newPost, newPostType));
  }

  function onFocusChoice(idx: number) {
    setFocused({ ...focused, [`option${idx + 1}`]: true });
    setTimeout(() => {
      inputRefs[idx].current?.focus();
    }, 0);
  }

  function onBlurChoice(idx: number) {
    setFocused({ ...focused, [`option${idx + 1}`]: false });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
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
  }

  useEffect(() => {
    setInputRefs(currNewPost.poll!.options.map(() => createRef<HTMLInputElement>()));
    inputRefs[0]?.current?.focus();
  }, [currNewPost.poll!.options.length, inputRefs, currNewPost.poll]);

  useEffect(() => {
    if (!inputRefs.length) return;
    if (newPostType === NewPostType.HomePage) {
      const currHomePost = homePage.posts.find(p => p.tempId === currNewPost.tempId);
      if (currHomePost) inputRefs[0].current?.focus();
    } else if (newPostType === NewPostType.SideBar) {
      const currSideBarPost = sideBar.posts.find(p => p.tempId === currNewPost.tempId);
      if (currSideBarPost) inputRefs[0].current?.focus();
    }
  }, [inputRefs, newPostType, homePage.posts, sideBar.posts, currNewPost.tempId]);

  return (
    <div className="poll-options-container">
      {currNewPost.poll!.options.map((option, idx) => (
        <PollOption
          key={idx}
          idx={idx}
          option={option}
          optionsLength={currNewPost.poll!.options.length}
          inputRefs={inputRefs}
          focused={focused}
          onAddChoice={onAddChoice}
          onFocusChoice={onFocusChoice}
          onBlurChoice={onBlurChoice}
          handleChange={handleChange}
        />
      ))}
    </div>
  );
};
