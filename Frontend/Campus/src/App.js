import React, { useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import OptionMenu from "./pages/OptionMenu";
import Block from "./pages/Block";
import Room from "./pages/Room";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import MyComplaint from "./pages/MyComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext.js";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Landing />;
  
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Landing />;
  }
  
  return children;
}

function AppContent() {
  const [page, setPage] = useState("home");
  const [block, setBlock] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const { user } = useAuth();
  const collegeId = user?.id || '';
  
  const goToLogin = () => setPage("login");
  const goToHome = () => setPage("home");

  if (!user && page === "home") return <Landing setPage={goToLogin} />;
  if (!user && page === "login") return <Login setPage={setPage} />;
  if (!user) return <Landing setPage={goToLogin} />;

  // Role-based dashboards
  if (user.role === 'admin') {
    return <AdminDashboard setPage={setPage} />;
  }

  // Maintenance dashboard
  if (user.role === 'maintenance') {
    return <Dashboard setPage={setPage} maintId={collegeId} />;
  }

  // Student/Staff flow
  if (['student', 'staff'].includes(user.role)) {
    if (page === "options") return <OptionMenu setPage={setPage} collegeId={collegeId} />;
    if (page === "blocks") return <ProtectedRoute allowedRoles={['student', 'staff']}><Block setPage={setPage} setBlock={setBlock} collegeId={collegeId} name="" role={user.role} /></ProtectedRoute>;
    if (page === "rooms") return <ProtectedRoute allowedRoles={['student', 'staff']}><Room block={block} setPage={setPage} setSelectedRoom={setSelectedRoom} setBlock={setBlock} collegeId={collegeId} name="" role={user.role} /></ProtectedRoute>;
    if (page === "report") return <ProtectedRoute allowedRoles={['student', 'staff']}><Report selectedRoom={selectedRoom} setPage={setPage} name="" collegeId={collegeId} role={user.role} block={block} /></ProtectedRoute>;
    if (page === "status") return <ProtectedRoute allowedRoles={['student', 'staff']}><MyComplaint collegeId={collegeId} setPage={setPage} /></ProtectedRoute>;
    
    // Default to options for student/staff
    return <OptionMenu setPage={setPage} collegeId={collegeId} />;
  }

  // Default fallback
  return <Landing setPage={goToLogin} />;
}

const AppWithProvider = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default AppWithProvider;

