
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

   // ✅ NEW: Refs for aim state
   const isAimingRef = useRef(isAiming);
   const aimPosRef = useRef(aimPos);

  // Sync all refs with props/state
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { strikerRef.current = striker; }, [striker]);
  useEffect(() => { isAimingRef.current = isAiming; }, [isAiming]);
  useEffect(() => { aimPosRef.current = aimPos; }, [aimPos]);

  // 🔄 Main game update & draw loop
  const updateGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear & draw board
    ctx.clearRect(0, 0, 600, 600);
    drawBoard(ctx);

    // Move & draw coins with friction & wall bounce
    coinsRef.current.forEach((coin) => {
      coin.vx *= 0.98;
      coin.vy *= 0.98;
      coin.x += coin.vx;
      coin.y += coin.vy;

      if (Math.abs(coin.vx) < 0.05) coin.vx = 0;
      if (Math.abs(coin.vy) < 0.05) coin.vy = 0;

      const min = 50 + coin.radius;
      const max = 550 - coin.radius;
      if (coin.x < min) { coin.x = min; coin.vx *= -0.85; }
      if (coin.x > max) { coin.x = max; coin.vx *= -0.85; }
      if (coin.y < min) { coin.y = min; coin.vy *= -0.85; }
      if (coin.y > max) { coin.y = max; coin.vy *= -0.85; }

      drawCircle(ctx, coin.x, coin.y, coin.radius, coin.color);
    });

    // Check pocketed coins
    const remaining = coinsRef.current.filter((coin) => {
      if (checkPocket(coin, pockets, playSound)) {
        setScores(prev => ({ ...prev, [turn]: prev[turn] + 10 }));
        return false;
      }
      return true;
    });

    if (remaining.length !== coinsRef.current.length) {
      coinsRef.current = remaining;
      setCoins([...remaining]);
    }

    // Draw striker
    const s = strikerRef.current;
    enforceStrikerBounds(s);
    drawCircle(ctx, s.x, s.y, s.radius, "#1E90FF");
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Draw aiming line if active
    if (isAimingRef.current && aimPosRef.current) {
      console.log("🎯 Drawing aiming line");
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

  // 🔥 Start the loop once on mount
  useEffect(() => {
    requestAnimationFrame(updateGame);
  }, []);

  useEffect(() => {
    requestAnimationFrame(updateGame);
  }, []);

  // 🎨 Draw board, pockets, guide zones
  // const drawBoard = (ctx) => {
  //   ctx.fillStyle = "#FAD6A5";
  //   ctx.fillRect(0, 0, 600, 600);

  //   // Outer border
  //   ctx.strokeStyle = "#000";
  //   ctx.lineWidth = 10;
  //   ctx.strokeRect(0, 0, 600, 600);

  //   // Inner playing area
  //   ctx.lineWidth = 4;
  //   ctx.strokeRect(50, 50, 500, 500);

  //   // Four pocket holes
  //   [ [70,70], [530,70], [70,530], [530,530] ].forEach(([x,y]) => drawCircle(ctx, x, y, 15, "black"));
    
  //   drawCircle(ctx, 300, 300, 40, "black");
  //   drawCircle(ctx, 300, 300, 35, "#FAD6A5");
  //   // drawCircle(ctx, 300, 300, 10, "red");
  //   // drawSquare(ctx, 300, 300, 20, "green");
  //   drawTriangle(ctx, 300, 290, 70, "#8f1402");

  //   drawGuides(ctx);
  // };
  const drawBoard = (ctx) => {
  ctx.fillStyle = "#FAD6A5";
  ctx.fillRect(0, 0, 600, 600);

  // Outer border
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, 600, 600);

  // Inner square
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 500, 500);

  // Pockets
  [[70, 70], [530, 70], [70, 530], [530, 530]].forEach(([x, y]) =>
    drawCircle(ctx, x, y, 15, "black")
  );

  // Center area
  drawCircle(ctx, 300, 300, 40, "black");
  drawCircle(ctx, 300, 300, 35, "#FAD6A5");

  // Triangle & arrows from all 3 corners
  const triangle = drawTriangle(ctx, 300, 290, 70, "#8f1402");
  triangle.forEach(([x, y]) => drawArrow(ctx, x, y, x - 300, y - 300, 50));

  drawGuides(ctx);
};


  const drawGuides = (ctx) => {
    const zones = [
      { y: 528 }, { y: 72 },
      { x: 72 }, { x: 528 }
    ];
    zones.forEach(zone => {
      const isHorizontal = !!zone.y;
      const fixed = isHorizontal ? zone.y : zone.x;
      const varStart = isHorizontal ? 125 : 125;
      const varEnd = isHorizontal ? 475 : 475;

      // [0,1].forEach(i => {
      //   const pos = isHorizontal
      //     ? [i === 0 ? varStart : varEnd, fixed]
      //     : [fixed, i === 0 ? varStart : varEnd];
      //   drawCircle(ctx, pos[0], pos[1], 10, "#cc1e25");
      // });
      [0,1].forEach(i => {
        const pos = isHorizontal
          ? [i === 0 ? varStart : varEnd, fixed]
          : [fixed, i === 0 ? varStart : varEnd];

        drawCircle(ctx, pos[0], pos[1], 10, "#cc1e25");

        // Stroke (outline)
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

  // 🎨 Circle with shadow and inner ring
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
    ctx.fillStyle = color === "white" ? "#999"
                     : color === "black" ? "#ccc"
                     : color === "red" ? "#ffa07a"
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

  // 🎨 Triangle with shadow and inner ring
  const drawTriangle = (ctx, cx, cy, size, color) => {
  const height = size * Math.sqrt(3) / 2;

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

  return [pointA, pointB, pointC]; // 👈 return all corners
};

  const drawArrow = (ctx, x, y, dx, dy, length = 50) => {
  const angle = Math.atan2(dy, dx);
  const endX = x + length * Math.cos(angle);
  const endY = y + length * Math.sin(angle);

  // Line
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arrowhead
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





  // 🔒 Keep striker inside playable area
  const enforceStrikerBounds = (s) => {
    const min = 50 + s.radius;
    const max = 550 - s.radius;
    if (s.x < min) s.x = min;
    if (s.x > max) s.x = max;
    if (s.y < min) s.y = min;
    if (s.y > max) s.y = max;
  };

  const pockets = [
    { x: 0, y: 0 }, { x: 600, y: 0 },
    { x: 0, y: 600 }, { x: 600, y: 600 },
  ];

  // 🎯 Mouse handers for aiming & shooting
 useEffect(() => {
  const canvas = canvasRef.current;
  const rect = () => canvas.getBoundingClientRect();

  const mMove = (e) => {
    const { left, top } = rect();
    if (isAiming) {
      setAimPos({ x: e.clientX - left, y: e.clientY - top });
    }
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


  return <canvas ref={canvasRef} width={600} height={600} style={{ border: "2px solid #000" }} />;
};

export default BoardCanvas;
