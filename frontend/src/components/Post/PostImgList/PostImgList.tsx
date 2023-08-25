import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../../../../../shared/interfaces/post.interface";
import "./PostImgList.scss";
import { getBasePathName } from "../../../services/util/utils.service";

interface PostImgContainerProps {
  post: Post;
}

export const PostImg: React.FC<PostImgContainerProps> = ({ post }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { imgs } = post;
  const className = `post-imgs ${imgs.length > 2 ? " grid" : ""} cols-${imgs.length}`;

  function handleImgClick(idx: number) {
    if (onImgClick) onImgClick(idx);
  }

  function onImgClick(idx: number) {
    if (post.isPromotional) {
      const link = post.linkToSite;
      if (link) window.open(link, "_blank");
      return;
    }
    const { pathname } = location;
    const basePath = getBasePathName(pathname, "imgs");
    navigate(`${basePath}/post/${post.id}/imgs/${idx + 1}`);
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
