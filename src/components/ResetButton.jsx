// src/components/ResetButton.jsx
import React from "react";
const ResetButton = ({ resetGame }) => (
  <button onClick={resetGame} style={{ marginBottom: "10px" }}>
    🔄 Reset Game
  </button>
);

export default ResetButton;
