import { useNavigate } from "react-router-dom";
import "./LoginSignupMsg.scss";

export const LoginSignupMsg = () => {
  const navigate = useNavigate();

  const btns = [
    {
      title: "Log in",
      className: "btn-login",
      path: "/login",
    },
    {
      title: "Sign up",
      className: "btn-signup",
      path: "/signup",
    },
  ];

  return (
    <div className="login-signup-msg">
      <div className="login-signup-msg-text-container">
        <h1>{`Don't miss what's happening`}</h1>
        <p>People on Chirper are the first to know</p>
      </div>
      <div className="login-signup-msg-btn-container">
        {btns.map(btn => (
          <button
            key={btn.title}
            className={btn.className}
            onClick={() => {
              navigate(btn.path);
            }}
          >
            {btn.title}
          </button>
        ))}
      </div>
    </div>
  );
};
