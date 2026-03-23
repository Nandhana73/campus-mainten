# Website Fix Progress

**✅ Step 1: Fix Report.jsx syntax error** - Removed stray 'y' at top causing ReferenceError.

**⏳ Pending Steps:**
- [ ] Fix public/index.html malformed tags
- [ ] Clean package.json deps (remove react-scripts, downgrade React 19→18)
- [ ] Fix AuthContext missing base64urlDecode in useEffect
- [ ] Run backend: cd backend && npm i && npm start
- [ ] Run frontend: cd Frontend/Campus && npm i && npm run dev  
- [ ] Test landing → login → navigation
- [ ] Fix WS errors (remove socket code if present)

**Console errors remaining:** WebSocket localhost:3001 (unrelated? vite WS on 5173)


