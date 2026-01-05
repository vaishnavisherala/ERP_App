import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      alert("Login successful!");
      // later redirect to dashboard
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-overlay">
        <div className="login-card">
          <h2 className="title">Garments ERP</h2>
          <p className="subtitle">Please login to your account</p>

          <input
            className="input"
            type="email"
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" onClick={handleLogin}>
            Log In
          </button>
          <div className="roles">
            <button className="r green">Super Admin</button>
            <button className="r blue">Admin</button>
            <button className="r purple">Manager</button>
            <button className="r pink">Merchandiser</button>
            <button className="r dark">Commercial</button>
            <button className="r brown">Accountants</button>
            <button className="r orange">Production</button>
            <button className="r cyan">Buyer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
