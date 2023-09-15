import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup } from "../../store/slices/authSlice";
import "./Signup.scss";
import { AppDispatch } from "../../types/app";

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [user, setUser] = useState({
    username: "eshel2",
    fullname: "eshel eyni",
    email: "eshel2@email.com",
    password: "eshel123",
    passwordConfirm: "eshel123",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const onSignup = async () => {
    await dispatch(signup(user));
    navigate("/home");
  };

  return (
    <section className="signup-page">
      <div>
        <h1>signup</h1>
        <div>username</div>
        <input
          type="text"
          name="username"
          onChange={handleChange}
          autoComplete="off"
          value={user.username}
        />
        <div>fullname</div>
        <input type="text" name="fullname" onChange={handleChange} autoComplete="off" />
        <div>email</div>
        <input
          type="text"
          name="email"
          onChange={handleChange}
          autoComplete="off"
          value={user.email}
        />
        <div>password</div>
        <input
          type="password"
          name="password"
          onChange={handleChange}
          autoComplete="off"
          value={user.password}
        />
        <div>passwordConfirm</div>
        <input
          type="password"
          name="passwordConfirm"
          onChange={handleChange}
          autoComplete="off"
          value={user.passwordConfirm}
        />
      </div>

      <button onClick={onSignup}>signup</button>
    </section>
  );
};

export default SignupPage;
