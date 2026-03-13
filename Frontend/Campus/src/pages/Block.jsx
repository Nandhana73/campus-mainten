import React from "react";

export default function Block({ setPage, setBlock }) {
  return (
    <>
      <h1>Select <span className="mustard">Block</span></h1>
      <p className="subtitle">Choose a building</p>
      <div className="card-row">
        {["A", "B", "C", "D", "E"].map(b => (
          <button key={b} className="tile" style={{width: '150px', height: '150px'}} 
                  onClick={() => {setBlock(b); setPage("rooms");}}>
            <span style={{fontWeight: '700'}}>Block {b}</span>
          </button>
        ))}
      </div>
      <p onClick={() => setPage("home")} style={{marginTop: '30px', color: '#bbb', cursor: 'pointer'}}>Logout</p>
    </>
  );
}
