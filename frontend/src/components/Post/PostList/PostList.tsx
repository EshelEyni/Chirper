import { NewPost, Post } from "../../../../../shared/interfaces/post.interface";
import { PostPreviewProvider } from "../../../contexts/PostPreviewContext";
import { MiniPostPreview } from "../PostPreview/MiniPostPreview/MiniPostPreview";
import { NewPostContent } from "../PostPreview/MiniPostPreview/NewPostContent/NewPostContent";
import { PostPreview } from "../PostPreview/PostPreview/PostPreview";
import "./PostList.scss";

interface PostListProps {
  posts?: Post[];
  newPosts?: NewPost[];
}

export const PostList: React.FC<PostListProps> = ({ posts, newPosts }) => {
  return (
    <section className="post-list">
      {posts &&
        posts.map(post => (
          <PostPreviewProvider post={post} key={`${post.id}-${post.createdAt}`}>
            <PostPreview />
          </PostPreviewProvider>
        ))}

      {newPosts &&
        newPosts.map(newPost => (
          <MiniPostPreview key={newPost.tempId} newPost={newPost} type={"new-post"}>
            <NewPostContent newPost={newPost} />
          </MiniPostPreview>
        ))}
    </section>
  );
};
