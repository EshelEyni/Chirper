import { FC } from "react";
import { UserImg } from "../../User/UserImg/UserImg";
import "./MiniPostPreviewAside.scss";

type MiniPostPreviewAsideProps = {
  userImgUrl?: string;
  isPostLineShowned: boolean;
};

export const MiniPostPreviewAside: FC<MiniPostPreviewAsideProps> = ({
  userImgUrl,
  isPostLineShowned,
}) => {
  return (
    <aside className="mini-post-aside">
      <UserImg imgUrl={userImgUrl} />
      {isPostLineShowned && <div className="post-line" />}
    </aside>
  );
};
