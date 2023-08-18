import { SpinnerLoader } from "../../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { ErrorMsg } from "../../../../components/Msg/ErrorMsg/ErrorMsg";
import { useQueryPostStats } from "../../../../hooks/post/useQueryPostStats";
import { PostStatsActionStatsList } from "../ActionStatsList/PostStatsActionStatsList";
import { PostStatsDataStatsList } from "../DataStatsList/PostStatsDataStatsList";
import { FC, useState } from "react";

type PostStatsDetailsProps = {
  postId: string;
};

export const PostStatsDetails: FC<PostStatsDetailsProps> = ({ postId }) => {
  const [openedModal, setOpenedModal] = useState<string>("");
  const { postStats, isLoading, isSuccess, isError } = useQueryPostStats(postId);
  return (
    <>
      {isSuccess && postStats && (
        <>
          <PostStatsActionStatsList postStats={postStats} />
          <PostStatsDataStatsList
            postStats={postStats}
            openedModal={openedModal}
            setOpenedModal={setOpenedModal}
          />
        </>
      )}
      {isLoading && <SpinnerLoader />}
      {isError && <ErrorMsg msg="Couldn't get post stats. Please try again later." />}
    </>
  );
};
