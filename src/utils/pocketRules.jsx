// // utils/pocketRules.js
const pockets = [
  { x: 0, y: 0 },
  { x: 600, y: 0 },
  { x: 0, y: 600 },
  { x: 600, y: 600 },
];

export const checkPocket = (coin) => {
  for (const pocket of pockets) {
    if (Math.hypot(pocket.x - coin.x, pocket.y - coin.y) < 20) {
      return { pocketed: true };
    }
  }
  return { pocketed: false };
};




// // utils/pocketRules.js
// const pockets = [
//   { x: 0, y: 0 },
//   { x: 600, y: 0 },
//   { x: 0, y: 600 },
//   { x: 600, y: 600 },
// ];

// // Accepts playSound function, isStriker flag, and optional callback
// export const checkPocket = (coin, playSound, isStriker = false, onQueenPocket = () => {}) => {
//   const speed = Math.hypot(coin.vx || 0, coin.vy || 0);

//   for (const pocket of pockets) {
//     const d = Math.hypot(pocket.x - coin.x, pocket.y - coin.y);
//     if (d < 20 && speed < 0.5 && !coin.pocketed) {
//       coin.pocketed = true;

//       // Handle special cases
//       if (coin.color === "red") {
//         playSound("queen-pocket");
//         onQueenPocket();
//       } else if (isStriker) {
//         playSound("striker-pocket");
//       } else {
//         playSound("coin-pocket");
//       }

//       return { pocketed: true };
//     }
//   }

//   return { pocketed: false };
// };

