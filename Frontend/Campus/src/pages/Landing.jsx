export default function Landing({ setPage }) {
  return (
    <>
      <h1>Welcome to <span className="mustard">FixMyCampus</span></h1>
      <p className="subtitle">Unified Login for all roles</p>
      <div className="card-row">
        <button className="tile" onClick={() => setPage("login")}>
          <span style={{fontSize: '50px'}}>🔐</span>
          <span style={{fontWeight: '700', marginTop: '15px'}}>Unified Login</span>
        </button>
      </div>
    </>
  );
}

