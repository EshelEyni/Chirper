import { PostPreview } from "./post-preview";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { MiniPostPreview } from "./mini-post-preview";

interface PostListProps {
  posts?: Post[];
  newPosts?: NewPost[];
}

export const PostList: React.FC<PostListProps> = ({ posts, newPosts }) => {
  return (
    <section className="post-list">
      {posts && posts.map(post => <PostPreview key={`${post.id}-${post.createdAt}`} post={post} />)}
      {newPosts &&
        newPosts.map(newPost => (
          <MiniPostPreview key={newPost.key} newPost={newPost} type={"new-post"} />
        ))}
    </section>
  );
};
