import { useCallback, useState } from 'react';
import { Ball, Pocket } from '@/types/billiard';
import { supabase } from '@/integrations/supabase/client';

interface ShotResult {
  angle: number;
  power: number;
  targetBallId: number;
  confidence: number;
  reasoning: string;
}

interface UseAIOpponentResult {
  calculateShot: (
    balls: Ball[],
    pockets: Pocket[],
    playerType: 'solid' | 'striped' | null
  ) => Promise<ShotResult | null>;
  isCalculating: boolean;
  lastShotInfo: ShotResult | null;
}

export const useAIOpponent = (): UseAIOpponentResult => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastShotInfo, setLastShotInfo] = useState<ShotResult | null>(null);

  const calculateLocalShot = useCallback(
    (balls: Ball[], pockets: Pocket[], playerType: 'solid' | 'striped' | null): ShotResult => {
      const cueBall = balls.find(b => b.id === 0 && !b.isPocketed);
      if (!cueBall) {
        return { angle: 0, power: 50, targetBallId: 1, confidence: 0, reasoning: 'لا توجد كرة بيضاء' };
      }

      // Get target balls based on player type
      let targetBalls = balls.filter(b => !b.isPocketed && b.id !== 0 && b.id !== 8);
      
      if (playerType === 'solid') {
        targetBalls = targetBalls.filter(b => !b.isStriped);
      } else if (playerType === 'striped') {
        targetBalls = targetBalls.filter(b => b.isStriped);
      }

      // If no target balls, aim for 8 ball
      if (targetBalls.length === 0) {
        const eightBall = balls.find(b => b.id === 8 && !b.isPocketed);
        if (eightBall) {
          targetBalls = [eightBall];
        }
      }

      if (targetBalls.length === 0) {
        return { angle: 0, power: 30, targetBallId: 0, confidence: 0, reasoning: 'لا توجد كرات للاستهداف' };
      }

      // Find best shot - ball closest to a pocket with clear path
      let bestShot: ShotResult | null = null;
      let bestScore = -Infinity;

      for (const targetBall of targetBalls) {
        for (const pocket of pockets) {
          // Vector from target ball to pocket
          const toPocketX = pocket.x - targetBall.x;
          const toPocketY = pocket.y - targetBall.y;
          const distToPocket = Math.sqrt(toPocketX * toPocketX + toPocketY * toPocketY);

          // Ideal position for cue ball (opposite side of pocket from target)
          const idealCueX = targetBall.x - (toPocketX / distToPocket) * (cueBall.radius * 2);
          const idealCueY = targetBall.y - (toPocketY / distToPocket) * (cueBall.radius * 2);

          // Angle from cue ball to target ball
          const angle = Math.atan2(targetBall.y - cueBall.y, targetBall.x - cueBall.x);

          // Distance from cue ball to target
          const distToTarget = Math.sqrt(
            Math.pow(targetBall.x - cueBall.x, 2) + Math.pow(targetBall.y - cueBall.y, 2)
          );

          // Score based on: closer pocket = better, clearer path = better
          let score = 1000 - distToPocket - distToTarget * 0.5;

          // Check if path to target is clear
          const pathClear = balls.every(b => {
            if (b.isPocketed || b.id === 0 || b.id === targetBall.id) return true;
            
            // Check if ball blocks the path
            const pathLength = distToTarget;
            const ballToBlockerX = b.x - cueBall.x;
            const ballToBlockerY = b.y - cueBall.y;
            const dot = (ballToBlockerX * Math.cos(angle) + ballToBlockerY * Math.sin(angle));
            
            if (dot < 0 || dot > pathLength) return true;
            
            const perpDist = Math.abs(-Math.sin(angle) * ballToBlockerX + Math.cos(angle) * ballToBlockerY);
            return perpDist > (cueBall.radius + b.radius) * 1.2;
          });

          if (!pathClear) {
            score -= 500;
          }

          // Check alignment - how well lined up is cue->target->pocket
          const cueToTargetAngle = Math.atan2(targetBall.y - cueBall.y, targetBall.x - cueBall.x);
          const targetToPocketAngle = Math.atan2(toPocketY, toPocketX);
          let angleDiff = Math.abs(cueToTargetAngle - targetToPocketAngle);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
          
          // Better alignment = higher score
          score += (Math.PI - angleDiff) * 100;

          if (score > bestScore) {
            bestScore = score;
            
            // Calculate power based on distance
            const power = Math.min(80, Math.max(25, distToTarget * 0.15 + 30));
            
            bestShot = {
              angle,
              power,
              targetBallId: targetBall.id,
              confidence: Math.min(1, Math.max(0, (score + 500) / 1500)),
              reasoning: pathClear 
                ? `استهداف الكرة ${targetBall.id} نحو الجيب`
                : `محاولة ضرب الكرة ${targetBall.id}`,
            };
          }
        }
      }

      return bestShot || { 
        angle: Math.atan2(targetBalls[0].y - cueBall.y, targetBalls[0].x - cueBall.x),
        power: 45,
        targetBallId: targetBalls[0].id,
        confidence: 0.3,
        reasoning: 'ضربة عشوائية',
      };
    },
    []
  );

  const calculateShot = useCallback(
    async (
      balls: Ball[],
      pockets: Pocket[],
      playerType: 'solid' | 'striped' | null
    ): Promise<ShotResult | null> => {
      setIsCalculating(true);

      try {
        // Try AI calculation first
        const { data, error } = await supabase.functions.invoke('billiard-ai', {
          body: {
            action: 'calculate_shot',
            gameContext: {
              balls,
              pockets,
              currentPlayer: 2,
              player1Type: null,
              player2Type: playerType,
            },
          },
        });

        if (!error && data?.success && data?.shot) {
          const shot = data.shot as ShotResult;
          setLastShotInfo(shot);
          return shot;
        }
      } catch (error) {
        console.log('AI calculation failed, using local calculation');
      }

      // Fallback to local calculation
      const localShot = calculateLocalShot(balls, pockets, playerType);
      setLastShotInfo(localShot);
      return localShot;
    },
    [calculateLocalShot]
  );

  return {
    calculateShot,
    isCalculating,
    lastShotInfo,
  };
};
