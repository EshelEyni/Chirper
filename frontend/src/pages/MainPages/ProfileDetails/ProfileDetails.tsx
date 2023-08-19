import { Outlet, useParams } from "react-router-dom";
import { useDocumentTitle } from "../../../hooks/app/useDocumentTitle";
import "./ProfileDetails.scss";
import { useQueryUserWithPosts } from "../../../hooks/user/useQueryUserWithPosts";
import { PostList } from "../../../components/Post/PostList/PostList";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { PostPreviewProvider } from "../../../contexts/PostPreviewContext";
import { PostPreview } from "../../../components/Post/PostPreview/PostPreview/PostPreview";

const ProfileDetails = () => {
  const params = useParams();
  const { username } = params;
  const { user, posts, isLoading, isSuccess, isError } = useQueryUserWithPosts(username || "");
  useDocumentTitle(`${user?.fullname} (${user?.username}) / Chirper`);

  return (
    <main className="profile-details">
      <h1>Profile Details Page</h1>
      {isLoading && <p>Loading...</p>}
      {isSuccess && user && (
        <>
          <div className="profile-details__user">
            <img className="profile-details__user-avatar" src={user.imgUrl} alt="user-avatar" />
            <div className="profile-details__user-info">
              <h2 className="profile-details__user-fullname">{user.fullname}</h2>
              <p className="profile-details__user-username">@{user.username}</p>
            </div>
          </div>
          <div className="profile-details__user-posts">
            <PostList
              posts={posts as Post[]}
              render={(post: Post) => (
                <PostPreviewProvider post={post} key={`${post.id}-${post.createdAt}`}>
                  <PostPreview />
                </PostPreviewProvider>
              )}
            />{" "}
          </div>
        </>
      )}

      {isError && <p>Something went wrong</p>}

      <Outlet />
    </main>
  );
};

export default ProfileDetails;
