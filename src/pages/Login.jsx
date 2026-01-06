import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      navigate("/dashboard"); // ✅ redirect here

      console.error(error);
      return;
    }

    console.log("Login success:", data);
    navigate("/dashboard"); // ✅ redirect after login
  };

  return (
    <div className="login-wrapper">
      <div className="login-overlay">
        <div className="login-card">
          <h2 className="title">Garments ERP</h2>
          <p className="subtitle">Please login to your account</p>

          {/* EMAIL */}
          <input
            className="input"
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <input
            className="input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* LOGIN BUTTON */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>


          {/* ROLES (UI ONLY FOR NOW) */}
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
