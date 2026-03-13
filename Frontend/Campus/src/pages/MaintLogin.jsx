import React, { useState } from "react";

export default function MaintLogin({ setPage, setMaintId }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Valid maintenance accounts
  const validMaintUsers = {
    "plum4321": "5678910",
    "ac4321": "5678910",
    "elec4321": "5678910",
    "furn4321": "5678910",
    "5678910main": "4321"
  };


  const handleLogin = () => {
    if (validMaintUsers[userId] && validMaintUsers[userId] === password) {
      localStorage.setItem("maintUser", userId);
      setMaintId(userId);
      setPage("dash");
    } else {
      setError("Invalid ID or Password");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };


  return (
    <div className="login-box">
      <h2>MAINTENANCE <span className="mustard">Login</span></h2>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      {error && <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>{error}</p>}
      <button className="btn-main" onClick={handleLogin}>
        SIGN IN
      </button>
      <p onClick={() => setPage("home")} style={{marginTop: '20px', color: '#bbb', cursor: 'pointer'}}>← Go Back</p>
    </div>
  );
}

