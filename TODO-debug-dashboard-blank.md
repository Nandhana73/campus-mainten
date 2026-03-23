# Fix Blank Maintenance Dashboard ✅ IN PROGRESS

## Problem
Dashboard.jsx table empty (no complaints/amounts visible)

## Root Causes (Likely)
- [ ] Backend server not running (localhost:5000 down)
- [ ] MongoDB empty (no complaints)
- [ ] Frontend fetch failing silently

## Debug Steps
1. [ ] **Start Backend**: `cd backend && npm start`
2. [ ] **Check Data**: `node backend/getEstimatedTotals.js`
3. [ ] **Populate Test Data**: `node backend/testAmountSave.js`
4. [ ] **Frontend**: `cd Frontend/Campus && npm run dev`
5. [ ] **Test**: Maint Login → Dashboard → See table + amounts

## Expected Result
```
Dashboard shows:
Date | Name | Block | Type | Est. ₹5000 | Room | ...
[Edit] → Save → ✅ ₹5,000 persists
```

## Commands Ready
```
# Terminal 1
cd backend && npm start

# Terminal 2  
node backend/testAmountSave.js
node backend/getEstimatedTotals.js

# Terminal 3
cd Frontend/Campus && npm run dev
```

