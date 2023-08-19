import "./PostImgList.scss";

interface PostImgContainerProps {
  imgs: { url: string; sortOrder: number }[];
  onImgClick?: (idx: number) => void;
}

export const PostImg: React.FC<PostImgContainerProps> = ({ imgs, onImgClick }) => {
  const className = `post-imgs ${imgs.length > 2 ? " grid" : ""} cols-${imgs.length}`;

  function handleImgClick(idx: number) {
    if (onImgClick) onImgClick(idx);
  }

  return (
    <section className={className}>
      {imgs.map((img, idx) => (
        <div className={`post-img-container img-${idx + 1}`} key={idx}>
          <img
            className="post-img"
            src={img.url}
            alt="post-img"
            loading="lazy"
            onClick={() => handleImgClick(idx)}
          />
        </div>
      ))}
    </section>
  );
};
