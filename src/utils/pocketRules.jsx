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

