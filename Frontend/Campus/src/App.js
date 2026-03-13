import React, { useState } from "react";
// 1. All Page Imports
import Landing from "./pages/Landing";
import StdLogin from "./pages/StdLogin";
import MaintLogin from "./pages/MaintLogin";
import AdminLogin from "./pages/AdminLogin";
import OptionMenu from "./pages/OptionMenu"; // <-- New Page
import Block from "./pages/Block";
import Room from "./pages/Room";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import MyComplaint from "./pages/MyComplaint";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  // 2. Global State Management
  const [page, setPage] = useState("home");
  const [block, setBlock] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // user info collected during login
  const [name, setName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [role, setRole] = useState("student"); // default student
  const [maintId, setMaintId] = useState(""); // maintenance worker ID

  return (
    <div className="viewport-wrapper">
      
      {/* LANDING PAGE */}
      {page === "home" && <Landing setPage={setPage} />}
      
      {/* LOGIN PAGES */}
      {page === "student-login" && (
        <StdLogin
          setPage={setPage}
          setName={setName}
          setCollegeId={setCollegeId}
          setRole={setRole}
        />
      )}  
      {page === "maint-login" && <MaintLogin setPage={setPage} setMaintId={setMaintId} />}
      {page === "admin-login" && <AdminLogin setPage={setPage} />}
      
      {/* ADMIN DASHBOARD */}
      {page === "admin-dash" && <AdminDashboard setPage={setPage} />}
      

      {/* NEW: OPTION MENU (Shows after Student Login) */}
      {page === "options" && <OptionMenu setPage={setPage} collegeId={collegeId} />}

      {/* COMPLAINT FLOW */}
      {page === "blocks" && <Block setPage={setPage} setBlock={setBlock} />}
      {page === "dash" && <Dashboard setPage={setPage} maintId={maintId} />}
      
      {page === "rooms" && (
        <Room 
          block={block} 
          setPage={setPage} 
          setSelectedRoom={setSelectedRoom}
          setBlock={setBlock}
        />
      )}

      {page === "report" && (
        <Report 
          selectedRoom={selectedRoom} 
          setPage={setPage} 
          name={name}
          collegeId={collegeId}
          role={role}
          block={block}
        />
      )}
{page === "status" && (
  <MyComplaint collegeId={collegeId} setPage={setPage} />
)}
      
    </div>
  );
}