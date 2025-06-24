// src/components/ScoreBoard.jsx
const ScoreBoard = ({ turn, scores }) => (
  <h3>
    {turn}'s Turn |{" "}
    <span style={{ fontWeight: turn === "Player 1" ? "bold" : "normal",
    color: turn === "Player 1" ? "#FC7973" : "",
    }}>
      🟢 Player 1: {scores["Player 1"]}
    </span>{" "}
    |{" "}
    <span style={{ fontWeight: turn === "Player 2" ? "bold" : "normal",
    color: turn === "Player 2" ? "#FC7973" : "",
     }}>
      🔵 Player 2: {scores["Player 2"]}
    </span>
  </h3>
);

export default ScoreBoard
