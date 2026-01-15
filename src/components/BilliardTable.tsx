import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ball, Pocket } from '@/types/billiard';

interface BilliardTableProps {
  balls: Ball[];
  pockets: Pocket[];
  isAiming: boolean;
  onShoot: (angle: number, power: number) => void;
  tableWidth: number;
  tableHeight: number;
}

const BilliardTable: React.FC<BilliardTableProps> = ({
  balls,
  pockets,
  isAiming,
  onShoot,
  tableWidth,
  tableHeight,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPowerCharging, setIsPowerCharging] = useState(false);
  const [power, setPower] = useState(0);
  const powerIntervalRef = useRef<NodeJS.Timeout>();

  const cueBall = balls.find(b => b.id === 0 && !b.isPocketed);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !isAiming) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = tableWidth / rect.width;
    const scaleY = tableHeight / rect.height;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  const handleMouseDown = () => {
    if (!isAiming || !cueBall) return;
    setIsPowerCharging(true);
    setPower(0);
    powerIntervalRef.current = setInterval(() => {
      setPower(prev => Math.min(prev + 2, 100));
    }, 20);
  };

  const handleMouseUp = () => {
    if (!isPowerCharging || !cueBall) return;
    if (powerIntervalRef.current) {
      clearInterval(powerIntervalRef.current);
    }
    setIsPowerCharging(false);
    
    if (power > 5) {
      const angle = Math.atan2(
        cueBall.y - mousePos.y,
        cueBall.x - mousePos.x
      );
      onShoot(angle, power);
    }
    setPower(0);
  };

  useEffect(() => {
    return () => {
      if (powerIntervalRef.current) {
        clearInterval(powerIntervalRef.current);
      }
    };
  }, []);

  const renderBall = (ball: Ball) => {
    if (ball.isPocketed) return null;

    return (
      <g key={ball.id}>
        {/* Ball shadow */}
        <ellipse
          cx={ball.x + 3}
          cy={ball.y + 3}
          rx={ball.radius}
          ry={ball.radius * 0.6}
          fill="rgba(0,0,0,0.3)"
        />
        {/* Ball base */}
        <circle
          cx={ball.x}
          cy={ball.y}
          r={ball.radius}
          fill={ball.color}
          stroke="#333"
          strokeWidth="0.5"
        />
        {/* Ball gradient overlay */}
        <circle
          cx={ball.x}
          cy={ball.y}
          r={ball.radius}
          fill="url(#ballGradient)"
        />
        {/* Stripe for striped balls */}
        {ball.isStriped && (
          <path
            d={`M ${ball.x - ball.radius * 0.7} ${ball.y - ball.radius * 0.3} 
                Q ${ball.x} ${ball.y - ball.radius * 0.8} ${ball.x + ball.radius * 0.7} ${ball.y - ball.radius * 0.3}
                L ${ball.x + ball.radius * 0.7} ${ball.y + ball.radius * 0.3}
                Q ${ball.x} ${ball.y + ball.radius * 0.8} ${ball.x - ball.radius * 0.7} ${ball.y + ball.radius * 0.3} Z`}
            fill="white"
            opacity="0.9"
          />
        )}
        {/* Ball number circle */}
        {ball.id !== 0 && (
          <>
            <circle
              cx={ball.x}
              cy={ball.y}
              r={ball.radius * 0.45}
              fill="white"
            />
            <text
              x={ball.x}
              y={ball.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={ball.radius * 0.6}
              fontWeight="bold"
              fill="#1a1a1a"
            >
              {ball.id}
            </text>
          </>
        )}
        {/* Highlight */}
        <circle
          cx={ball.x - ball.radius * 0.3}
          cy={ball.y - ball.radius * 0.3}
          r={ball.radius * 0.25}
          fill="rgba(255,255,255,0.4)"
        />
      </g>
    );
  };

  const cueAngle = cueBall
    ? Math.atan2(cueBall.y - mousePos.y, cueBall.x - mousePos.x)
    : 0;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Table outer frame (wood) */}
      <div className="wood-texture p-4 rounded-2xl shadow-2xl">
        {/* Table inner border */}
        <div className="bg-gradient-to-b from-amber-900/80 to-amber-950 p-2 rounded-xl">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${tableWidth} ${tableHeight}`}
            className="w-full rounded-lg cursor-crosshair"
            style={{ aspectRatio: `${tableWidth}/${tableHeight}` }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              {/* Ball gradient */}
              <radialGradient id="ballGradient" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
              </radialGradient>
              {/* Felt texture pattern */}
              <pattern id="feltPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="hsl(145, 55%, 25%)" />
                <circle cx="2" cy="2" r="0.5" fill="hsl(145, 50%, 22%)" opacity="0.5" />
              </pattern>
              {/* Pocket shadow gradient */}
              <radialGradient id="pocketGradient">
                <stop offset="0%" stopColor="#000" />
                <stop offset="100%" stopColor="#1a1a1a" />
              </radialGradient>
            </defs>

            {/* Table felt */}
            <rect
              x="20"
              y="20"
              width={tableWidth - 40}
              height={tableHeight - 40}
              rx="5"
              fill="url(#feltPattern)"
              className="felt-texture"
            />
            <rect
              x="20"
              y="20"
              width={tableWidth - 40}
              height={tableHeight - 40}
              rx="5"
              fill="hsl(145, 55%, 25%)"
            />

            {/* Rails */}
            <rect x="20" y="20" width={tableWidth - 40} height="10" fill="hsl(145, 60%, 22%)" />
            <rect x="20" y={tableHeight - 30} width={tableWidth - 40} height="10" fill="hsl(145, 60%, 22%)" />
            <rect x="20" y="20" width="10" height={tableHeight - 40} fill="hsl(145, 60%, 22%)" />
            <rect x={tableWidth - 30} y="20" width="10" height={tableHeight - 40} fill="hsl(145, 60%, 22%)" />

            {/* Pockets */}
            {pockets.map((pocket, i) => (
              <g key={i}>
                <circle
                  cx={pocket.x}
                  cy={pocket.y}
                  r={pocket.radius + 5}
                  fill="#1a1a1a"
                />
                <circle
                  cx={pocket.x}
                  cy={pocket.y}
                  r={pocket.radius}
                  fill="url(#pocketGradient)"
                />
              </g>
            ))}

            {/* Balls */}
            {balls.map(renderBall)}

            {/* Cue stick aiming line */}
            {isAiming && cueBall && (
              <g>
                {/* Aim line */}
                <line
                  x1={cueBall.x}
                  y1={cueBall.y}
                  x2={cueBall.x + Math.cos(cueAngle) * 300}
                  y2={cueBall.y + Math.sin(cueAngle) * 300}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {/* Cue stick */}
                <line
                  x1={cueBall.x + Math.cos(cueAngle) * (cueBall.radius + 5 + power * 0.5)}
                  y1={cueBall.y + Math.sin(cueAngle) * (cueBall.radius + 5 + power * 0.5)}
                  x2={cueBall.x + Math.cos(cueAngle) * (cueBall.radius + 200 + power * 0.5)}
                  y2={cueBall.y + Math.sin(cueAngle) * (cueBall.radius + 200 + power * 0.5)}
                  stroke="url(#cueGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="cueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2a1810" />
                    <stop offset="50%" stopColor="#c4a574" />
                    <stop offset="100%" stopColor="#8b7355" />
                  </linearGradient>
                </defs>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Power meter */}
      {isPowerCharging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gold/30"
        >
          <div className="text-center text-sm text-foreground mb-2">القوة</div>
          <div className="w-40 h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${power}%`,
                background: `linear-gradient(90deg, hsl(145, 70%, 40%) 0%, hsl(45, 80%, 55%) 50%, hsl(0, 75%, 50%) 100%)`,
              }}
            />
          </div>
          <div className="text-center text-xs text-gold mt-1">{power}%</div>
        </motion.div>
      )}
    </div>
  );
};

export default BilliardTable;
