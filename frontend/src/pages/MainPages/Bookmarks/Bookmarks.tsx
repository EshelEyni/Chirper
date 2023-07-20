import { useEffect, useState } from "react";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { postService } from "../../../services/post.service";

export const BookmarksPage = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  useEffect(() => {
    getBookmarkedPosts();

    document.title = "Bookmarks / Chirper";
  }, []);

  const getBookmarkedPosts = async () => {
    const posts = await postService.getBookmarkedPosts();
    setBookmarkedPosts(posts);
  };

  return (
    <div>
      <h1>Bookmarks Page</h1>
      <h4>Nums of Posts: {bookmarkedPosts.length}</h4>
      {bookmarkedPosts.length > 0 && (
        <div style={{ width: "600px", overflow: "hidden" }}>
          {bookmarkedPosts.map(post => (
            <pre key={post.id}>{JSON.stringify(post, null, 2)}</pre>
          ))}
        </div>
      )}
    </div>
  );
};
