import { FC } from "react";
import { GoInfo } from "react-icons/go";
import { PostStatsInfoModal } from "../../../../components/Modals/PostStatInfoModal/PostStatInfoModal";
import "./PostStatsDataStatsList.scss";
import { PostStats } from "../../../../../../shared/interfaces/post.interface";

type PostStatsDataStatsListProps = {
  postStats: PostStats;
  openedModal: string;
  setOpenedModal: (modal: string) => void;
};

export const PostStatsDataStatsList: FC<PostStatsDataStatsListProps> = ({
  postStats,
  openedModal,
  setOpenedModal,
}) => {
  const postStatsData = [
    {
      name: "Impressions",
      count: postStats.isViewedCount,
      grid: { row: 1, column: 1 },
      desc: "Times this Chirp was seen on Chirper",
    },
    {
      name: "Engagements",
      count: postStats.engagementCount,
      grid: { row: 1, column: 2 },
      desc: "Total number of times a user has interacted with a Chirp. This includes all clicks anywhere on the Chirp (including hashtags, links, avatar, username, and Chirp expansion), reChirps, replies, follows, and likes.",
    },
    {
      name: "New followers",
      count: postStats.isFollowedFromPostCount,
      grid: { row: 1, column: 3 },
      desc: "Follows gained directly from this Chirp",
    },
    {
      name: "Link clicks",
      count: postStats.isLinkClickedCount,
      grid: { row: 2, column: 2 },
      desc: "Number of clicks on any URL in this Chirp",
    },
    {
      name: "Detail expands",
      count: postStats.isDetailedViewedCount,
      grid: { row: 2, column: 3 },
      desc: "Times people viewed the details about this Chirp",
    },
    {
      name: "Profile visits",
      count: postStats.isProfileViewedCount,
      grid: { row: 3, column: 2 },
      desc: "Number of profile views from this Chirp",
    },
  ];

  function onOpenModal(name: string) {
    setOpenedModal(name);
  }

  function onCloseModal() {
    setOpenedModal("");
  }
  return (
    <div className="post-stats-data">
      {postStatsData.map(data => {
        const { name, count, desc, grid } = data;
        const { row, column } = grid;
        return (
          <div
            className="post-stats-data-item"
            key={name}
            style={{ gridColumn: column, gridRow: row }}
          >
            <div className="post-stats-data-item-title">
              <span className="post-stats-data-item-name">{name}</span>
              <div className="btn-post-stats-data-item-info-container">
                {openedModal === name && (
                  <PostStatsInfoModal onCloseModal={onCloseModal} name={name} desc={desc} />
                )}
                <GoInfo onClick={() => onOpenModal(name)} />
              </div>
            </div>
            <h1 className="post-stats-data-item-count">{count}</h1>
          </div>
        );
      })}
    </div>
  );
};
