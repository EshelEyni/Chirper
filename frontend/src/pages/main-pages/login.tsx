import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store/types";
import { useDispatch } from "react-redux";
import { login } from "../../store/actions/auth.actions";

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [user, setUser] = useState({
    username: "eshel2",
    password: "eshel123",
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
    navigate("/");
  };

  return (
    <section className="login-page">
      <div>
        <h1>login</h1>
        <div>username</div>
        <input type="text" name="username" onChange={handleChange} autoComplete="off" />
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
