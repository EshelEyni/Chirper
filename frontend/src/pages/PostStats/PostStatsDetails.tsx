import { FC } from "react";
import { SpinnerLoader } from "../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { ErrorMsg } from "../../components/Msg/ErrorMsg/ErrorMsg";
import { useQueryPostStats } from "../../hooks/reactQuery/post/useQueryPostStats";
import { PostStatsActionStatsList } from "./PostStatsActionStatsList";
import { PostStatsDataStatsList } from "./PostStatsDataStatsList";

type PostStatsDetailsProps = {
  postId: string;
};

export const PostStatsDetails: FC<PostStatsDetailsProps> = ({ postId }) => {
  const { postStats, isLoading, isSuccess, isError } = useQueryPostStats(postId);
  return (
    <>
      {isSuccess && postStats && (
        <>
          <PostStatsActionStatsList postStats={postStats} />
          <PostStatsDataStatsList postStats={postStats} />
        </>
      )}
      {isLoading && <SpinnerLoader />}
      {isError && <ErrorMsg msg="Couldn't get post stats. Please try again later." />}
    </>
  );
};
