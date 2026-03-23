# Add Submission Date + Estimated Amount - Steps

- [ ] Step 1: Backend/models/complaint.js - Add `estimatedAmount: { type: Number, default: 0 }`
- [ ] Step 2: Backend/routes/complaintRoutes.js POST / - Include `estimatedAmount` from req.body, save
- [ ] Step 3: Frontend/Campus/src/pages/Report.jsx - Add estimated amount input in form, send in formData
- [ ] Step 4: Update tables (MyComplaint.jsx, Dashboard.jsx, AdminDashboard.jsx) - Add columns for createdAt (formatted date), estimatedAmount
- [ ] Step 5: Backend restart for schema change
- [ ] Step 6: Test submission shows date/amount
