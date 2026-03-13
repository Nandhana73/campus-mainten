export default function Landing({ setPage }) {
  return (
    <>
      <h1>Welcome to <span className="mustard">FixMyCampus</span></h1>
      <p className="subtitle">Please select authorization level</p>
      <div className="card-row">
        <button className="tile" onClick={() => setPage("student-login")}>
          <span style={{fontSize: '50px'}}>🎓</span>
          <span style={{fontWeight: '700', marginTop: '15px'}}>Student/Staff</span>
        </button>
        <button className="tile" onClick={() => setPage("maint-login")}>
          <span style={{fontSize: '50px'}}>🛠️</span>
          <span style={{fontWeight: '700', marginTop: '15px'}}>Maintenance</span>
        </button>
        <button className="tile" onClick={() => setPage("admin-login")}>
          <span style={{fontSize: '50px'}}>🔐</span>
          <span style={{fontWeight: '700', marginTop: '15px'}}>Admin Panel</span>
        </button>
      </div>
    </>
  );
}