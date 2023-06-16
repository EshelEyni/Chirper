type PostStatsInfoModalProps = {
  name: string;
  desc: string;
  onCloseModal: () => void;
};

export const PostStatsInfoModal: React.FC<PostStatsInfoModalProps> = ({
  name,
  desc,
  onCloseModal,
}) => {
  return (
    <>
      <div className="main-screen" onClick={onCloseModal} />
      <div className="post-stats-info-modal">
        <div className="post-stats-info-modal-text">
          <h1>{name}</h1>
          <p>{desc}</p>
        </div>
        <button className="btn-go-back" onClick={onCloseModal}>
          <span>OK</span>
        </button>
        <div className="tippy down" />
      </div>
    </>
  );
};
