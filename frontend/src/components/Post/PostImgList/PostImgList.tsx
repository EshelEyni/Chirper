import "./PostImgList.scss";

interface PostImgContainerProps {
  imgs: { url: string; sortOrder: number }[];
}

export const PostImg: React.FC<PostImgContainerProps> = ({ imgs }) => {
  const className = `post-imgs ${imgs.length > 2 ? " grid" : ""} cols-${imgs.length}`;
  return (
    <section className={className}>
      {imgs.map((img, idx) => (
        <div className={`post-img-container img-${idx + 1}`} key={idx}>
          <img className="post-img" src={img.url} alt="post-img" loading="lazy" />
        </div>
      ))}
    </section>
  );
};
