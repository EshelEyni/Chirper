import { useQuery } from "@tanstack/react-query";
import postApiService from "../services/post/postApiService";
import userService from "../services/user/userApiService";
import { useNavigate } from "react-router-dom";

export function useQueryUserWithPosts(username: string) {
  const navigate = useNavigate();

  async function fetchUserWithPosts() {
    if (!username) return navigate("/home");

    const user = await userService.getByUsername(username);
    const posts = await postApiService.query({
      createdById: user.id,
    });
    return { user, posts };
  }

  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: [`user/${username}/posts`],
    queryFn: fetchUserWithPosts,
  });

  const user = data?.user || null;
  const posts = data?.posts || [];
  return { user, posts, error, isLoading, isSuccess, isError };
}
