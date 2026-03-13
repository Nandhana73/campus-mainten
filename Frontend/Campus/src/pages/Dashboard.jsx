import React, { useState, useEffect, useRef } from "react";

export default function Dashboard({ setPage, maintId }) {


  const [activeIssue, setActiveIssue] = useState(null);
  const [filters, setFilters] = useState({ block: "", type: "", search: "" });
  const [complaints, setComplaints] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [uploadingBill, setUploadingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingBillIndex, setViewingBillIndex] = useState(0);
  const [viewingComplaintId, setViewingComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRefs = useRef({});

  const [showAddStock, setShowAddStock] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newStockItem, setNewStockItem] = useState({ item: "", qty: 0, location: "" });

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/complaint");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stocks");
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchComplaints(), fetchStocks()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaint/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      alert(data.message);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };



  const handleBillUpload = async (complaintId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("bill", file);

    try {
      setUploadingBill(complaintId);

      const res = await fetch(`http://localhost:5000/api/complaint/${complaintId}/bill`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Bill uploaded successfully");
        fetchComplaints();
      } else {
        const data = await res.json();
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploadingBill(null);
    }
  };

  const handleBillDelete = async (complaintId, billIndex) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      const url = `http://localhost:5000/api/complaint/${complaintId}/bill/${billIndex}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        alert("Bill deleted successfully");
        fetchComplaints();
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting bill:", err);
      alert("Error deleting bill");
    }
  };

  const getStatusStyle = (status) => {
    let bg = "#dc3545";
    if (status === "Completed") bg = "#28a745";
    if (status === "Ongoing") bg = "#ffc107";

    return {
      backgroundColor: bg,
      color: status === "Ongoing" ? "#000" : "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "12px 0",
      fontSize: "12px",
      fontWeight: "900",
      width: "160px",
      textAlign: "center",
      cursor: "pointer",
      display: "block",
      margin: "0 auto",
    };
  };

  const filteredComplaints = complaints.filter((item) => {
    const search = filters.search.toLowerCase();
    return (
      (filters.block === "" || item.block === `Block ${filters.block}`) &&
      (filters.type === "" || item.problemType === filters.type) &&
      (
        item.block.toLowerCase().includes(search) ||
        item.name?.toLowerCase().includes(search) ||
        item.roomNo?.toString().includes(search)
      )
    );
  });

  return (
    <div style={pageBackground}>
      <div style={mainContentWrapper}>

        <div style={topHeader}>
          <h1 style={titleStyle}>
            Maintenance <span className="mustard">Dashboard</span>
          </h1>

          <div style={actionArea}>
            <input
              type="text"
              placeholder="Search..."
              style={smallSearch}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            <select
              style={smallSelect}
              onChange={(e) => setFilters({ ...filters, block: e.target.value })}
            >
              <option value="">All Blocks</option>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
            </select>

            <button className="btn-main" style={logoutBtn} onClick={() => setPage("home")}>
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={formalTable}>
            <thead style={headerContainer}>
              <tr>
                <th style={thStyle}>Raised By</th>
                <th style={thStyle}>Block</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Room</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Bill</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id} style={trStyle}>
                  <td style={tdStyle}>{c.name}</td>
                  <td style={tdStyle}>{c.block}</td>
                  <td style={tdStyle}>{c.problemType}</td>
                  <td style={tdStyle}>{c.roomNo}</td>

                  <td style={tdStyle}>
                    <button onClick={() => setActiveIssue(c.description)} style={issueBtn}>
                      👁️ View
                    </button>
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <input 
                      type="file" 
                      ref={(el) => (fileInputRefs.current[c._id] = el)} 
                      style={{ display: "none" }} 
                      accept="image/*,.pdf"
                      onChange={(e) => handleBillUpload(c._id, e.target.files[0])} 
                    />
                    {c.bill && c.bill.length > 0 ? (
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          style={issueBtn}
                          onClick={() => {
                            setViewingBill(c.bill[0]);
                            setViewingBillIndex(0);
                            setViewingComplaintId(c._id);
                          }}
                        >
                          👁️ View
                        </button>
                        <button
                          style={{
                            ...issueBtn,
                            backgroundColor: "#dc3545",
                            color: "white",
                            borderColor: "#dc3545"
                          }}
                          onClick={() => handleBillDelete(c._id, 0)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: "8px" }}>
                        <button 
                          style={issueBtn}
                          onClick={() => fileInputRefs.current[c._id]?.click()}
                        >
                          📤 Upload Bill
                        </button>
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      style={getStatusStyle(c.status)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Description Modal */}
        {activeIssue && (
          <div style={modalOverlay} onClick={() => setActiveIssue(null)}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#E1AD01" }}>Description</h3>
              <p>{activeIssue}</p>
              <button className="btn-main" onClick={() => setActiveIssue(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Bill Modal */}
        {viewingBill && (
          <div style={modalOverlay} onClick={() => setViewingBill(null)}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#E1AD01", marginBottom: "20px" }}>Bill</h3>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={`http://localhost:5000${viewingBill}`}
                  alt="Bill"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    borderRadius: "10px"
                  }}
                />
                <button
                  onClick={() => {
                    handleBillDelete(viewingComplaintId, viewingBillIndex);
                    setViewingBill(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    fontSize: "18px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
                  }}
                  title="Delete this bill"
                >
                  🗑️
                </button>
              </div>
              <button
                className="btn-main"
                style={{ marginTop: "20px" }}
                onClick={() => setViewingBill(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* STYLES */

const pageBackground = { backgroundColor: "#FDFBF3", minHeight: "100vh", padding: "50px 0", display: "flex", justifyContent: "center" };
const mainContentWrapper = { width: "98%" };
const topHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const actionArea = { display: "flex", gap: "15px", alignItems: "center" };
const titleStyle = { fontSize: "32px", fontWeight: "900" };
const logoutBtn = { width: "130px", padding: "14px", fontWeight: "800" };

const smallSearch = { padding: "14px 20px", borderRadius: "12px", border: "1px solid #ddd", width: "250px" };
const smallSelect = { padding: "14px", borderRadius: "12px", border: "1px solid #ddd" };

const formalTable = { width: "100%", borderCollapse: "separate" };
const headerContainer = { backgroundColor: "#E1AD01" };
const thStyle = { padding: "25px 45px", fontWeight: "900", color: "#fff" };

const trStyle = { borderBottom: "1px solid #eee" };
const tdStyle = { padding: "22px 45px", fontWeight: "600" };

const issueBtn = { background: "#fff", border: "1px solid #bbb", borderRadius: "10px", padding: "10px 20px", fontWeight: "800", cursor: "pointer" };

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center" };
const modalContent = { backgroundColor: "white", padding: "40px", borderRadius: "20px", textAlign: "center" };