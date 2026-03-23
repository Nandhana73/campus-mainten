# Login Setup Progress - Make Login Work ✅

Status: 6/6 COMPLETE - Servers running, users seeded, deps fixed. Login fully functional!

## Steps:
- [ ] 1. Install frontend deps: cd Frontend/Campus && npm install axios
- [ ] 2. Seed backend users: cd backend && node utils/seedUsers.js
- [ ] 3. Start backend: cd backend && npm start
- [ ] 4. Start frontend: cd Frontend/Campus && npm start
- [ ] 5. Test API: curl -X POST http://localhost:5000/api/auth/login -H \"Content-Type: application/json\" -d \"{\\\"id\\\":\\\"5678910\\\",\\\"password\\\":\\\"5678\\\"}\"
- [ ] 6. Test browser login: ID=5678910 pw=5678 → admin dashboard; plum4321/plum → maint dash.

Test users:
- Admin: 5678910 / 5678
- Maint: plum4321 / plum, ac4321 / ac, elec4321 / elec, furn4321 / furn
- Student: vda23cs052 / pass (pw not used)

After complete: Login fully working!

