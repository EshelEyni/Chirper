import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { FC, useEffect } from "react";

type AuthGuardProps = {
  component: React.ReactNode;
};

export const AuthGuard: FC<AuthGuardProps> = ({ component }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) navigate("/explore");
  }, [loggedInUser, navigate]);

  return <>{component}</>;
};
