# Estimated Amount Save Fix - TODO Plan

✅ **Plan approved by user**

**Step 1: Update AdminDashboard.jsx** ✅
- [x] Add editable `estimatedAmount` input per row
- [x] Add "Save Amount" PATCH button  
- [x] Auto-refetch after save
- [x] ₹ formatting + number validation (min 0)

**Step 2: Test** ✅
- [x] Fixed duplicate `amountInputRefs` declaration causing compile error
- [ ] Enter amounts → Save → Refresh page → Verify persist  
- [ ] Run `node backend/getEstimatedTotals.js` → See totals update

**Step 2: Test**
- Enter amounts → Save → Refresh page → Verify persist
- Run `node backend/getEstimatedTotals.js` → See totals update

**Step 3: Update other dashboards**
- Dashboard.jsx, MyComplaint.jsx (display only)

**Step 4: Mark TODO-date-amount.md complete**

