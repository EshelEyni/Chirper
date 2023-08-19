import { NewPost, Post } from "../../../../../shared/interfaces/post.interface";
import "./PostList.scss";

interface PostListProps<T> {
  posts: T[];
  render: (post: T) => JSX.Element;
}

export const PostList = <T extends Post | NewPost>({ posts, render }: PostListProps<T>) => {
  return <section className="post-list">{posts.map(render)}</section>;
};
