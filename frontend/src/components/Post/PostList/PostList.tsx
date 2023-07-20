import { NewPost, Post } from "../../../../../shared/interfaces/post.interface";
import { MiniPostPreview } from "../MiniPostPreview/MiniPostPreview/MiniPostPreview";
import { NewPostContent } from "../MiniPostPreview/NewPostContent/NewPostContent";
import { PostPreview } from "../PostPreview/PostPreview";
import "./PostList.scss";

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
          <MiniPostPreview key={newPost.tempId} newPost={newPost} type={"new-post"}>
            {({ newPost }: { newPost: NewPost }) => <NewPostContent newPost={newPost} />}
          </MiniPostPreview>
        ))}
    </section>
  );
};
