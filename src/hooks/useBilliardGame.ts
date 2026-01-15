import { useState, useCallback, useRef, useEffect } from 'react';
import { Ball, GameState, Pocket } from '@/types/billiard';

const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
const BALL_RADIUS = 12;
const POCKET_RADIUS = 20;
const FRICTION = 0.985;
const MIN_VELOCITY = 0.1;

const BALL_COLORS = [
  { id: 0, color: '#FFFFFF', isStriped: false }, // Cue ball
  { id: 1, color: '#FFD700', isStriped: false }, // Yellow
  { id: 2, color: '#0066CC', isStriped: false }, // Blue
  { id: 3, color: '#CC0000', isStriped: false }, // Red
  { id: 4, color: '#6B0090', isStriped: false }, // Purple
  { id: 5, color: '#FF6B00', isStriped: false }, // Orange
  { id: 6, color: '#006B00', isStriped: false }, // Green
  { id: 7, color: '#800000', isStriped: false }, // Maroon
  { id: 8, color: '#1A1A1A', isStriped: false }, // 8 ball
  { id: 9, color: '#FFD700', isStriped: true },  // Yellow striped
  { id: 10, color: '#0066CC', isStriped: true }, // Blue striped
  { id: 11, color: '#CC0000', isStriped: true }, // Red striped
  { id: 12, color: '#6B0090', isStriped: true }, // Purple striped
  { id: 13, color: '#FF6B00', isStriped: true }, // Orange striped
  { id: 14, color: '#006B00', isStriped: true }, // Green striped
  { id: 15, color: '#800000', isStriped: true }, // Maroon striped
];

const POCKETS: Pocket[] = [
  { x: POCKET_RADIUS, y: POCKET_RADIUS, radius: POCKET_RADIUS },
  { x: TABLE_WIDTH / 2, y: POCKET_RADIUS - 5, radius: POCKET_RADIUS },
  { x: TABLE_WIDTH - POCKET_RADIUS, y: POCKET_RADIUS, radius: POCKET_RADIUS },
  { x: POCKET_RADIUS, y: TABLE_HEIGHT - POCKET_RADIUS, radius: POCKET_RADIUS },
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - POCKET_RADIUS + 5, radius: POCKET_RADIUS },
  { x: TABLE_WIDTH - POCKET_RADIUS, y: TABLE_HEIGHT - POCKET_RADIUS, radius: POCKET_RADIUS },
];

const createInitialBalls = (): Ball[] => {
  const balls: Ball[] = [];
  const startX = TABLE_WIDTH * 0.7;
  const startY = TABLE_HEIGHT / 2;
  const spacing = BALL_RADIUS * 2.1;

  // Cue ball
  balls.push({
    id: 0,
    x: TABLE_WIDTH * 0.25,
    y: TABLE_HEIGHT / 2,
    vx: 0,
    vy: 0,
    color: BALL_COLORS[0].color,
    isStriped: false,
    isPocketed: false,
    radius: BALL_RADIUS,
  });

  // Triangle rack pattern
  const rackPattern = [
    [1],
    [9, 2],
    [3, 8, 10],
    [11, 4, 5, 12],
    [6, 13, 14, 7, 15],
  ];

  let row = 0;
  rackPattern.forEach((rowBalls, rowIndex) => {
    rowBalls.forEach((ballId, colIndex) => {
      const x = startX + rowIndex * spacing * 0.866;
      const y = startY + (colIndex - (rowBalls.length - 1) / 2) * spacing;
      const ballData = BALL_COLORS[ballId];
      balls.push({
        id: ballId,
        x,
        y,
        vx: 0,
        vy: 0,
        color: ballData.color,
        isStriped: ballData.isStriped,
        isPocketed: false,
        radius: BALL_RADIUS,
      });
    });
  });

  return balls;
};

