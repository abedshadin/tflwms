import { useState } from "react";
import api from "../api";
import "./LoginForm.css";

function LoginForm({ onLoginSuccess }) {
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    setLoginError("");
    try {
      const res = await api.post("/auth/login", {
        username: loginUser,
        password: loginPass,
      });

      onLoginSuccess(res.data.token, res.data.username, res.data.role);
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="app-card login-card">
      <h2 className="login-title">Sign in</h2>
      <p className="login-subtitle">
        Enter your credentials to access the inventory system.
      </p>

      <div className="login-form">
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            placeholder="e.g. abed"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            placeholder="Enter password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {loginError && (
          <div className="login-error">
            {loginError}
          </div>
        )}

        <div className="login-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
