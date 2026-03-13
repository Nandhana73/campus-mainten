import React, { useState, useEffect, useRef } from "react";

export default function AdminDashboard({ setPage }) {
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingBillIndex, setViewingBillIndex] = useState(null);
  const [viewingComplaintId, setViewingComplaintId] = useState(null);
  const [activeIssue, setActiveIssue] = useState(null);
  const [filters, setFilters] = useState({ block: "", type: "", status: "", search: "" });
  const [complaints, setComplaints] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [uploadingBill, setUploadingBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("complaints");
  const [showAddStock, setShowAddStock] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newStockItem, setNewStockItem] = useState({ item: "", qty: 0, location: "" });
  const fileInputRefs = useRef({});

const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/complaint");
      const data = await res.json();
      setComplaints(data);
      
      // Auto-delete old completed complaints when total reaches 50
      const completedCount = data.filter(c => c.status === "Completed").length;
      if (completedCount >= 50) {
        const completedComplaints = data.filter(c => c.status === "Completed");
        // Sort by date (oldest first) and keep only the latest 49
        const toDelete = completedComplaints.slice(0, completedComplaints.length - 49);
        for (const complaint of toDelete) {
          await fetch(`http://localhost:5000/api/complaint/${complaint._id}`, { method: "DELETE" });
        }
        // Refetch after deletion
        const refetchRes = await fetch("http://localhost:5000/api/complaint");
        const refetchData = await refetchRes.json();
        setComplaints(refetchData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stocks");
      const data = await res.json();
      setStocks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await fetch(`http://localhost:5000/api/complaint/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchComplaints();
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Delete complaint?")) return;
    await fetch(`http://localhost:5000/api/complaint/${id}`, { method: "DELETE" });
    fetchComplaints();
  };

  const handleStockChange = async (id, newQty) => {
    await fetch(`http://localhost:5000/api/stocks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty: newQty }),
    });
    fetchStocks();
  };

  const handleAddStock = async () => {
    if (!newStockItem.item || !newStockItem.location) return alert("Fill all fields");
    await fetch("http://localhost:5000/api/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStockItem),
    });
    setNewStockItem({ item: "", qty: 0, location: "" });
    setShowAddStock(false);
    fetchStocks();
  };

  const handleEditStock = (item) => {
    setEditingStock(item);
    setNewStockItem({ item: item.item, qty: item.qty, location: item.location });
    setShowAddStock(true);
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Delete stock?")) return;
    await fetch(`http://localhost:5000/api/stocks/${id}`, { method: "DELETE" });
    fetchStocks();
  };

  const handleSaveEdit = async () => {
    await fetch(`http://localhost:5000/api/stocks/${editingStock._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStockItem),
    });
    setEditingStock(null);
    setNewStockItem({ item: "", qty: 0, location: "" });
    setShowAddStock(false);
    fetchStocks();
  };

  const handleBillUpload = async (complaintId, file) => {
    if (!file) return;
    setUploadingBill(complaintId);
    const formData = new FormData();
    formData.append("bill", file);
    await fetch(`http://localhost:5000/api/complaint/${complaintId}/bill`, { method: "POST", body: formData });
    fetchComplaints();
    setUploadingBill(null);
  };

  const handleBillDelete = async (complaintId, billIndex) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      const url = `http://localhost:5000/api/complaint/${complaintId}/bill/${billIndex}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        alert("Bill deleted successfully!");
        fetchComplaints();
      }
    } catch (err) {
      console.error("Error deleting bill:", err);
      alert("Error deleting bill");
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStocks();
  }, []);

  const filteredComplaints = complaints.filter((item) => {
    const s = filters.search.toLowerCase();
    const match = item.block?.toLowerCase().includes(s) || item.name?.toLowerCase().includes(s) || item.roomNo?.toString().includes(s) || item.collegeId?.toLowerCase().includes(s);
    const blockMatch = !filters.block || item.block === `Block ${filters.block}`;
    return match && blockMatch && (!filters.type || item.problemType === filters.type) && (!filters.status || item.status === filters.status);
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    ongoing: complaints.filter(c => c.status === "Ongoing").length,
    completed: complaints.filter(c => c.status === "Completed").length,
    totalStock: stocks.reduce((sum, item) => sum + item.qty, 0),
  };

  const getStatusStyle = (status) => {
    const colors = { Pending: "#dc3545", Ongoing: "#ffc107", Completed: "#28a745" };
    return { backgroundColor: colors[status] || "#dc3545", color: status === "Ongoing" ? "#000" : "#fff", border: "none", borderRadius: "5px", padding: "5px", fontSize: "10px", fontWeight: "700", width: "80px" };
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") return { backgroundColor: "#dc3545", color: "#fff" };
    if (priority === "Medium") return { backgroundColor: "#ffc107", color: "#000" };
    if (priority === "Low") return { backgroundColor: "#28a745", color: "#fff" };
    return { backgroundColor: "#6c757d", color: "#fff" };
  };

  const handleViewComplaint = (complaint) => {
    const details = `Description: ${complaint.description}`;
    setActiveIssue(details);
  };

  return (
    <div style={{ backgroundColor: "#FDFBF3", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#333" }}>ADMIN <span className="mustard">PANEL</span></h1>
          <button className="btn-main" onClick={() => setPage("home")}>Logout</button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button style={activeTab === "complaints" ? { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#E1AD01", color: "#fff", fontWeight: "700", cursor: "pointer" } : { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#ddd", fontWeight: "700", cursor: "pointer" }} onClick={() => setActiveTab("complaints")}>Complaints ({stats.total})</button>
          <button style={activeTab === "stocks" ? { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#E1AD01", color: "#fff", fontWeight: "700", cursor: "pointer" } : { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#ddd", fontWeight: "700", cursor: "pointer" }} onClick={() => setActiveTab("stocks")}>Stock ({stats.totalStock})</button>
          <button style={activeTab === "stats" ? { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#E1AD01", color: "#fff", fontWeight: "700", cursor: "pointer" } : { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#ddd", fontWeight: "700", cursor: "pointer" }} onClick={() => setActiveTab("stats")}>Statistics</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
        ) : activeTab === "stats" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", textAlign: "center", borderLeft: "4px solid #E1AD01" }}>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>{stats.total}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Total</div>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", textAlign: "center", borderLeft: "4px solid #dc3545" }}>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>{stats.pending}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Pending</div>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", textAlign: "center", borderLeft: "4px solid #ffc107" }}>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>{stats.ongoing}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Ongoing</div>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", textAlign: "center", borderLeft: "4px solid #28a745" }}>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>{stats.completed}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Completed</div>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", textAlign: "center", borderLeft: "4px solid #17a2b8" }}>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>{stocks.length}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Items</div>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", textAlign: "center", borderLeft: "4px solid #6f42c1" }}>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>{stats.totalStock}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Qty</div>
            </div>
          </div>
        ) : activeTab === "stocks" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#333" }}>Stock Management</h2>
              <button style={{ backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "700", cursor: "pointer" }} onClick={() => { setEditingStock(null); setNewStockItem({ item: "", qty: 0, location: "" }); setShowAddStock(true); }}>+ Add Stock</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {stocks.map((item) => (
                <div key={item._id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "15px", width: "160px", boxShadow: "0 3px 10px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: "14px", fontWeight: "800" }}>{item.item}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>{item.location}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700" }}>Qty:</label>
                    <input type="number" min="0" defaultValue={item.qty} style={{ width: "45px", padding: "4px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "11px" }} id={`s-${item._id}`} />
                    <button style={{ backgroundColor: "#E1AD01", color: "white", border: "none", borderRadius: "5px", padding: "4px 8px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }} onClick={() => handleStockChange(item._id, parseInt(document.getElementById(`s-${item._id}`).value))}>Save</button>
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button style={{ background: "none", border: "1px solid #E1AD01", borderRadius: "5px", padding: "4px 8px", fontSize: "10px", fontWeight: "700", cursor: "pointer", color: "#E1AD01" }} onClick={() => handleEditStock(item)}>Edit</button>
                    <button style={{ background: "none", border: "1px solid #dc3545", borderRadius: "5px", padding: "4px 8px", fontSize: "10px", fontWeight: "700", cursor: "pointer", color: "#dc3545" }} onClick={() => handleDeleteStock(item._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
              <input type="text" placeholder="Search..." style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", width: "150px" }} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} onChange={(e) => setFilters({ ...filters, block: e.target.value })}>
                <option value="">All Blocks</option>
                <option value="A">Block A</option><option value="B">Block B</option><option value="C">Block C</option>
              </select>
              <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option>
              </select>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#E1AD01" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>ID</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Name</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Block</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Type</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Room</th>
                    <th style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Priority</th>
                    <th style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Desc</th>
                    <th style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Bill</th>
                    <th style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontWeight: "900", color: "#fff", textTransform: "uppercase" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => (
                    <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{c.collegeId}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{c.name}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{c.block}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{c.problemType}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{c.roomNo}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ 
                          ...getPriorityStyle(c.priority), 
                          padding: "4px 8px", 
                          borderRadius: "10px",
                          fontSize: "10px", 
                          fontWeight: "bold" 
                        }}>
                          {c.priority || "Medium"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}><button style={{ background: "#fff", border: "1px solid #bbb", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", cursor: "pointer" }} onClick={() => handleViewComplaint(c)}>View</button></td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <input type="file" ref={(el) => (fileInputRefs.current[c._id] = el)} style={{ display: "none" }} onChange={(e) => handleBillUpload(c._id, e.target.files[0])} />
                        {c.bill ? (
                          <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                            <button
                              onClick={() => {
                                setViewingBill(c.bill);
                                setViewingBillIndex(0);
                                setViewingComplaintId(c._id);
                              }}
                              style={{ background: "#fff", border: "1px solid #28a745", borderRadius: "4px", padding: "4px 10px", fontSize: "10px", cursor: "pointer", color: "#28a745" }}
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => handleBillDelete(c._id, 0)}
                              style={{ background: "#fff", border: "1px solid #dc3545", borderRadius: "4px", padding: "4px 10px", fontSize: "10px", cursor: "pointer", color: "#dc3545" }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        ) : (
                          <button 
                            style={{ background: "#fff", border: "1px solid #bbb", borderRadius: "4px", padding: "4px 10px", fontSize: "10px", cursor: "pointer" }} 
                            onClick={() => fileInputRefs.current[c._id]?.click()}
                          >
                            📤 Upload
                          </button>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)} style={getStatusStyle(c.status)}>
                          <option value="Pending">Pending</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}><button style={{ background: "#fff", border: "1px solid #dc3545", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", cursor: "pointer", color: "#dc3545" }} onClick={() => handleDeleteComplaint(c._id)}>X</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeIssue && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }} onClick={() => setActiveIssue(null)}>
            <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "15px", width: "400px", textAlign: "center", maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#E1AD01", marginTop: 0 }}>Complaint Details</h3>
              <p style={{ lineHeight: "1.6", color: "#333", fontSize: "14px", textAlign: "left", whiteSpace: "pre-wrap" }}>{activeIssue}</p>
              <button className="btn-main" style={{ marginTop: "15px" }} onClick={() => setActiveIssue(null)}>Close</button>
            </div>
          </div>
        )}

        {viewingBill && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }} onClick={() => setViewingBill(null)}>
            <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "15px", maxWidth: "80%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#E1AD01", marginTop: 0 }}>Bill</h3>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={`http://localhost:5000${viewingBill}`} alt="Bill" style={{ maxWidth: "100%", maxHeight: "50vh", borderRadius: "8px" }} />
                {/* Delete button inside the image */}
                <button
                  onClick={() => {
                    if (viewingComplaintId && viewingBillIndex !== null) {
                      handleBillDelete(viewingComplaintId, viewingBillIndex);
                      setViewingBill(null);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
                  }}
                  title="Delete this image"
                >
                  🗑️
                </button>
              </div>
              <button className="btn-main" style={{ marginTop: "15px" }} onClick={() => setViewingBill(null)}>Close</button>
            </div>
          </div>
        )}

        {showAddStock && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }} onClick={() => { setShowAddStock(false); setEditingStock(null); }}>
            <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "15px", width: "300px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#E1AD01", marginTop: 0 }}>{editingStock ? "Edit" : "Add"} Stock</h3>
              <input type="text" placeholder="Item Name" value={newStockItem.item} onChange={(e) => setNewStockItem({ ...newStockItem, item: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "8px", boxSizing: "border-box" }} />
              <input type="text" placeholder="Location" value={newStockItem.location} onChange={(e) => setNewStockItem({ ...newStockItem, location: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "8px", boxSizing: "border-box" }} />
              <input type="number" placeholder="Quantity" value={newStockItem.qty} onChange={(e) => setNewStockItem({ ...newStockItem, qty: parseInt(e.target.value) })} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "12px", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button className="btn-main" onClick={editingStock ? handleSaveEdit : handleAddStock}>{editingStock ? "Update" : "Add"}</button>
                <button className="btn-main" style={{ backgroundColor: "#666" }} onClick={() => { setShowAddStock(false); setEditingStock(null); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

