import strikeSound from "../assets/sounds/strike.mp3";
// import pocketSound from "../assets/sounds/pocket.mp3";
// import reboundSound from "../assets/sounds/rebound.mp3";

export const playSound = (name) => {
  const sounds = {
    strike: strikeSound,
    // pocket: pocketSound,
    // rebound: reboundSound,
  };

  const audio = new Audio(sounds[name]);
  audio.play().catch((err) => console.warn("Audio play error:", err));
};

