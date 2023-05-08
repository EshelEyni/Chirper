interface PostImgContainerProps {
  imgs: { url: string; sortOrder: number }[];
}

export const PostImg: React.FC<PostImgContainerProps> = ({ imgs }) => {
  return (
    <section
      className={
        "post-imgs" + (imgs.length > 2 ? " grid" : "") + ` cols-${imgs.length}`
      }
    >
      {imgs
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img, idx) => (
          <div className={"post-img-container" + ` img-${idx + 1}`} key={img.sortOrder}>
            <img className="post-img" src={img.url} alt="post-img" />
          </div>
        ))}
    </section>
  );
};
