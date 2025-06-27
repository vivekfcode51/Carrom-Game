// utils/redQueenLogic.js
// export const handleRedQueenRule = (coin, currentTurn, scores) => {
//   if (coin.color === "red") {
//     // Example logic — actual rule is more complex
//     alert(`⚠️ ${currentTurn} must cover the red queen soon!`);
//   }
// };

// utils/redQueenLogic.js

export const handleRedQueenRule = ({
  coin,
  turn,
  setQueenPocketed,
  setQueenPocketedBy,
  setQueenCoverPending,
  updateScores,
  queenCoverPending,
  queenPocketedBy,
  setCoins,
  coins,
}) => {
  if (coin.color === "red") {
    // Red queen pocketed
    setQueenPocketed(true);
    setQueenPocketedBy(turn);
    setQueenCoverPending(true);
  } else if (queenCoverPending && turn === queenPocketedBy) {
    // Covering queen successfully
    updateScores(turn, 3); // +3 queen points
    setQueenCoverPending(false);
    setQueenPocketedBy(null);
    setQueenPocketed(false);
  } else {
    // Normal coin
    updateScores(turn, 1);
  }
};


