// import React from "react";

// import React from "react";

// const ScoreBoard = ({ turn, scores, mode }) => (
//   <h3 style={{ textAlign: "center" }}>
//     {turn}'s Turn |{" "}
//     <span
//       style={{
//         fontWeight: turn === "Player 1" ? "bold" : "normal",
//         color: turn === "Player 1" ? "#FC7973" : "",
//       }}
//     >
//       🟢 Player 1: {scores["Player 1"]}
//     </span>{" "}
//     |{" "}
//     <span
//       style={{
//         fontWeight: turn === "Player 2" ? "bold" : "normal",
//         color: turn === "Player 2" ? "#FC7973" : "",
//       }}
//     >
//       🔵 Player 2: {scores["Player 2"]}
//     </span>{" "}
//     |{" "}
//     <span
//       style={{
//         fontSize: "0.95rem",
//         color: "#aaa",
//         marginLeft: "5px",
//       }}
//     >
//       Mode:{" "}
//       {mode === "bot" ? "Player 1 vs Bot 🤖" : "Player 1 vs Player 2 👥"} (
//       {scores["Player 1"]} : {scores["Player 2"]})
//     </span>
//   </h3>
// );

// export default ScoreBoard;

// src/components/ScoreBoard.jsx
import React from "react";

const ScoreBoard = ({ turn, scores, mode }) => {
  const opponent = mode === "bot" ? "Bot" : "Player 2";

  return (
    <h3>
      {turn}'s Turn |{" "}
      <span
        style={{
          fontWeight: turn === "Player 1" ? "bold" : "normal",
          color: turn === "Player 1" ? "#FC7973" : turn === opponent ? "#FC7973" : "",
        }}
      >
        🟢 Player 1: {scores["Player 1"]}
      </span>{" "}
      |{" "}
      <span
        style={{
          fontWeight: turn === opponent ? "bold" : "normal",
          color: turn === opponent ? "#FC7973" : "",
        }}
      >
        {mode === "bot" ? "🤖" : "🔵"} {opponent}: {scores[opponent]}
      </span>
    </h3>
  );
};

export default ScoreBoard;


