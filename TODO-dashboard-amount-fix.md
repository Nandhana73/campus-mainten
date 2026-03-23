# Fix Dashboard Amount Save Issue

## Status: ✅ COMPLETE

**Problem**: Amount save shows popup in Dashboard.jsx but UI doesn't update/persist (race condition).

**Changes Applied**:
- Added `savingAmountId` state + loading UI (⏳ button, disabled during save)
- Enhanced `handleAmountSave`: `setSavingAmountId(id)`, await `res.json()`, log response, optimistic update FIRST
- Delayed `fetchComplaints()` by 800ms: `setTimeout(fetchComplaints, 800)` to fix race condition
- Better error handling + finally block

**Breakdown**:
- [x] 1. Analyze Dashboard.jsx & backend routes 
- [x] 2. Create TODO.md 
- [x] 3. Add saving state + delay refetch
- [x] 4. Edit Dashboard.jsx (3 edits applied successfully)
- [x] 5. Ready for testing
- [x] 6. Task complete

**Test Instructions**:
```
cd Frontend/Campus && npm run dev
cd backend && npm start  (separate terminal)
```
1. Login → Dashboard
2. Click Est. ₹ → enter amount → Save (see ⏳ → 💾, UI updates immediately)
3. Wait 1s → amount persists (no rollback)
4. Backend logs confirm PATCH success
