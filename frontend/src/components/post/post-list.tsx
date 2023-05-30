import { PostPreview } from "./post-preview";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { MiniPostPreview } from "./mini-post-preview";
import { utilService } from "../../services/util.service/utils.service";

interface PostListProps {
  posts?: Post[];
  newPosts?: NewPost[];
}

export const PostList: React.FC<PostListProps> = ({ posts, newPosts }) => {
  return (
    <section className="post-list">
      {posts && posts.map(post => <PostPreview key={post.id} post={post} />)}
      {newPosts &&
        newPosts.map(newPost => <MiniPostPreview key={utilService.makeId()} newPost={newPost} />)}
    </section>
  );
};
