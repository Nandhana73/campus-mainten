# Role-Based Dashboard Filter Plan

**Information Gathered:**
- MaintLogin.jsx: 4 roles (plum4321=Plumbing, ac4321=AC, elec4321=Electrical, furn4321=Furniture)
- Complaint model: `problemType` matches exactly ("Plumbing / Leakage", "Air Conditioning", "Electrical / Lights", "Furniture / Cleaning")
- Dashboard.jsx: Filter stub expects maintId → category mapping
- Backend returns all complaints

**Plan:**
1. Frontend map: maintId → problemType filter in Dashboard.jsx filteredComplaints()
2. No backend/model changes (simplest, client-side)

**Mapping:**
```
plum4321 → "Plumbing / Leakage"
ac4321 → "Air Conditioning" 
elec4321 → "Electrical / Lights"
furn4321 → "Furniture / Cleaning"
5678910main → all (supervisor)
```

**Dependent Files:** Frontend/Campus/src/pages/Dashboard.jsx

**Followup:** Refresh → plum4321 login → only Plumbing complaints show.
