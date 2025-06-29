// src/components/CarronBoard.jsx
import React, { useState, useEffect } from "react";
import { setupCoins } from "../utils/setupCoins";
import { playSound } from "../utils/soundUtils";
import BoardCanvas from "./BoardCanvas";
import ScoreBoard from "./ScoreBoard";
import ResetButton from "./ResetButton";

const CarromBoard = () => {
  const [coins, setCoins] = useState([]);
  // queen logic
  const [queenPocketed, setQueenPocketed] = useState(false);
  const [queenCoverPending, setQueenCoverPending] = useState(false); // 🆕 Add this
  const [queenPocketedBy, setQueenPocketedBy] = useState(null); // 🆕 Who pocketed queen
  // const [striker, setStriker] = useState({ x: 300, y: 530, radius: 15 });
  const [striker, setStriker] = useState({x: 300, y: 530, radius: 15, vx: 0,vy: 0,});
  const [mode, setMode] = useState("bot"); // "bot" or "pvp"
  const [turn, setTurn] = useState("Player 1");
  const [scores, setScores] = useState({ "Player 1": 0, [mode === "bot" ? "Bot" : "Player 2"]: 0 });
  const [isAiming, setIsAiming] = useState(false);
  const [aimPos, setAimPos] = useState(null);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  


  useEffect(() => {
    setCoins(setupCoins());
  }, []);

  // ✅ Keyboard listener to move striker
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setStriker((prev) => {
          const newX = clamp(prev.x - 10, 50 + prev.radius, 550 - prev.radius);
          return { ...prev, x: newX };
        });
      } else if (e.key === "ArrowRight") {
        setStriker((prev) => {
          const newX = clamp(prev.x + 10, 50 + prev.radius, 550 - prev.radius);
          return { ...prev, x: newX };
        });
      } else if (e.code === "Space") {
        if (aimPos) {
          const dx = aimPos.x - striker.x;
          const dy = aimPos.y - striker.y;
          const mag = Math.min(10, Math.hypot(dx, dy) / 20);
          animateStriker({
            vx: dx * mag * 0.02,
            vy: dy * mag * 0.02,
          });
          setAimPos(null);
          setIsAiming(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [striker, aimPos]);

  useEffect(() => {
    if (mode === "bot" && turn === "Player 2") {
      const timeout = setTimeout(() => {
        botShoot();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [turn, mode]);


  // src/components/CarromBoard.jsx
  // const switchTurn = () => {
  //   setTurn((prev) => (prev === "Player 1" ? "Player 2" : "Player 1"));
  //   setStriker({ x: 300, y: 530, radius: 15, vx: 0, vy: 0 }); // Reset striker position after turn
  // };
  const switchTurn = () => {
    setTurn((prev) => {
      const next = prev === "Player 1" ? "Player 2" : "Player 1";
      const y = next === "Player 1" ? 530 : 70;
      setStriker({ x: 300, y, radius: 15, vx: 0, vy: 0 });
      return next;
    });
  };
  const botShoot = () => {
    const angle = Math.random() * Math.PI; // 0 to 180 degrees
    const speed = 8 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    setStriker({ x: 300, y: 70, radius: 15, vx: 0, vy: 0 });
    playSound("strike");
    animateStriker({ vx, vy });
  };

  const updateScores = (player, points) => {
    setScores((prev) => ({ ...prev, [player]: prev[player] + points }));
  };

  const resetGame = () => {
    setCoins(setupCoins());
    setStriker({ x: 300, y: 530, radius: 15, vx: 0, vy: 0 });
    setScores({ "Player 1": 0, "Player 2": 0 });
    setTurn("Player 1");
  };

  const animateStriker = ({ vx, vy }) => {
    let x = striker.x,
      y = striker.y;
    const radius = striker.radius;

    const friction = 0.98;
    const bounce = -0.9;

    const interval = setInterval(() => {
      x += vx;
      y += vy;
      vx *= friction;
      vy *= friction;

      // Board boundaries
      const min = 50 + radius;
      const max = 550 - radius;

      // Wall bounce
      if (x < min) {
        x = min;
        vx *= bounce;
      } else if (x > max) {
        x = max;
        vx *= bounce;
      }

      if (y < min) {
        y = min;
        vy *= bounce;
      } else if (y > max) {
        y = max;
        vy *= bounce;
      }

      // Handle striker hitting coins with improved impulse
      const updatedCoins = coins.map((coin) => {
        const dx = coin.x - x;
        const dy = coin.y - y;
        const dist = Math.hypot(dx, dy);
        const minDist = coin.radius + radius;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const angle = Math.atan2(dy, dx);

          // Resolve overlap
          coin.x += (Math.cos(angle) * overlap) / 2;
          coin.y += (Math.sin(angle) * overlap) / 2;
          x -= (Math.cos(angle) * overlap) / 2;
          y -= (Math.sin(angle) * overlap) / 2;

          // Collision impulse
          const nx = dx / dist;
          const ny = dy / dist;
          const p = (2 * (vx * nx + vy * ny)) / 2;

          // Transfer impulse to coin
          coin.vx += p * nx;
          coin.vy += p * ny;

          // Update striker velocity
          vx -= p * nx;
          vy -= p * ny;
        }

        return coin;
      });

      setCoins([...updatedCoins]); // Trigger rerender
      setStriker({ x, y, radius });
      setStriker((prev) => ({ ...prev, vx, vy }));

      if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        clearInterval(interval);
        switchTurn();
      }
    }, 16);

    playSound("/sounds/strike");
  };

  return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "20px",
    }}
  >
    {/* ✅ 1. Mode Selection Buttons — Add HERE */}
    <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
      <button
  onClick={() => {
    setMode("bot");
    setScores({ "Player 1": 0, "Bot": 0 });
    setTurn("Player 1");
    resetGame();
  }}
>
  Player 1 vs Bot 🤖
</button>
      <button
  onClick={() => {
    setMode("pvp");
    setScores({ "Player 1": 0, "Player 2": 0 });
    setTurn("Player 1");
    resetGame();
  }}
>
  Player 1 vs Player 2 👥
</button>
    </div>

    {/* ✅ 2. ScoreBoard (below buttons) */}
    <ScoreBoard turn={turn} scores={scores} mode={mode} />

    {/* ✅ 3. Reset and Board */}
    <ResetButton resetGame={resetGame} />
    <BoardCanvas
      coins={coins}
      setCoins={setCoins}
      striker={striker}
      setStriker={setStriker}
      turn={turn}
      setTurn={setTurn}
      scores={scores}
      setScores={setScores}
      isAiming={isAiming}
      aimPos={aimPos}
      animateStriker={animateStriker}
      switchTurn={switchTurn}
      setIsAiming={setIsAiming}
      setAimPos={setAimPos}
      queenPocketedBy={queenPocketedBy}
      setQueenPocketedBy={setQueenPocketedBy}
      queenCoverPending={queenCoverPending}
      setQueenCoverPending={setQueenCoverPending}
      updateScores={updateScores}
    />
  </div>
);


};

export default CarromBoard;
