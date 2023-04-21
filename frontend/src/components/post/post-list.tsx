import { useSelector } from "react-redux";
import { PostPreview } from "./post-preview";
import { RootState } from "../../store/store";
import { Post } from "../../types/post.interface";

interface PostListProps {
  posts: Post[];
}

export const PostList: React.FC<PostListProps> = ({
  posts,
}) => {

  return (
    <section className="post-list">
      {posts.map((post) => (
        <PostPreview key={post._id} post={post} />
      ))}
    </section>
  );
};
