import React from "react";

export default function Room({ block, setPage, setSelectedRoom, setBlock }) {
  const rooms = [101, 102, 103, 201, 202, 203, 301, 302, 303];

  return (
    <>
      <h1>Block {block} <span className="mustard">Rooms</span></h1>
      <p className="subtitle">Pick a room to report</p>
      <div className="card-row">
        {rooms.map((r) => (
          <button
            key={r}
            className="tile"
            style={{ width: "110px", height: "110px" }}
            onClick={() => {
              setSelectedRoom(r.toString());
              setBlock(block);
              setPage("report");
            }}
          >
            <span style={{ fontWeight: "700" }}>
              {r}
            </span>
          </button>
        ))}
      </div>
      <p
        onClick={() => setPage("blocks")}
        style={{ marginTop: "30px", color: "#bbb", cursor: "pointer" }}
      >
        ← Back to Blocks
      </p>
    </>
  );
}
