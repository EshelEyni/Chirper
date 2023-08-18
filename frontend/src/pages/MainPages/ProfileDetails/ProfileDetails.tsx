import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../../store/store";
import { User } from "../../../../../shared/interfaces/user.interface";
import userService from "../../../services/user.service";
import { useDocumentTitle } from "../../../hooks/app/useDocumentTitle";

const ProfileDetails = () => {
  const [wachedUser, setWachedUser] = useState<User | null>(null);
  useDocumentTitle(`${wachedUser?.fullname} (${wachedUser?.username}) / Chirper`);

  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const params = useParams();
  const navigate = useNavigate();

  const getUser = useCallback(async () => {
    const { username } = params;
    if (!username) {
      navigate("/home");
      return;
    }
    if (loggedInUser?.username === username) {
      setWachedUser(loggedInUser);
      return;
    } else {
      const user = await userService.getByUsername(username);
      setWachedUser(user);
    }
  }, [loggedInUser, params, navigate]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <div>
      <h1>Profile Details Page</h1>
      <pre>{JSON.stringify(wachedUser, null, 2)}</pre>
      <Outlet />
    </div>
  );
};

export default ProfileDetails;
