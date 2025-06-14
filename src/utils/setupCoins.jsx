// ✅ We'll now expand CarromBoard.jsx and the related logic step-by-step to support:
// - More coins like real carrom (19 coins: 9 white, 9 black, 1 red)
// - Turn-based system
// - Pocket detection
// - Sound effects
// - Mouse-based aiming and shooting
// - 🚀 NEW: Striker collision with coins
// - 🧲 Realistic friction & rebound

// utils/setupCoins.js
export const setupCoins = () => {
  const coins = [];
  const center = { x: 300, y: 300 };
  const radius = 10;
  const spacing = 24; // slightly larger for real feel

  const pushCoin = (x, y, color) => {
    coins.push({ x, y, radius, color, vx: 0, vy: 0 });
  };

  // Add queen at center
  pushCoin(center.x, center.y, "red");

  // First ring (6 coins, alternating white-black)
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * i) / 6;
    const x = center.x + spacing * Math.cos(angle);
    const y = center.y + spacing * Math.sin(angle);
    const color = i % 2 === 0 ? "white" : "black";
    pushCoin(x, y, color);
  }

  // Second ring (12 coins, alternating white-black)
  for (let i = 0; i < 12; i++) {
    const angle = (2 * Math.PI * i) / 12;
    const x = center.x + spacing * 2 * Math.cos(angle);
    const y = center.y + spacing * 2 * Math.sin(angle);
    const color = i % 2 === 0 ? "black" : "white";
    pushCoin(x, y, color);
  }

  return coins;
};

