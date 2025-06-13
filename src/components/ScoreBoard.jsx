// src/components/ScoreBoard.jsx
const ScoreBoard = ({ turn, scores }) => (
  <h2>
    {turn}'s Turn | P1: {scores["Player 1"]} | P2: {scores["Player 2"]}
  </h2>
);

export default ScoreBoard;
