// src/utils/physicsUtils.js
export const checkPocket = (coin, pockets, playSound, isStriker = false) => {
  const speed = Math.hypot(coin.vx, coin.vy);

  for (const p of pockets) {
    const d = Math.hypot(coin.x - p.x, coin.y - p.y);

    // Coin only counts as pocketed if it's close enough AND moving slowly (i.e., not bouncing)
    if (d < 20 && speed < 0.5 && !coin.pocketed) {
      coin.pocketed = true; // Mark this coin as pocketed so it doesn't get scored again

      if (isStriker) {
        playSound("/sounds/pocket.mp3");
      } else {
        playSound("pocket");
      }

      return true; // Coin was pocketed
    }
  }

  return false; // Not pocketed
};







