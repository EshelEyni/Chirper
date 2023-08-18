import { FC } from "react";
import "./ErrorMsg.scss";

type ErrorProps = {
  msg: string;
};

export const ErrorMsg: FC<ErrorProps> = ({ msg }) => {
  return <p className="error-msg">{msg}</p>;
};
