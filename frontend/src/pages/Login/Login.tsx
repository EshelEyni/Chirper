import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../store/slices/authSlice";
import "./Login.scss";
import { AppDispatch } from "../../types/app";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [user, setUser] = useState({
    username: "eshel23",
    password: "12341234",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const onLogin = async () => {
    const { username, password } = user;
    await dispatch(login(username, password));
    navigate("/home");
  };

  return (
    <section className="login-page">
      <div>
        <h1>login</h1>
        <div>username</div>
        <input
          type="text"
          name="username"
          onChange={handleChange}
          autoComplete="off"
          value={user.username}
        />
        <div>password</div>
        <input
          type="password"
          name="password"
          onChange={handleChange}
          autoComplete="off"
          value={user.password}
        />
      </div>

      <button onClick={onLogin}>login</button>
    </section>
  );
};

export default LoginPage;
