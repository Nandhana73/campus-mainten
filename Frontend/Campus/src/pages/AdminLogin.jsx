import React, { useState } from "react";

export default function AdminLogin({ setPage }) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Admin credentials: ID: 5678910, Password: admin1234
    if (adminId === "5678910" && password === "admin1234") {
      setError("");
      setPage("admin-dash");
    } else {
      setError("Invalid Admin ID or Password");
    }
  };

  return (
    <div className="login-box">
      <h2>ADMIN <span className="mustard">Login</span></h2>
      <input 
        type="text" 
        placeholder="Admin ID" 
        value={adminId}
        onChange={(e) => setAdminId(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>{error}</p>}
      <button className="btn-main" onClick={handleLogin}>SIGN IN</button>
      <p onClick={() => setPage("home")} style={{marginTop: '20px', color: '#bbb', cursor: 'pointer'}}>← Go Back</p>
    </div>
  );
}

