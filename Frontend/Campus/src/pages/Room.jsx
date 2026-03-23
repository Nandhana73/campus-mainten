import React from "react";

export default function Room({ block, setPage, setSelectedRoom, setBlock, collegeId, name, role }) {
  const rooms = [101, 102, 103, 201, 202, 203, 301, 302, 303];

  const goToReport = (roomNo) => {
    setSelectedRoom(roomNo.toString());
    setBlock(block);
    setPage("report");
  };

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
            onClick={() => goToReport(r)}
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
