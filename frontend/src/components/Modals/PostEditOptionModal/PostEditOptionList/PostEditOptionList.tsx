import { FC } from "react";
import { PostEditOption as TypeOfPostEditOption } from "../../../../types/app.types";
import { PostEditOption } from "../PostEditOption/PostEditOption";

type PostEditOptionListProps = {
  options: TypeOfPostEditOption[];
  onOptionClick: (value: string) => void;
};

export const PostEditOptionList: FC<PostEditOptionListProps> = ({ options, onOptionClick }) => {
  return (
    <ul>
      {options.map(option => (
        <PostEditOption key={option.title} option={option} onOptionClick={onOptionClick} />
      ))}
    </ul>
  );
};
