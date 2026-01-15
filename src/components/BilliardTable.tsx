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
  currentPlayer?: number;
}

const BilliardTable: React.FC<BilliardTableProps> = ({
  balls,
  pockets,
  isAiming,
  onShoot,
  tableWidth,
  tableHeight,
  currentPlayer = 1,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [aimAngle, setAimAngle] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeAmount, setChargeAmount] = useState(0);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cueBall = balls.find(b => b.id === 0 && !b.isPocketed);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !isAiming || !cueBall) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = tableWidth / rect.width;
    const scaleY = tableHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setMousePos({ x, y });

    if (!isCharging) {
      // Calculate angle from cue ball to mouse
      const angle = Math.atan2(y - cueBall.y, x - cueBall.x);
      setAimAngle(angle);
    }
  };

  const startCharging = () => {
    if (!isAiming || !cueBall || isCharging) return;
    
    setIsCharging(true);
    setChargeAmount(0);
    
    // Start charging power while holding
    chargeIntervalRef.current = setInterval(() => {
      setChargeAmount(prev => {
        const newCharge = prev + 2;
        return newCharge >= 100 ? 100 : newCharge;
      });
    }, 30);
  };

  const stopCharging = () => {
    if (!isCharging || !cueBall) return;
    
    // Clear the interval
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    
    if (chargeAmount > 5) {
      // Shoot in the direction the cue is pointing (opposite to aim)
      const shootAngle = aimAngle + Math.PI;
      onShoot(shootAngle, chargeAmount);
    }
    
    setIsCharging(false);
    setChargeAmount(0);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0) { // Left click only
      startCharging();
    }
  };

  const handleMouseUp = () => {
    stopCharging();
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Cancel charging
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    setIsCharging(false);
    setChargeAmount(0);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isCharging) {
        stopCharging();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (chargeIntervalRef.current) {
        clearInterval(chargeIntervalRef.current);
      }
    };
  }, [isCharging, chargeAmount, aimAngle, cueBall]);

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

  // Calculate cue stick position based on charge amount (pulls back while charging)
  const cueOffset = cueBall ? 20 + chargeAmount * 1.5 : 0;

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
            onContextMenu={handleRightClick}
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
              {/* Cue gradient */}
              <linearGradient id="cueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f5e6d3" />
                <stop offset="10%" stopColor="#2a1810" />
                <stop offset="50%" stopColor="#c4a574" />
                <stop offset="100%" stopColor="#8b7355" />
              </linearGradient>
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

            {/* Cue stick and aiming line */}
            {isAiming && cueBall && (
              <g>
                {/* Aim line - shows where ball will go */}
                <line
                  x1={cueBall.x}
                  y1={cueBall.y}
                  x2={cueBall.x + Math.cos(aimAngle + Math.PI) * 300}
                  y2={cueBall.y + Math.sin(aimAngle + Math.PI) * 300}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                
                {/* Target indicator at aim point */}
                {!isCharging && (
                  <circle
                    cx={mousePos.x}
                    cy={mousePos.y}
                    r="8"
                    fill="none"
                    stroke="rgba(255,215,0,0.5)"
                    strokeWidth="2"
                  />
                )}

                {/* Cue stick - positioned on the opposite side of aim */}
                <line
                  x1={cueBall.x + Math.cos(aimAngle) * (cueBall.radius + cueOffset)}
                  y1={cueBall.y + Math.sin(aimAngle) * (cueBall.radius + cueOffset)}
                  x2={cueBall.x + Math.cos(aimAngle) * (cueBall.radius + cueOffset + 200)}
                  y2={cueBall.y + Math.sin(aimAngle) * (cueBall.radius + cueOffset + 200)}
                  stroke="url(#cueGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Cue tip */}
                <circle
                  cx={cueBall.x + Math.cos(aimAngle) * (cueBall.radius + cueOffset)}
                  cy={cueBall.y + Math.sin(aimAngle) * (cueBall.radius + cueOffset)}
                  r="4"
                  fill="#87CEEB"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Aiming instructions */}
      {isAiming && cueBall && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gold/30 text-center"
        >
          {!isCharging ? (
            <p className="text-sm text-foreground">
              🎯 حرك الماوس لتحديد الاتجاه ثم <span className="text-gold font-bold">اضغط مطولاً</span> لشحن القوة
            </p>
          ) : (
            <div>
              <p className="text-sm text-foreground mb-2">
                ⚡ استمر بالضغط لشحن القوة ثم <span className="text-gold font-bold">أفلت</span> للضرب
              </p>
              <div className="w-40 h-4 bg-muted rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${chargeAmount}%`,
                    background: `linear-gradient(90deg, hsl(145, 70%, 40%) 0%, hsl(45, 80%, 55%) 50%, hsl(0, 75%, 50%) 100%)`,
                  }}
                />
              </div>
              <p className="text-xs text-gold mt-1">{Math.round(chargeAmount)}%</p>
              <p className="text-xs text-muted-foreground mt-1">كليك يمين للإلغاء</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Current player indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gold/30">
        <span className="text-gold font-bold">لاعب {currentPlayer}</span>
      </div>
    </div>
  );
};

export default BilliardTable;
