import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";

export default function Report({ selectedRoom, setPage, block }) {
  const { user } = useAuth();
  const collegeId = user?.id || '';
  const name = '';
  const role = user?.role || 'student';
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [uploading, setUploading] = useState(false);
  const [existingComplaints, setExistingComplaints] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);


// -------- FETCH ROOM COMPLAINTS (ALL COLLEGE COMPLAINTS - CAMPUS WIDE) --------
  const fetchRoomComplaints = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaint`);

      if (res.ok) {
        const allComplaints = await res.json();

        const roomComplaints = allComplaints
          .filter(
            (c) =>
              c.block === `Block ${block}` &&
              c.roomNo === selectedRoom
          )
          .reverse();

        setExistingComplaints(roomComplaints);
      }
    } catch (err) {
      console.error("Error fetching room complaints:", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  // -------- LOAD COMPLAINTS WHEN PAGE LOADS --------
  useEffect(() => {
    fetchRoomComplaints();
  }, [collegeId, block, selectedRoom]);



  // -------- SUBMIT COMPLAINT --------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!description.trim()) {
      alert("Please describe the problem");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("collegeId", collegeId);
      formData.append("role", role);
      formData.append("block", `Block ${block}`);
      formData.append("roomNo", selectedRoom);
      formData.append("problemType", category);
      formData.append("description", description);
      formData.append("estimatedAmount", 0);

      const res = await fetch("http://localhost:5000/api/complaint", {
        method: "POST",
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);

        setCategory("");
        setDescription("");

        fetchRoomComplaints(); // refresh issues list
      } else {
        alert(result.message || "Error submitting complaint");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert(
        "Error: Unable to connect to server. Please make sure backend server is running on port 5000."
      );
    } finally {
      setUploading(false);
    }
  };

  // -------- STATUS STYLE --------
  const getStatusStyle = (status) => {
    let bg = "#dc3545";
    if (status === "Completed") bg = "#28a745";
    if (status === "Ongoing") bg = "#ffc107";

    return {
      backgroundColor: bg,
      color: status === "Ongoing" ? "#000" : "#fff",
      borderRadius: "8px",
      padding: "8px 15px",
      fontSize: "12px",
      fontWeight: "900",
      textAlign: "center",
      display: "inline-block",
      minWidth: "120px",
    };
  };

  return (
    <div style={pageBackground}>

      <div className="login-box" style={{ marginBottom: "60px" }}>
        <div className="room-pill">ROOM {selectedRoom}</div>

        <h2>
          Report <span className="mustard">Issue</span>
        </h2>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option>Electrical / Lights</option>
          <option>Plumbing / Leakage</option>
          <option>Air Conditioning</option>
          <option>Furniture / Cleaning</option>
        </select>

        <textarea
          placeholder="Describe the problem here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: "100px" }}
        />


        <button
          className="btn-main"
          onClick={handleSubmit}
          disabled={uploading}
        >
{uploading ? "SUBMITTING..." : "SUBMIT REPORT"}
        </button>



        <p
          onClick={() => setPage("rooms")}
          style={{ marginTop: "20px", color: "#bbb", cursor: "pointer" }}
        >
          ← Cancel
        </p>
      </div>

      <div style={mainContentWrapper}>
        <div style={{ ...topHeader, marginBottom: "30px" }}>
          <h2 style={titleStyle}>
            Existing Issues <span className="mustard">In This Room</span>
          </h2>
        </div>

        <div style={tableWrapper}>
          {loadingIssues ? (
            <p>Loading issues...</p>
          ) : existingComplaints.length === 0 ? (
            <p>No existing issues in this room.</p>
          ) : (
            <table style={formalTable}>
              <thead>
                <tr style={headerRowFloating}>
                  <th style={{ ...thStyle, borderTopLeftRadius: "15px" }}>Category</th>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: "center", borderTopRightRadius: "15px" }}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {existingComplaints.map((c) => (
                  <tr key={c._id} style={trStyle}>
                    <td style={tdStyle}>{c.problemType}</td>
                    <td style={{ ...tdStyle, fontStyle: "italic", color: "#666" }}>
                      {c.description}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={getStatusStyle(c.status)}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// -------- STYLES --------
const pageBackground = {
  backgroundColor: "#fcfaf5",
  minHeight: "100vh",
  padding: "90px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const mainContentWrapper = { width: "98%" };

const topHeader = {
  display: "flex",
  justifyContent: "flex-start",
  padding: "0 15px"
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  color: "#333",
  textTransform: "uppercase"
};

const tableWrapper = { width: "100%", overflow: "hidden" };

const formalTable = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0"
};

const headerRowFloating = {
  backgroundColor: "#E1AD01",
  boxShadow: "0 12px 25px rgba(225, 173, 1, 0.35)"
};

const thStyle = {
  padding: "25px 45px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "900",
  color: "#fff",
  textTransform: "uppercase",
  backgroundColor: "#E1AD01"
};

const trStyle = { borderBottom: "1px solid #eee" };

const tdStyle = {
  padding: "22px 45px",
  fontSize: "17px",
  color: "#222",
  fontWeight: "600",
  borderBottom: "1px solid #f0f0f0"
};