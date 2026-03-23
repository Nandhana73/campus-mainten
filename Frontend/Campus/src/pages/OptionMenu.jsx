import React from "react";
import { useAuth } from "../context/AuthContext.js";

export default function OptionMenu({ setPage }) {
  const { user, logout } = useAuth();
  const collegeId = user?.id || '';
  return (
    <>
      <h1>What would you <span className="mustard">like to do?</span></h1>
      <p className="subtitle">Select an action to proceed</p>
      <p style={{fontSize: '14px', color: '#E1AD01', margin: '10px 0', fontWeight: 'bold'}}>Logged in as: {collegeId} ({user?.role})</p>
      
      <div className="card-row">
        {/* Option 1: Raise Complaint */}
        <button className="tile" onClick={() => setPage("blocks")}>
          <span style={{fontSize: '50px'}}>📝</span>
          <span style={{fontWeight: '700', marginTop: '15px'}}>Raise Complaint</span>
        </button>

        {/* Option 2: Check Status */}
       <button className="tile" onClick={() => setPage("status")}>
  <span style={{fontSize: '50px'}}>🔍</span>
  <span style={{fontWeight: '700', marginTop: '15px'}}>Check Complaint Status</span>
</button>
      </div>

      <p onClick={logout} style={{marginTop: '30px', color: '#bbb', cursor: 'pointer'}}>
        ← Logout
      </p>
    </>
  );
}