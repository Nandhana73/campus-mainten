import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";

export default function Dashboard({ setPage }) {
  const { user, logout } = useAuth();
  const maintId = user?.id || '';

  const [activeIssue, setActiveIssue] = useState(null);
  const [filters, setFilters] = useState({ block: "", type: "", search: "" });
  const [complaints, setComplaints] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [uploadingBill, setUploadingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingBillIndex, setViewingBillIndex] = useState(0);
  const [viewingComplaintId, setViewingComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingAmountId, setEditingAmountId] = useState(null);
  const [savingAmountId, setSavingAmountId] = useState(null);
  const [tempAmountValue, setTempAmountValue] = useState('');

  const fileInputRefs = useRef({});

  const [showAddStock, setShowAddStock] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newStockItem, setNewStockItem] = useState({ item: "", qty: 0, location: "" });

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/complaint", { cache: 'no-store' });
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error('fetchComplaints error:', err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stocks", { cache: 'no-store' });
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

  const handleSaveStock = async (stockData) => {
    try {
      const method = editingStock ? 'PATCH' : 'POST';
      const url = editingStock ? `/api/stocks/${editingStock._id}` : '/api/stocks';
      const res = await fetch(`http://localhost:5000${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData),
      });
      if (res.ok) {
        alert(editingStock ? 'Stock updated' : 'Stock added');
        fetchStocks();
        setShowAddStock(false);
        setEditingStock(null);
        setNewStockItem({ item: "", qty: 0, location: "" });
      } else {
        const data = await res.json();
        alert(data.message || 'Save failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setNewStockItem(stock);
    setShowAddStock(true);
  };

  const handleDeleteStock = async (id) => {
    if (!confirm('Delete stock?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/stocks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Stock deleted');
        fetchStocks();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleStatusChange = async (id, newStatus, newAmount) => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaint/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, estimatedAmount: newAmount }),
      });
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAmountSave = async (id) => {
    const amountStr = tempAmountValue.trim();
    if (!amountStr) {
      alert('Please enter an amount');
      return;
    }
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount (₹0 or more)');
      return;
    }
    
    console.log('Saving amount', amount, 'for complaint', id);
    setSavingAmountId(id);
    
    try {
      const res = await fetch(`http://localhost:5000/api/complaint/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedAmount: amount }),
      });
      
      if (res.ok) {
        // Optimistic update
        setComplaints(prev => prev.map(comp => 
          comp._id === id 
            ? { ...comp, estimatedAmount: amount }
            : comp
        ));
        alert(`✅ Amount updated to ₹${amount.toLocaleString('en-IN')}`);
        setEditingAmountId(null);
        setTempAmountValue('');
        setTimeout(fetchComplaints, 800);
      } else {
        const errorData = await res.json();
        alert(`❌ Save failed: ${errorData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('❌ Network error - check backend');
    } finally {
      setSavingAmountId(null);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/complaint/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Complaint deleted");
        fetchComplaints();
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting complaint");
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
        alert("Bill uploaded");
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
    if (!confirm("Delete this bill?")) return;
    try {
      const url = `http://localhost:5000/api/complaint/${complaintId}/bill/${billIndex}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        alert("Bill deleted");
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
      padding: "10px 16px",
      fontSize: "13px",
      fontWeight: "900",
      width: "100%",
      height: "44px",
      textAlign: "center",
      cursor: "pointer"
    };
  };

  const filteredComplaints = complaints.filter((item) => {
    const search = filters.search.toLowerCase();
    let categoryMatch = true;
    
    const roleMap = {
      'plum4321': 'Plumbing / Leakage',
      'ac4321': 'Air Conditioning',
      'elec4321': 'Electrical / Lights',
      'furn4321': 'Furniture / Cleaning',
      'id-1234': null // sees all
    };
    
    if (maintId && roleMap[maintId] !== undefined) {
      if (roleMap[maintId]) {
        categoryMatch = item.problemType === roleMap[maintId];
      }
    }
    
    return categoryMatch &&
      (filters.block === "" || item.block === `Block ${filters.block}`) &&
      (filters.type === "" || item.problemType === filters.type) &&
      (
        item.block.toLowerCase().includes(search) ||
        item.name?.toLowerCase().includes(search) ||
        item.roomNo?.toString().includes(search)
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
              placeholder="🔍 Search..."
              style={smallSearch}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              style={smallSelect}
              onChange={(e) => setFilters({ ...filters, block: e.target.value })}
            >
              <option value="">All Blocks</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
            <button className="btn-main" style={logoutBtn} onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={formalTable}>
            <thead style={headerContainer}>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Block</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>₹ Amount</th>
                <th style={thStyle}>Room</th>
                <th style={thStyle}>Desc</th>
                <th style={thStyle}>Bill</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id} style={trStyle}>
                  <td style={tdStyle}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>{c.name}</td>
                  <td style={tdStyle}>{c.block}</td>
                  <td style={tdStyle}>{c.problemType}</td>
                  <td style={tdStyle}>
                    {editingAmountId === c._id ? (
                      <div style={amountEditContainer}>
                        <input 
                          type="number" 
                          min="0" step="0.01"
                          value={tempAmountValue}
                          onChange={(e) => setTempAmountValue(e.target.value)}
                          style={amountInput}
                        />
                        <button onClick={() => handleAmountSave(c._id)} disabled={savingAmountId === c._id} style={amountSaveBtn}>
                          {savingAmountId === c._id ? "⏳" : "💾"}
                        </button>
                        <button onClick={() => {setEditingAmountId(null); setTempAmountValue('');}} style={cancelBtnSmall}>✕</button>
                      </div>
                    ) : (
                      <div style={amountDisplay} onClick={() => {
                        setEditingAmountId(c._id);
                        setTempAmountValue((c.estimatedAmount || 0).toString());
                      }}>
                        ₹{Number(c.estimatedAmount || 0).toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>{c.roomNo}</td>
                  <td style={tdStyle}>
                    <button onClick={() => setActiveIssue(c.description)} style={viewBtn}>👁️</button>
                  </td>
                  <td style={billTd}>
                    {c.bill && c.bill.length > 0 ? (
                      <div style={billButtons}>
                        <button style={viewBtn} onClick={() => {
                          setViewingBill(c.bill[0]);
                          setViewingBillIndex(0);
                          setViewingComplaintId(c._id);
                        }}>👁️</button>
                        <button style={deleteBtnSmall} onClick={() => handleBillDelete(c._id, 0)}>🗑️</button>
                      </div>
                    ) : (
                      <button style={uploadBtn} onClick={() => fileInputRefs.current[c._id]?.click()}>📤</button>
                    )}
                    <input type="file" ref={(el) => (fileInputRefs.current[c._id] = el)} style={{ display: "none" }} accept="image/*,.pdf" onChange={(e) => handleBillUpload(c._id, e.target.files[0])} />
                  </td>
                  <td style={statusTd}>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value, c.estimatedAmount || 0)}
                      style={getStatusStyle(c.status)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td style={deleteTd}>
                    <button onClick={() => handleDeleteComplaint(c._id)} style={deleteBtn}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Stock Section - BOTTOM */}
        <div style={stockSection}>
          <div style={stockHeader}>
            <h2 style={stockTitle}>📦 Stock Inventory</h2>
            <button className="btn-main" onClick={() => setShowAddStock(true)}>+ Add Stock</button>
          </div>
          
          {showAddStock && (
            <div style={stockForm}>
              <h3>{editingStock ? 'Edit Stock' : 'Add New Stock'}</h3>
              <div style={formRow}>
                <input placeholder="Item name" value={newStockItem.item} onChange={(e) => setNewStockItem({ ...newStockItem, item: e.target.value })} style={formInput} />
                <input type="number" placeholder="Qty" value={newStockItem.qty} onChange={(e) => setNewStockItem({ ...newStockItem, qty: parseInt(e.target.value) || 0 })} style={formInput} />
                <input placeholder="Location" value={newStockItem.location} onChange={(e) => setNewStockItem({ ...newStockItem, location: e.target.value })} style={formInput} />
              </div>
              <div style={formButtons}>
                <button className="btn-main" onClick={() => handleSaveStock(newStockItem)}>Save</button>
                <button style={cancelBtn} onClick={() => {
                  setShowAddStock(false);
                  setEditingStock(null);
                  setNewStockItem({ item: "", qty: 0, location: "" });
                }}>Cancel</button>
              </div>
            </div>
          )}

          <table style={stockTable}>
            <thead>
              <tr>
                <th style={stockTh}>Item</th>
                <th style={stockTh}>Qty</th>
                <th style={stockTh}>Location</th>
                <th style={stockTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock._id}>
                  <td style={stockTd}>{stock.item}</td>
                  <td style={stockTd}>{stock.qty}</td>
                  <td style={stockTd}>{stock.location}</td>
                  <td style={stockActionTd}>
                    <button onClick={() => handleEditStock(stock)} style={editStockBtn}>Edit</button>
                    <button onClick={() => handleDeleteStock(stock._id)} style={deleteStockBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {activeIssue && (
          <div style={modalOverlay} onClick={() => setActiveIssue(null)}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={modalTitle}>Description</h3>
              <p>{activeIssue}</p>
              <button className="btn-main" onClick={() => setActiveIssue(null)}>Close</button>
            </div>
          </div>
        )}

        {viewingBill && (
          <div style={modalOverlay} onClick={() => setViewingBill(null)}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={modalTitle}>Bill</h3>
              <img src={`http://localhost:5000${viewingBill}`} alt="Bill" style={billModalImg} />
              <button className="btn-main" onClick={() => setViewingBill(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Clean Minimal Styles */
const pageBackground = { backgroundColor: "#FDFBF3", minHeight: "100vh", padding: "50px 0", display: "flex", justifyContent: "center" };
const mainContentWrapper = { width: "98%", maxWidth: "1400px" };
const topHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const titleStyle = { fontSize: "32px", fontWeight: "900", margin: 0 };
const actionArea = { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" };
const smallSearch = { padding: "12px 16px", borderRadius: "10px", border: "1px solid #ddd", width: "220px", fontSize: "14px" };
const smallSelect = { padding: "12px 16px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px" };
const logoutBtn = { fontSize: "14px", padding: "12px 24px" };

const formalTable = { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "15px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", tableLayout: "fixed" };
const headerContainer = { backgroundColor: "#E1AD01" };
const thStyle = { padding: "18px 20px", fontWeight: "900", color: "#fff", fontSize: "13px", textAlign: "left" };
const trStyle = { borderBottom: "1px solid #f5f5f5" };
const tdStyle = { padding: "18px 20px", fontWeight: "600", fontSize: "14px", verticalAlign: "middle" };

const amountEditContainer = { display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" };
const amountInput = { width: "80px", padding: "6px", borderRadius: "6px", border: "1px solid #E1AD01", fontSize: "13px", textAlign: "right" };
const amountSaveBtn = { backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", cursor: "pointer", minWidth: "32px", height: "32px" };
const cancelBtnSmall = { backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", padding: "6px", fontSize: "12px", cursor: "pointer", minWidth: "32px", height: "32px" };
const amountDisplay = { cursor: "pointer", fontWeight: "bold", textAlign: "center", padding: "12px 8px", borderRadius: "6px", border: "1px solid #E1AD01" };

const viewBtn = { backgroundColor: "#fff", border: "1px solid #E1AD01", color: "#E1AD01", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", minWidth: "80px" };
const uploadBtn = { backgroundColor: "#E1AD01", color: "white", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", minWidth: "80px" };
const billTd = { textAlign: "center" };
const billButtons = { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" };
const deleteBtnSmall = { backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", minWidth: "80px" };

const statusTd = { textAlign: "center", padding: "15px 20px !important" };
const deleteTd = { textAlign: "center", width: "100px" };
const deleteBtn = { backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", fontWeight: "900", cursor: "pointer", width: "100%" };

const stockSection = { marginTop: "50px", backgroundColor: "white", borderRadius: "15px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" };
const stockHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" };
const stockTitle = { fontSize: "24px", fontWeight: "900", margin: 0 };
const stockForm = { backgroundColor: "#f8f9fa", padding: "25px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #E1AD01" };
const formRow = { display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" };
const formInput = { flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", minWidth: "180px" };
const formButtons = { display: "flex", gap: "15px", justifyContent: "center" };
const cancelBtn = { backgroundColor: "#6c757d", color: "white" };
const stockTable = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const stockTh = { padding: "15px 20px", backgroundColor: "#E1AD01", color: "white", fontWeight: "900", fontSize: "13px", textAlign: "left" };
const stockTd = { padding: "15px 20px", borderBottom: "1px solid #eee", fontWeight: "600" };
const stockActionTd = { padding: "15px 20px", textAlign: "center" };
const editStockBtn = { backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "8px", padding: "8px 16px", marginRight: "8px", fontWeight: "700", cursor: "pointer" };
const deleteStockBtn = { backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "700", cursor: "pointer" };

const modalOverlay = { position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContent = { backgroundColor: "white", padding: "40px", borderRadius: "20px", textAlign: "center", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto" };
const modalTitle = { color: "#E1AD01", marginBottom: "20px" };
const billModalImg = { maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "10px" };
