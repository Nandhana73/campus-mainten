import React, { useState } from "react";

export default function StdLogin({ setPage, setName, setCollegeId, setRole }) {
  const [inputId, setInputId] = useState("");
  const [inputName, setInputName] = useState("");

  const handleSignIn = () => {
    // Validate required fields
    if (!inputId.trim()) {
      alert("Please enter your ID");
      return;
    }
    if (!inputName.trim()) {
      alert("Please enter your name");
      return;
    }
    
    // store values and transition
    setName(inputName);
    setCollegeId(inputId);
    setRole("student");
    console.log("Sign In clicked!", { inputId, inputName });
    setPage("options");
  };

  return (
    <div className="login-box">
      <h2>Student/Staff <span className="mustard">Login</span></h2>
      <input
        type="text"
        placeholder="ID"
        value={inputId}
        onChange={e => setInputId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Full Name"
        value={inputName}
        onChange={e => setInputName(e.target.value)}
      />
      <button className="btn-main" onClick={handleSignIn}>
        SIGN IN
      </button>
      <p onClick={() => setPage("home")} style={{marginTop: '20px', color: '#bbb', cursor: 'pointer'}}>
        ← Go Back
      </p>
    </div>
  );
}