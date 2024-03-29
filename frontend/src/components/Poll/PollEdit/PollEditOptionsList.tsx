/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createRef, useState, useEffect, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PollEditOption } from "./PollEditOption";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { AppDispatch, RootState } from "../../../types/app";
import "./PollEditOptionsList.scss";
import { NewPostType } from "../../../types/Enums";

export const PollOptionsList: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { sideBar, homePage, newPostType } = useSelector((state: RootState) => state.postEdit);

  const [inputRefs, setInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);
  const [focused, setFocused] = useState<Record<string, boolean>>({});

  const { currNewPost } = usePostEdit();

  function onAddChoice() {
    if (!currNewPost || currNewPost.poll!.options.length >= 5) return;
    const defaultOption = { text: "" };
    const newPost = {
      ...currNewPost,
      poll: {
        ...currNewPost.poll!,
        options: [...currNewPost.poll!.options, defaultOption],
      },
    };
    dispatch(updateNewPost({ newPost }));
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
    if (!currNewPost || !currNewPost.poll) return;
    const options = [...currNewPost.poll!.options];
    options[idx].text = e.target.value;
    const newPost = {
      ...currNewPost,
      poll: {
        ...currNewPost.poll!,
        options,
      },
    };
    dispatch(updateNewPost({ newPost }));
  }

  useEffect(() => {
    if (!currNewPost || !currNewPost.poll) return;
    setInputRefs(currNewPost.poll!.options.map(() => createRef<HTMLInputElement>()));
    inputRefs[0]?.current?.focus();
  }, [currNewPost, currNewPost!.poll!.options.length, inputRefs, currNewPost!.poll]);

  useEffect(() => {
    if (!currNewPost || !inputRefs.length) return;
    if (newPostType === NewPostType.HomePage) {
      const currHomePost = homePage.posts.find(p => p.tempId === currNewPost.tempId);
      if (currHomePost) inputRefs[0].current?.focus();
    } else if (newPostType === NewPostType.SideBar) {
      const currSideBarPost = sideBar.posts.find(p => p.tempId === currNewPost.tempId);
      if (currSideBarPost) inputRefs[0].current?.focus();
    }
  }, [inputRefs, newPostType, homePage.posts, sideBar.posts, currNewPost, currNewPost!.tempId]);

  if (!currNewPost || !currNewPost.poll) return null;
  return (
    <div className="poll-options-container">
      {currNewPost.poll!.options.map((option, idx) => (
        <PollEditOption
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
