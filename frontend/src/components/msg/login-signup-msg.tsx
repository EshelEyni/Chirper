import { useNavigate } from "react-router-dom";

export const LoginSignupMsg = () => {
  const navigate = useNavigate();

  const goToPage = (path: string) => {
    navigate(path);
  };

  return (
    <div className="login-signup-msg">
      <div className="login-signup-msg-text-container">
        <h1>{`Don't miss what's happening`}</h1>
        <p>People on Chirper are the first to know</p>
      </div>
      <div className="login-signup-msg-btn-container">
        <button
          className="btn-login"
          onClick={() => {
            goToPage("/login");
          }}
        >
          Log in
        </button>
        <button
          className="btn-signup"
          onClick={() => {
            goToPage("/signup");
          }}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};
