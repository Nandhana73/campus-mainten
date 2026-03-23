export default function Landing({ setPage }) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <h1>Welcome to <span className="mustard">FixMyCampus</span></h1>
        <p className="subtitle" style={{ marginBottom: "30px" }}>Unified Login for all roles</p>
        <div className="card-row">
          <button className="tile" onClick={() => setPage("login")}>
            <span style={{fontSize: '50px'}}>🔐</span>
            <span style={{fontWeight: '700', marginTop: '15px'}}>Unified Login</span>
          </button>
        </div>
      </div>
    </>
  );
}

