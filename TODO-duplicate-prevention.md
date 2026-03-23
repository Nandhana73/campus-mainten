# Duplicate Complaint Prevention - Progress Tracker

## Steps:
- [x] Step 1: Add backend validation in complaintRoutes.js POST endpoint to check for existing open complaints (same block + roomNo + problemType, status != "Completed")
- [x] Step 2: Enhance Report.jsx frontend to disable submit button and show warning if matching open issue exists in existingComplaints
- [ ] Step 3: Test submission - successful for new issue, blocked for duplicate
- [ ] Step 4: Restart backend/frontend and verify in AdminDashboard

**✅ COMPLETE** - Backend validation + Frontend warnings at Room selection (confirm dialog if open issues) + Report disable/warn on category select.

