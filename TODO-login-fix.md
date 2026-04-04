# Login Fix Progress

## Plan Steps:
- [x] 1. Create this TODO and analyze seedUsers.js (found test users: 5678910 pw=5678 admin, others maint/plum etc., vda sample)
- [x] 2. Update authRoutes.js with special 5678910 logic and harden VDA
- [x] 3. Update Login.jsx for direct routing (vda→complaint, 5678910→role-based)
- [ ] 4. Update App.js routing if needed for vda direct complaint
- [ ] 5. Test all 3 login scenarios
- [ ] 6. Complete!

Current: Step 1-2 analysis done. Implementing step 2: authRoutes.js update. seedUsers.js has unwanted test creds (plum/ac etc.), will clean later.