export const useBilliardGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    balls: createInitialBalls(),
    isAiming: true,
    cueAngle: 0,
    cuePower: 0,
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    player1Type: null,
    player2Type: null,
    gameOver: false,
    winner: null,
    foul: false,
    message: 'اللاعب 1 - وجه الكرة البيضاء!',
  });

  const animationRef = useRef<number>();
  const isSimulating = useRef(false);

  const checkCollision = (ball1: Ball, ball2: Ball): boolean => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball1.radius + ball2.radius;
  };

  const resolveCollision = (ball1: Ball, ball2: Ball): void => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const dvx = ball1.vx - ball2.vx;
    const dvy = ball1.vy - ball2.vy;
    const dvn = dvx * nx + dvy * ny;

    if (dvn > 0) return;

    const restitution = 0.95;
    const j = -(1 + restitution) * dvn / 2;

    ball1.vx += j * nx;
    ball1.vy += j * ny;
    ball2.vx -= j * nx;
    ball2.vy -= j * ny;

    // Separate balls
    const overlap = (ball1.radius + ball2.radius - distance) / 2;
    ball1.x -= overlap * nx;
    ball1.y -= overlap * ny;
    ball2.x += overlap * nx;
    ball2.y += overlap * ny;
  };

  const checkPocket = (ball: Ball): boolean => {
    for (const pocket of POCKETS) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < pocket.radius) {
        return true;
      }
    }
    return false;
  };

  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      const newBalls = prev.balls.map(ball => ({ ...ball }));
      let allStopped = true;
      const pocketedThisTurn: Ball[] = [];

      for (const ball of newBalls) {
        if (ball.isPocketed) continue;

        // Apply velocity
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Apply friction
        ball.vx *= FRICTION;
        ball.vy *= FRICTION;

        // Stop if very slow
        if (Math.abs(ball.vx) < MIN_VELOCITY && Math.abs(ball.vy) < MIN_VELOCITY) {
          ball.vx = 0;
          ball.vy = 0;
        }

        if (ball.vx !== 0 || ball.vy !== 0) {
          allStopped = false;
        }

        // Wall collisions
        if (ball.x - ball.radius < 30) {
          ball.x = 30 + ball.radius;
          ball.vx = -ball.vx * 0.8;
        }
        if (ball.x + ball.radius > TABLE_WIDTH - 30) {
          ball.x = TABLE_WIDTH - 30 - ball.radius;
          ball.vx = -ball.vx * 0.8;
        }
        if (ball.y - ball.radius < 30) {
          ball.y = 30 + ball.radius;
          ball.vy = -ball.vy * 0.8;
        }
        if (ball.y + ball.radius > TABLE_HEIGHT - 30) {
          ball.y = TABLE_HEIGHT - 30 - ball.radius;
          ball.vy = -ball.vy * 0.8;
        }

        // Check pockets
        if (checkPocket(ball)) {
          ball.isPocketed = true;
          ball.vx = 0;
          ball.vy = 0;
          pocketedThisTurn.push(ball);
        }
      }

      // Ball-to-ball collisions
      for (let i = 0; i < newBalls.length; i++) {
        for (let j = i + 1; j < newBalls.length; j++) {
          if (newBalls[i].isPocketed || newBalls[j].isPocketed) continue;
          if (checkCollision(newBalls[i], newBalls[j])) {
            resolveCollision(newBalls[i], newBalls[j]);
            allStopped = false;
          }
        }
      }

      let newState = { ...prev, balls: newBalls };

      if (allStopped && isSimulating.current) {
        isSimulating.current = false;
        
        // Handle pocketed balls
        const cueBall = newBalls.find(b => b.id === 0);
        if (cueBall?.isPocketed) {
          // Foul - respawn cue ball
          cueBall.isPocketed = false;
          cueBall.x = TABLE_WIDTH * 0.25;
          cueBall.y = TABLE_HEIGHT / 2;
          newState.foul = true;
          newState.message = 'خطأ! الكرة البيضاء دخلت الجيب';
        }

        // Update scores
        let player1ScoreAdd = 0;
        let player2ScoreAdd = 0;
        
        pocketedThisTurn.forEach(ball => {
          if (ball.id === 0) return;
          if (ball.id === 8) {
            // 8 ball logic
            const playerBalls = newBalls.filter(b => 
              prev.currentPlayer === 1 
                ? prev.player1Type === 'solid' ? !b.isStriped && b.id !== 0 && b.id !== 8 : b.isStriped
                : prev.player2Type === 'solid' ? !b.isStriped && b.id !== 0 && b.id !== 8 : b.isStriped
            );
            const allPocketed = playerBalls.every(b => b.isPocketed);
            if (allPocketed) {
              newState.gameOver = true;
              newState.winner = prev.currentPlayer;
              newState.message = `🏆 اللاعب ${prev.currentPlayer} فاز!`;
            } else {
              newState.gameOver = true;
              newState.winner = prev.currentPlayer === 1 ? 2 : 1;
              newState.message = `اللاعب ${prev.currentPlayer === 1 ? 2 : 1} فاز! (الكرة 8 دخلت مبكراً)`;
            }
            return;
          }

          if (prev.currentPlayer === 1) {
            player1ScoreAdd++;
          } else {
            player2ScoreAdd++;
          }
        });

        newState.player1Score += player1ScoreAdd;
        newState.player2Score += player2ScoreAdd;

        // Switch player if no ball pocketed or foul
        if (pocketedThisTurn.length === 0 || newState.foul) {
          newState.currentPlayer = prev.currentPlayer === 1 ? 2 : 1;
        }

        if (!newState.gameOver) {
          newState.message = `اللاعب ${newState.currentPlayer} - دورك!`;
        }

        newState.isAiming = true;
        newState.cuePower = 0;
        newState.foul = false;
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    const animate = () => {
      if (isSimulating.current) {
        updatePhysics();
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updatePhysics]);

  const shoot = useCallback((angle: number, power: number) => {
    setGameState(prev => {
      const newBalls = prev.balls.map(ball => {
        if (ball.id === 0 && !ball.isPocketed) {
          return {
            ...ball,
            vx: Math.cos(angle) * power * 0.3,
            vy: Math.sin(angle) * power * 0.3,
          };
        }
        return ball;
      });
      isSimulating.current = true;
      return {
        ...prev,
        balls: newBalls,
        isAiming: false,
        cuePower: 0,
        message: 'الكرات تتحرك...',
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    isSimulating.current = false;
    setGameState({
      balls: createInitialBalls(),
      isAiming: true,
      cueAngle: 0,
      cuePower: 0,
      currentPlayer: 1,
      player1Score: 0,
      player2Score: 0,
      player1Type: null,
      player2Type: null,
      gameOver: false,
      winner: null,
      foul: false,
      message: 'اللاعب 1 - وجه الكرة البيضاء!',
    });
  }, []);

  return {
    gameState,
    shoot,
    resetGame,
    setGameState,
    POCKETS,
    TABLE_WIDTH,
    TABLE_HEIGHT,
  };
};
