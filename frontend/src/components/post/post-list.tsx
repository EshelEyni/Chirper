import { PostPreview } from "./post-preview";
import { Post } from "../../../../shared/interfaces/post.interface";

interface PostListProps {
  posts: Post[];
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <section className="post-list">
      {posts.map(post => (
        <PostPreview key={post.id} post={post} />
      ))}
    </section>
  );
};
