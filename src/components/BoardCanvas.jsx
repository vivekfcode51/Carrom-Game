// src/components/BoardCanvas.jsx
// src/components/BoardCanvas.jsx
import { useEffect, useRef } from "react";
import { checkPocket } from "../utils/physicsUtils";
import { playSound } from "../utils/soundUtils";

const BoardCanvas = ({
  coins, setCoins,
  striker, setStriker,
  turn, setScores,
  isAiming, aimPos,
  animateStriker,
  switchTurn,
  setIsAiming,
  setAimPos
}) => {
  const canvasRef = useRef(null);
  const coinsRef = useRef(coins);
  const strikerRef = useRef(striker);

  // Sync refs with latest state
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    strikerRef.current = striker;
  }, [striker]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 600;

    const pockets = [
      { x: 0, y: 0 },
      { x: 600, y: 0 },
      { x: 0, y: 600 },
      { x: 600, y: 600 },
    ];

    const drawCircle = (x, y, r, color) => {
      ctx.save(); // Save current canvas state

      ctx.beginPath();
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();

      ctx.restore(); // Restore canvas to no-shadow state
    };


      const drawBoard = () => {
        ctx.fillStyle = "#FAD6A5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Outer border
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Inner playing area
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 50, 500, 500);

        // Four pocket holes
        drawCircle(70, 70, 15, "black");
        drawCircle(530, 70, 15, "black");
        drawCircle(70, 530, 15, "black");
        drawCircle(530, 530, 15, "black");

        // Center circle
        drawCircle(300, 300, 40, "black");
        drawCircle(300, 300, 35, "#FAD6A5");
        drawCircle(300, 300, 10, "red");

        // ♟️ Player 1 striker guide circles (bottom side)
        ctx.beginPath();
        ctx.arc(125, 528, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(475, 528, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        // ↕ Player 1 guide borders
        ctx.beginPath(); // Top border
        ctx.moveTo(125, 518.4);  // top line
        ctx.lineTo(475, 518.4);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath(); // Bottom border
        ctx.moveTo(125, 538);  // bottom line
        ctx.lineTo(475, 538);
        ctx.stroke();

        // ♟️ Player 2 striker zone (top side)
        ctx.beginPath();
        ctx.arc(125, 72, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(475, 72, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        // ↕ Player 2 guide borders
        ctx.beginPath(); // Top border
        ctx.moveTo(125, 62.4);  // top line
        ctx.lineTo(475, 62.4);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath(); // Bottom border
        ctx.moveTo(125, 81.6);  // bottom line
        ctx.lineTo(475, 81.6);
        ctx.stroke();


          // ♟️ Player 3 (left side)
        // drawCircle(72, 125, 10, "#000");
        // drawCircle(72, 475, 10, "#000");
        ctx.beginPath();
        ctx.arc(72, 125, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(72, 475, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        // Left vertical border
        ctx.beginPath();
        ctx.moveTo(62.4, 125);  // left of circle
        ctx.lineTo(62.4, 475);
        ctx.stroke();

        // Right vertical border
        ctx.beginPath();
        ctx.moveTo(82, 125);  // right of circle
        ctx.lineTo(82, 475);
        ctx.stroke();

        // ♟️ Player 4 (right side)
        ctx.beginPath();
        ctx.arc(528, 125, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(528, 475, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#cc1e25";
        ctx.fill();
        ctx.stroke();

        // Left vertical border
        ctx.beginPath();
        ctx.moveTo(518, 125);  // left of circle
        ctx.lineTo(518, 475);
        ctx.stroke();

        // Right vertical border
        ctx.beginPath();
        ctx.moveTo(538, 125);  // right of circle
        ctx.lineTo(538, 475);
        ctx.stroke();

  
      };


    const updateGame = () => {
      ctx.clearRect(0, 0, 600, 600);
      drawBoard();

      // Move and draw coins
      coinsRef.current.forEach((coin) => {
        coin.x += coin.vx;
        coin.y += coin.vy;
        coin.vx *= 0.98;
        coin.vy *= 0.98;

        const min = 50 + coin.radius;
        const max = 550 - coin.radius;

        // Bounce off walls
         if (coin.x < min) {
          coin.x = min;
          coin.vx *= -0.9;
        } else if (coin.x > max) {
          coin.x = max;
          coin.vx *= -0.9;
        }

        if (coin.y < min) {
          coin.y = min;
          coin.vy *= -0.9;
        } else if (coin.y > max) {
          coin.y = max;
          coin.vy *= -0.9;
        }

        drawCircle(coin.x, coin.y, coin.radius, coin.color);
      });
      // Check pockets (once per frame, outside state update)
      const remaining = coinsRef.current.filter((coin) => {
        if (checkPocket(coin, pockets, playSound)) {
          setScores((prev) => ({
            ...prev,
            [turn]: prev[turn] + 10,
          }));
          return false;
        }
        return true;
      });

      coinsRef.current = remaining;
      if (remaining.length !== coinsRef.current.length) {
      setCoins([...remaining]); // ✅ Only update if coin count changed (i.e., a coin was pocketed)
    }


      // Draw striker
      const s = strikerRef.current;
      drawCircle(s.x, s.y, s.radius, "#3C4CAD");
      // Draw aim line
      if (isAiming && aimPos) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(aimPos.x, aimPos.y);
        ctx.strokeStyle = "rgba(0,0,255,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      requestAnimationFrame(updateGame);
    };

    updateGame();

    // Mouse handling
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setIsAiming(true);
      setAimPos({ x: mouseX, y: mouseY });
    };

    const handleMouseUp = () => {
      if (isAiming && aimPos) {
        const dx = aimPos.x - strikerRef.current.x;
        const dy = aimPos.y - strikerRef.current.y;
        const mag = Math.min(10, Math.hypot(dx, dy) / 20);
        animateStriker({
          vx: dx * mag * 0.02,
          vy: dy * mag * 0.02,
        });
      }
      setIsAiming(false);
      setAimPos(null);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [coins,striker, aimPos, isAiming]); // ✅ Empty dependency array - run only once

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "2px solid #000" }}
    />
  );
};

export default BoardCanvas;




// coins, striker, aimPos, isAiming