// src/utils/physicsUtils.js
export const checkPocket = (coin, pockets, playSound) => {
  return pockets.some(p => {
    const pocketed = Math.hypot(p.x - coin.x, p.y - coin.y) < 20;
    if (pocketed) playSound("/sounds/pocket.mp3");
    return pocketed;
  });
};

export const handleStrikerCollision = (coin, strikerX, strikerY, strikerRadius) => {
  const dx = coin.x - strikerX;
  const dy = coin.y - strikerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const combinedRadius = coin.radius + strikerRadius;

  if (distance < combinedRadius) {
    // Direction of impact
    const angle = Math.atan2(dy, dx);

    // Speed boost multiplier
    const force = 2.0; // Increase this for more power (try 2.5 or 3)

    coin.vx = Math.cos(angle) * force;
    coin.vy = Math.sin(angle) * force;
  }

  return coin;
};




