import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { FC, useEffect } from "react";

type AuthGuardProps = {
  component: React.ReactNode;
};

export const AuthGuard: FC<AuthGuardProps> = ({ component }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedinUser) navigate("/explore");
  }, [loggedinUser, navigate]);

  return <>{component}</>;
};
