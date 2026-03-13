import React, { useEffect, useState } from "react";

export default function MyComplaint({ collegeId, setPage }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      console.log("Fetching complaints for collegeId:", collegeId);
      try {
        const res = await fetch(`http://localhost:5000/api/complaint/by/${collegeId}`);

        if (!res.ok) {
          console.error("Error response:", res.status, res.statusText);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setComplaints(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setLoading(false);
      }
    };

    if (collegeId) {
      fetchComplaints();
    }
  }, [collegeId]);

  const getStatusStyle = (status) => {
    let bg = "#dc3545";
    if (status === "Completed") bg = "#28a745";
    if (status === "Ongoing") bg = "#ffc107";

    return {
      backgroundColor: bg,
      color: status === "Ongoing" ? "#000" : "#fff",
      borderRadius: "8px",
      padding: "8px 15px",
      fontWeight: "900",
      textAlign: "center",
      display: "inline-block",
      minWidth: "120px"
    };
  };

  return (
    <div style={pageWrapper}>

      {/* Image Modal */}
      {viewImage && (
        <div style={modalOverlay} onClick={() => setViewImage(null)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={viewImage} alt="Complaint" style={modalImage} />
            <button style={modalCloseBtn} onClick={() => setViewImage(null)}>
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <div className="login-box" style={loginBoxStyle}>
        <h2>
          My <span className="mustard">Complaints</span>
        </h2>

        <p style={idTextStyle}>ID: {collegeId || "Unknown"}</p>

        {loading ? (
          <p style={noDataStyle}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p style={noDataStyle}>No complaints found for ID: {collegeId}</p>
        ) : (
          <div style={tableContainer}>
            <table style={tableStyle}>
              <thead style={tableHeader}>
                <tr>
                  <th style={thStyle}>Block</th>
                  <th style={thStyle}>Room</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} style={trStyle}>
                    <td style={tdStyle}>{c.block}</td>
                    <td style={tdStyle}>{c.roomNo}</td>
                    <td style={tdStyle}>{c.problemType}</td>

                    <td
                      style={{
                        ...tdStyle,
                        fontStyle: "italic",
                        color: "#666"
                      }}
                    >
                      {c.description}
                    </td>

                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={getStatusStyle(c.status)}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          className="btn-main"
          onClick={() => setPage("options")}
          style={{ marginTop: "20px" }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

/* STYLES */

const pageWrapper = {
  backgroundColor: "#fffdf5",
  minHeight: "100vh",
  width: "100%",
  padding: "90px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box"
};

const loginBoxStyle = {
  background: "white",
  padding: "40px 30px",
  borderRadius: "45px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.05)",
  width: "100%",
  maxWidth: "900px",
  textAlign: "center"
};

const idTextStyle = {
  fontSize: "12px",
  color: "#999",
  margin: "10px 0"
};

const noDataStyle = {
  color: "#666",
  margin: "20px 0"
};

const tableContainer = {
  width: "100%",
  overflowX: "auto",
  marginTop: "20px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "600px"
};

const tableHeader = {
  backgroundColor: "#E1AD01",
  boxShadow: "0 12px 25px rgba(225, 173, 1, 0.35)"
};

const thStyle = {
  padding: "15px 10px",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const trStyle = {
  borderBottom: "1px solid #eee"
};

const tdStyle = {
  padding: "15px 10px",
  fontSize: "14px",
  color: "#333"
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContent = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "90%",
  maxHeight: "90%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const modalImage = {
  maxWidth: "100%",
  maxHeight: "80vh",
  objectFit: "contain"
};

const modalCloseBtn = {
  marginTop: "15px",
  padding: "10px 30px",
  backgroundColor: "#E1AD01",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};