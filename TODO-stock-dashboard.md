# TODO: Stock Management - Admin & Maintenance Dashboards

**Status:** Complete ✅

**Changes:**
- Backend routes /api/stocks public (no auth middleware)
- AdminDashboard.jsx: Full stock CRUD (add/edit/delete) with modal form
- Dashboard.jsx: Stock button + table + form (maintenance)
- testStock.js: Verified MongoDB save/find/delete
- Vite proxy + axios token interceptor working

**Test flow:**
1. Login admin 5678910/5678 → Stock tab → Add stock → Appears
2. Login maint id-1234 → Stock button → Add/edit/delete syncs
3. Statistics tab shows total items/qty

Backend logs confirm 201 Created. UI optimistic + refetch. Working.
