// src/components/ResetButton.jsx
const ResetButton = ({ resetGame }) => (
  <button onClick={resetGame} style={{ marginBottom: "10px" }}>
    🔄 Reset Game
  </button>
);

export default ResetButton;
