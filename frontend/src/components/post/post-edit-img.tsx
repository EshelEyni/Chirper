interface PostEditImgProps {
  imgUrls: string[];
  setImgUrls: (urls: string[]) => void;
}

export const PostEditImg: React.FC<PostEditImgProps> = ({
  imgUrls,
  setImgUrls,
}) => {
  return (
    <div className="post-edit-imgs-container">
      {imgUrls.map((imgUrl) => (
        <div className="post-edit-img-container" key={imgUrl}>
          <img className="post-edit-img" src={imgUrl} alt="post-img" />
        </div>
      ))}
    </div>
  );
};
