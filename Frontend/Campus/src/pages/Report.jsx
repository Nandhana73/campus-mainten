import React, { useState } from "react";

export default function Report({ selectedRoom, setPage, name, collegeId, role, block }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [uploading, setUploading] = useState(false);

  const [existingIssues] = useState([
    { id: 1, type: "Electrical", status: "PENDING", description: "Ceiling fan making loud grinding noise." },
    { id: 4, type: "Plumbing", status: "ONGOING", description: "Water leakage in the washroom." },
  ]);



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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("collegeId", collegeId);
      formData.append("role", role);
      formData.append("block", `Block ${block}`);
      formData.append("roomNo", selectedRoom);
      formData.append("problemType", category);
      formData.append("description", description);

      console.log("Submitting complaint");


      const res = await fetch("http://localhost:5000/api/complaint", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      console.log("Response status:", res.status);
      console.log("Response result:", result);
      
      if (res.ok) {
        alert(result.message);
        setPage("options");
      } else {
        alert(result.message || "Error submitting complaint");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Error: Unable to connect to server. Please make sure the backend server is running on port 5000.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusStyle = (status) => {
    let bg = "#dc3545";
    if (status === "COMPLETED") bg = "#28a745";
    if (status === "ONGOING") bg = "#ffc107";

    return {
      backgroundColor: bg,
      color: status === "ONGOING" ? "#000" : "#fff",
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



        <button className="btn-main" onClick={handleSubmit} disabled={uploading}>
          {uploading ? "SUBMITTING..." : "SUBMIT REPORT"}
        </button>

        <p onClick={() => setPage("rooms")} style={{ marginTop: "20px", color: "#bbb", cursor: "pointer" }}>
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
          <table style={formalTable}>
            <thead>
              <tr style={headerRowFloating}>
                <th style={{ ...thStyle, borderTopLeftRadius: "15px" }}>Category</th>
                <th style={thStyle}>Issue Description</th>
                <th style={{ ...thStyle, textAlign: "center", borderTopRightRadius: "15px" }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {existingIssues.map((item) => (
                <tr key={item.id} style={trStyle}>
                  <td style={tdStyle}>{item.type}</td>
                  <td style={{ ...tdStyle, fontStyle: "italic", color: "#666" }}>{item.description}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={getStatusStyle(item.status)}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const pageBackground = { backgroundColor: "#fcfaf5", minHeight: "100vh", padding: "90px 0", display: "flex", flexDirection: "column", alignItems: "center" };
const mainContentWrapper = { width: "98%" };
const topHeader = { display: "flex", justifyContent: "flex-start", padding: "0 15px" };
const titleStyle = { fontSize: "28px", fontWeight: "900", color: "#333", textTransform: "uppercase" };
const tableWrapper = { width: "100%", overflow: "hidden" };
const formalTable = { width: "100%", borderCollapse: "separate", borderSpacing: "0" };
const headerRowFloating = { backgroundColor: "#E1AD01", boxShadow: "0 12px 25px rgba(225, 173, 1, 0.35)" };
const thStyle = { padding: "25px 45px", textAlign: "left", fontSize: "14px", fontWeight: "900", color: "#fff", textTransform: "uppercase", backgroundColor: "#E1AD01" };
const trStyle = { borderBottom: "1px solid #eee" };
const tdStyle = { padding: "22px 45px", fontSize: "17px", color: "#222", fontWeight: "600", borderBottom: "1px solid #f0f0f0" };

