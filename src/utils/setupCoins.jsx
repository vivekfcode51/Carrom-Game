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
  const spacing = 22;

  const arrangeMixedRing = (centerX, centerY, count, colors, layer = 1) => {
    const angleGap = (2 * Math.PI) / count;
    for (let i = 0; i < count; i++) {
      coins.push({
        x: centerX + layer * spacing * Math.cos(i * angleGap),
        y: centerY + layer * spacing * Math.sin(i * angleGap),
        radius,
        color: colors[i % colors.length], // Alternate color
        vx: 0,
        vy: 0,
      });
    }
  };

  const arrangeSingleColorRing = (centerX, centerY, count, color, layer = 1) => {
    const angleGap = (2 * Math.PI) / count;
    for (let i = 0; i < count; i++) {
      coins.push({
        x: centerX + layer * spacing * Math.cos(i * angleGap),
        y: centerY + layer * spacing * Math.sin(i * angleGap),
        radius,
        color,
        vx: 0,
        vy: 0,
      });
    }
  };

  // Red queen at center
  coins.push({ x: center.x, y: center.y, radius, color: "red", vx: 0, vy: 0 });

  // Mixed ring (alternating white/black)
  arrangeMixedRing(center.x, center.y, 12, ["white", "black"], 1);

  // Outer rings
  arrangeSingleColorRing(center.x, center.y, 3, "white", 2);
  arrangeSingleColorRing(center.x, center.y, 3, "black", 2);

  return coins;
};
