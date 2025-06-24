// src/components/BoardCanvas.jsx
import React from "react";
import { useEffect, useRef } from "react";
import { checkPocket } from "../utils/physicsUtils";
import { playSound } from "../utils/soundUtils";

const BoardCanvas = ({
  coins, setCoins,
  striker, setStriker,
  turn, setTurn,
  scores, setScores,
  isAiming, aimPos,
  animateStriker, switchTurn,
  setIsAiming, setAimPos,
}) => {
  const canvasRef = useRef(null);
  const coinsRef = useRef(coins);
  const strikerRef = useRef(striker);
  const isAimingRef = useRef(isAiming);
  const aimPosRef = useRef(aimPos);
  const turnRef = useRef(turn);
  const scoresRef = useRef(scores);
  const setTurnRef = useRef(setTurn);

  useEffect(() => {coinsRef.current = coins;}, [coins]);
  useEffect(() => {strikerRef.current = striker;}, [striker]);
  useEffect(() => {isAimingRef.current = isAiming;}, [isAiming]);
  useEffect(() => {aimPosRef.current = aimPos;}, [aimPos]);
  useEffect(() => {turnRef.current = turn;}, [turn]);
  useEffect(() => {scoresRef.current = scores;}, [scores]);
  useEffect(() => {setTurnRef.current = setTurn;}, [setTurn]);

  const pockets = [
    { x: 70, y: 70 },
    { x: 530, y: 70 },
    { x: 70, y: 530 },
    { x: 530, y: 530 },
  ];

  const updateGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 600, 600);
    drawBoard(ctx);

    // Coin-to-coin collisions
    const coinsList = coinsRef.current;
    for (let i = 0; i < coinsList.length; i++) {
      for (let j = i + 1; j < coinsList.length; j++) {
        handleCoinCollision(coinsList[i], coinsList[j]);
      }
    }

    // Coin movement & rendering
    coinsList.forEach((coin) => {
      coin.vx *= 0.98;
      coin.vy *= 0.98;
      coin.x += coin.vx;
      coin.y += coin.vy;
      if (Math.abs(coin.vx) < 0.05) coin.vx = 0;
      if (Math.abs(coin.vy) < 0.05) coin.vy = 0;

      const min = 50 + coin.radius;
      const max = 550 - coin.radius;
      if (coin.x < min) {
        coin.x = min;
        coin.vx *= -0.85;
      }
      if (coin.x > max) {
        coin.x = max;
        coin.vx *= -0.85;
      }
      if (coin.y < min) {
        coin.y = min;
        coin.vy *= -0.85;
      }
      if (coin.y > max) {
        coin.y = max;
        coin.vy *= -0.85;
      }

      // Sunken effect
      const isPocketedVisually = pockets.some(
        (p) => Math.hypot(p.x - coin.x, p.y - coin.y) < 20
      );
      const yOffset = isPocketedVisually ? 3 : 0;
      const radius = coin.radius * (isPocketedVisually ? 0.85 : 1);
      drawCircle(ctx, coin.x, coin.y + yOffset, radius, coin.color);
    });

    // Check pocketing
    let coinPocketed = false;
    const currentTurn = turnRef.current;

    const remaining = coinsList.filter((coin) => {
      // Skip if already pocketed
      if (coin.pocketed) return false;

      const wasPocketed = checkPocket(coin, pockets, playSound, false);
      if (wasPocketed) {
        coinPocketed = true;

        setScores((prev) => {
          const updated = { ...prev };
          const points = coin.color === "white" ? 20 : 10; // 👈 Score logic
          updated[currentTurn] += points;
          return updated;
        });

        return false; // Remove coin from board
      }

      return true;
    });

    if (remaining.length !== coinsList.length) {
      coinsRef.current = remaining;
      setCoins([...remaining]);
    }

    // ✅ Switch turn only if no coin was pocketed
    if (!coinPocketed) {
      setTurn((prev) => {
        const nextTurn = prev === "Player 1" ? "Player 2" : "Player 1";
        turnRef.current = nextTurn; // keep ref in sync
        return nextTurn;
      });
    }

    // Draw striker
    const s = strikerRef.current;
    enforceStrikerBounds(s);
    drawCircle(ctx, s.x, s.y, s.radius, "#4A2227");
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    // ctx.fillStyle = "#F8CC4B";
    ctx.fill();
    ctx.closePath();

    // Aiming line
    if (isAimingRef.current && aimPosRef.current) {
      ctx.strokeStyle = "rgba(0, 0, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(aimPosRef.current.x, aimPosRef.current.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    requestAnimationFrame(updateGame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rect = () => canvas.getBoundingClientRect();

    const mMove = (e) => {
      const { left, top } = rect();
      if (isAiming) setAimPos({ x: e.clientX - left, y: e.clientY - top });
    };

    const mDown = (e) => {
      const { left, top } = rect();
      setIsAiming(true);
      setAimPos({ x: e.clientX - left, y: e.clientY - top });
    };

    const mUp = () => {
      if (isAiming && aimPos) {
        const dx = aimPos.x - strikerRef.current.x;
        const dy = aimPos.y - strikerRef.current.y;
        const mag = Math.min(10, Math.hypot(dx, dy) / 20);
        // Sound when striker is shot
        playSound("strike");
        animateStriker({ vx: dx * mag * 0.02, vy: dy * mag * 0.02 });
      }
      setIsAiming(false);
      setAimPos(null);
    };

    canvas.addEventListener("mousemove", mMove);
    canvas.addEventListener("mousedown", mDown);
    canvas.addEventListener("mouseup", mUp);
    return () => {
      canvas.removeEventListener("mousemove", mMove);
      canvas.removeEventListener("mousedown", mDown);
      canvas.removeEventListener("mouseup", mUp);
    };
  }, [isAiming, aimPos]);

  // 📍 Draw pocket net design
  const drawPocketMesh = (ctx, x, y) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    for (let i = 0; i < 360; i += 30) {
      const rad = (i * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 15 * Math.cos(rad), y + 15 * Math.sin(rad));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  };

  const drawBoard = (ctx) => {
    ctx.fillStyle = "#FAD6A5";
    ctx.fillRect(0, 0, 600, 600);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, 600, 600);
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 500, 500);

    // Pockets
    pockets.forEach((p) => drawPocketMesh(ctx, p.x, p.y));

    drawCircle(ctx, 300, 300, 40, "black");
    drawCircle(ctx, 300, 300, 35, "#FAD6A5");
    const triangle = drawTriangle(ctx, 300, 290, 70, "#8f1402");
    triangle.forEach(([x, y]) => drawArrow(ctx, x, y, x - 300, y - 300, 50));
    drawGuides(ctx);
  };

  const drawCircle = (ctx, x, y, r, color) => {
    ctx.save();
    ctx.beginPath();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle =
      color === "white"
        ? "#999"
        : color === "black"
        ? "#ccc"
        : color === "red"
        ? "#ffa07a"
        : "rgba(255,255,255,0.3)";
    ctx.fill();
    ctx.closePath();

    if (color === "white") {
      ctx.beginPath();
      ctx.arc(x, y, r - 1.5, 0, 2 * Math.PI);
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  };

  const handleCoinCollision = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist < a.radius + b.radius) {
      const angle = Math.atan2(dy, dx);
      const totalMass = 1 + 1;
      const v1 = { x: a.vx, y: a.vy };
      const v2 = { x: b.vx, y: b.vy };

      const speed1 = Math.cos(angle) * v1.x + Math.sin(angle) * v1.y;
      const speed2 = Math.cos(angle) * v2.x + Math.sin(angle) * v2.y;

      const newSpeed1 = (speed1 * (1 - 1) + 2 * speed2) / totalMass;
      const newSpeed2 = (speed2 * (1 - 1) + 2 * speed1) / totalMass;

      a.vx += (newSpeed1 - speed1) * Math.cos(angle);
      a.vy += (newSpeed1 - speed1) * Math.sin(angle);
      b.vx += (newSpeed2 - speed2) * Math.cos(angle);
      b.vy += (newSpeed2 - speed2) * Math.sin(angle);

      // Push coins apart
      const overlap = 0.5 * (a.radius + b.radius - dist + 0.1);
      const offsetX = overlap * Math.cos(angle);
      const offsetY = overlap * Math.sin(angle);
      a.x -= offsetX;
      a.y -= offsetY;
      b.x += offsetX;
      b.y += offsetY;
    }
  };

  const enforceStrikerBounds = (s) => {
    const min = 50 + s.radius;
    const max = 550 - s.radius;
    if (s.x < min) s.x = min;
    if (s.x > max) s.x = max;
    if (s.y < min) s.y = min;
    if (s.y > max) s.y = max;
  };

  const drawGuides = (ctx) => {
    const zones = [{ y: 528 }, { y: 72 }, { x: 72 }, { x: 528 }];
    zones.forEach((zone) => {
      const isHorizontal = !!zone.y;
      const fixed = isHorizontal ? zone.y : zone.x;
      const varStart = 125;
      const varEnd = 475;
      [0, 1].forEach((i) => {
        const pos = isHorizontal
          ? [i === 0 ? varStart : varEnd, fixed]
          : [fixed, i === 0 ? varStart : varEnd];
        drawCircle(ctx, pos[0], pos[1], 10, "#cc1e25");

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 10, 0, 2 * Math.PI);
        ctx.stroke();
      });

      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(varStart, fixed - 9.6);
        ctx.lineTo(varEnd, fixed - 9.6);
        ctx.moveTo(varStart, fixed + 10);
        ctx.lineTo(varEnd, fixed + 10);
      } else {
        ctx.moveTo(fixed - 9.6, varStart);
        ctx.lineTo(fixed - 9.6, varEnd);
        ctx.moveTo(fixed + 10, varStart);
        ctx.lineTo(fixed + 10, varEnd);
      }
      ctx.stroke();
    });
  };

  const drawTriangle = (ctx, cx, cy, size, color) => {
    const height = (size * Math.sqrt(3)) / 2;
    const pointA = [cx, cy - height / 2];
    const pointB = [cx - size / 2, cy + height / 2];
    const pointC = [cx + size / 2, cy + height / 2];
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.moveTo(...pointA);
    ctx.lineTo(...pointB);
    ctx.lineTo(...pointC);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return [pointA, pointB, pointC];
  };

  const drawArrow = (ctx, x, y, dx, dy, length = 50) => {
    const angle = Math.atan2(dy, dx);
    const endX = x + length * Math.cos(angle);
    const endY = y + length * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const headLength = 10;
    const leftAngle = angle - Math.PI / 6;
    const rightAngle = angle + Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(leftAngle),
      endY - headLength * Math.sin(leftAngle)
    );
    ctx.lineTo(
      endX - headLength * Math.cos(rightAngle),
      endY - headLength * Math.sin(rightAngle)
    );
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fill();
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      style={{ border: "2px solid #000" }}
    />
  );
};

export default BoardCanvas;

