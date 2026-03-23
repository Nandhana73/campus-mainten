import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";

export default function AdminDashboard({ setPage }) {
  const { logout } = useAuth();
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingBillIndex, setViewingBillIndex] = useState(null);
  const [viewingComplaintId, setViewingComplaintId] = useState(null);
  const [activeIssue, setActiveIssue] = useState(null);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [editingAmountId, setEditingAmountId] = useState(null);
  const amountInputRefs = useRef({});
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
      const res = await fetch("http://localhost:5000/api/complaint", { cache: 'no-store' });
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
        const refetchRes = await fetch("http://localhost:5000/api/complaint", { cache: 'no-store' });
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
      const res = await fetch("http://localhost:5000/api/stocks", { cache: 'no-store' });
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

  const handleAmountChange = async (id) => {
    const input = amountInputRefs.current[id];
    if (!input) return;
    
    const newAmount = parseFloat(input.value);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid amount (₹0 or more)");
      return;
    }
    
    try {
      await fetch(`http://localhost:5000/api/complaint/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedAmount: newAmount }),
      });
      // Optimistic update
      setComplaints(prev => prev.map(comp => 
        comp._id === id 
          ? { ...comp, estimatedAmount: newAmount }
          : comp
      ));
      fetchComplaints(); // Backup refetch
      setEditingAmountId(null);
      alert(`Amount updated to ₹${newAmount.toLocaleString('en-IN')}`);
    } catch (err) {
      console.error("Error saving amount:", err);
      alert("Error saving amount");
    }
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

  const activeTabStyle = {
    padding: "10px 20px", 
    borderRadius: "8px", 
    border: "none", 
    backgroundColor: "#E1AD01", 
    color: "#fff", 
    fontWeight: "700", 
    cursor: "pointer"
  };

  const inactiveTabStyle = {
    padding: "10px 20px", 
    borderRadius: "8px", 
    border: "none", 
    backgroundColor: "#ddd", 
    fontWeight: "700", 
    cursor: "pointer"
  };

  return (
    <div style={{ backgroundColor: "#FDFBF3", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#333" }}>ADMIN <span className="mustard">PANEL</span></h1>
          <button className="btn-main" onClick={logout}>Logout</button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button style={activeTab === "complaints" ? activeTabStyle : inactiveTabStyle} onClick={() => setActiveTab("complaints")}>Complaints ({stats.total})</button>
          <button style={activeTab === "stocks" ? activeTabStyle : inactiveTabStyle} onClick={() => setActiveTab("stocks")}>Stocks ({stats.totalStock})</button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
        {activeTab === "complaints" && (
          <>
            {/* Filters */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input 
                placeholder="Search..." 
                value={filters.search} 
                onChange={(e) => setFilters({...filters, search: e.target.value})} 
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} 
              />
              <select onChange={(e) => setFilters({...filters, block: e.target.value})} style={{ padding: "10px", borderRadius: "8px" }}>
                <option value="">All Blocks</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <select onChange={(e) => setFilters({...filters, status: e.target.value})} style={{ padding: "10px", borderRadius: "8px" }}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Complaints Table */}
            <div style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#E1AD01", color: "white" }}>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>ID</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Date</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Block/Room</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Student</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Type</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Status</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Amount</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((comp) => (
                    <tr key={comp._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px", fontSize: "14px" }}>{comp._id.slice(-8)}</td>
                      <td style={{ padding: "12px", fontSize: "14px", color: "#666" }}>{comp.createdAt ? new Date(comp.createdAt).toLocaleDateString() : new Date(parseInt(comp._id.substring(0, 8), 16) * 1000).toLocaleDateString()}</td>
                      <td style={{ padding: "12px", fontSize: "14px" }}>{comp.block} {comp.roomNo}</td>
                      <td style={{ padding: "12px", fontSize: "14px" }}>{comp.name || comp.collegeId}</td>
                      <td style={{ padding: "12px", fontSize: "14px" }}>{comp.problemType}</td>
                      <td style={{ padding: "12px" }}>
                        <select 
                          value={comp.status} 
                          onChange={(e) => handleStatusChange(comp._id, e.target.value)}
                          style={getStatusStyle(comp.status)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {editingAmountId === comp._id ? (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input 
                              ref={el => amountInputRefs.current[comp._id] = el} 
                              defaultValue={comp.estimatedAmount || 0} 
                              type="number"
                              style={{ width: "80px", padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                            />
                            <button onClick={() => handleAmountChange(comp._id)} style={{ marginLeft: "5px", padding: "5px 10px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save</button>
                            <button onClick={() => setEditingAmountId(null)} style={{ marginLeft: "5px", padding: "5px 10px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>₹{(comp.estimatedAmount || 0).toLocaleString('en-IN')}</span>
                            <button onClick={() => setEditingAmountId(comp._id)} style={{ marginLeft: "8px", padding: "3px 8px", background: "#ffc107", color: "#000", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
                              {comp.estimatedAmount ? "Edit" : "Set"}
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button onClick={() => setActiveComplaint(comp)} style={{ marginRight: "5px", padding: "5px 10px", background: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>View</button>
                        <button onClick={() => handleDeleteComplaint(comp._id)} style={{ padding: "5px 10px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredComplaints.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#888" }}>No complaints match filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* View Complaint Modal */}
            {activeComplaint && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                {(() => {
                  const currentComplaint = complaints.find(c => c._id === activeComplaint._id) || activeComplaint;
                  return (
                    <div style={{ background: "white", padding: "30px", borderRadius: "12px", maxWidth: "600px", width: "90%", maxHeight: "80vh", overflow: "auto" }}>
                      <h3 style={{ marginTop: 0, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>Complaint Details</h3>
                      <div style={{ padding: "15px 0" }}>
                        <p style={{ margin: "5px 0" }}><strong>ID:</strong> {currentComplaint._id}</p>
                        <p style={{ margin: "5px 0" }}><strong>Date:</strong> {currentComplaint.createdAt ? new Date(currentComplaint.createdAt).toLocaleDateString() : new Date(parseInt(currentComplaint._id.substring(0, 8), 16) * 1000).toLocaleDateString()}</p>
                        <p style={{ margin: "5px 0" }}><strong>Student:</strong> {currentComplaint.name || currentComplaint.collegeId} ({currentComplaint.phone || "N/A"})</p>
                        <p style={{ margin: "5px 0" }}><strong>Location:</strong> {currentComplaint.block} {currentComplaint.roomNo}</p>
                        <p style={{ margin: "5px 0" }}><strong>Type:</strong> {currentComplaint.problemType}</p>
                        <p style={{ margin: "5px 0", padding: "10px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #eee" }}><strong>Description:</strong><br />{currentComplaint.description || "No description provided."}</p>
                      </div>
                      
                      <div style={{ marginTop: "15px", borderTop: "1px solid #ddd", paddingTop: "15px" }}>
                        <h4 style={{ margin: "0 0 10px 0" }}>Bills / Attachments</h4>
                        {currentComplaint.bills && currentComplaint.bills.length > 0 ? (
                          <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
                            {currentComplaint.bills.map((bill, idx) => (
                              <li key={idx} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <a href={`http://localhost:5000/${bill.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" style={{ color: "#007bff", textDecoration: "none", fontWeight: "600" }}>📄 View Bill {idx + 1}</a>
                                <button onClick={() => handleBillDelete(currentComplaint._id, idx)} style={{ padding: "3px 8px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ color: "#777", fontSize: "14px", fontStyle: "italic", marginBottom: "15px" }}>No bills uploaded for this complaint.</p>
                        )}
                        
                        <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <input type="file" ref={(el) => fileInputRefs.current[currentComplaint._id] = el} style={{ flex: 1, fontSize: "14px", minWidth: "200px" }} />
                          <button 
                            onClick={() => {
                              const fileInput = fileInputRefs.current[currentComplaint._id];
                              if (fileInput && fileInput.files[0]) {
                                handleBillUpload(currentComplaint._id, fileInput.files[0]);
                                fileInput.value = "";
                              }
                            }} 
                            disabled={uploadingBill === currentComplaint._id}
                            style={{ padding: "8px 16px", background: "#E1AD01", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                          >
                            {uploadingBill === currentComplaint._id ? "Uploading..." : "Upload Bill"}
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => setActiveComplaint(null)} style={{ padding: "10px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Close</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
        {activeTab === "stocks" && (
          <>
            {/* Add Stock Form */}
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Add/Edit Stock</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <input 
                  placeholder="Item name" 
                  value={newStockItem.item}
                  onChange={(e) => setNewStockItem({...newStockItem, item: e.target.value})}
                  style={{ flex: 1, minWidth: "150px", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  value={newStockItem.qty}
                  onChange={(e) => setNewStockItem({...newStockItem, qty: parseInt(e.target.value) || 0})}
                  style={{ width: "120px", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
                <input 
                  placeholder="Location" 
                  value={newStockItem.location}
                  onChange={(e) => setNewStockItem({...newStockItem, location: e.target.value})}
                  style={{ flex: 1, minWidth: "150px", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
                <button onClick={handleAddStock} style={{ padding: "12px 24px", background: "#E1AD01", color: "white", border: "none", borderRadius: "8px", fontWeight: "700" }}>
                  {editingStock ? 'Update' : 'Add Stock'}
                </button>
                {editingStock && <button onClick={() => {setEditingStock(null); setNewStockItem({item:'',qty:0,location:''}); setShowAddStock(false);}} style={{ padding: "12px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "8px" }}>Cancel</button>}
              </div>
            </div>

            {/* Stocks Table */}
            <div style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#E1AD01", color: "white" }}>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Item</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Qty</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Location</th>
                    <th style={{ padding: "15px 12px", fontWeight: "700" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>{stock.item}</td>
                      <td style={{ padding: "12px", fontWeight: "700", color: "#E1AD01" }}>{stock.qty}</td>
                      <td style={{ padding: "12px" }}>{stock.location}</td>
                      <td style={{ padding: "12px" }}>
                        <button onClick={() => handleEditStock(stock)} style={{ marginRight: "5px", padding: "6px 12px", background: "#ffc107", color: "#000", border: "none", borderRadius: "4px" }}>Edit</button>
                        <button onClick={() => handleDeleteStock(stock._id)} style={{ padding: "6px 12px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {stocks.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#888" }}>No stock items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

          </div>
        )}
      </div>
    </div>
  );
}
