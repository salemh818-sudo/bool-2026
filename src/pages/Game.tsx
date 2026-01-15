import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BilliardTable from '@/components/BilliardTable';
import GameHUD from '@/components/GameHUD';
import { useBilliardGame } from '@/hooks/useBilliardGame';
import { useGameSounds } from '@/hooks/useGameSounds';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface LocationState {
  mode: 'offline' | 'online';
  playerCount?: number;
  playerNames?: string[];
  teamMode?: boolean;
}

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playBallHit, playWallHit, playCueHit, playPocket, playWin, playFoul, toggleMute } = useGameSounds();

  const playerCount = state?.playerCount || 2;
  const playerNames = state?.playerNames || ['لاعب 1', 'لاعب 2', 'لاعب 3', 'لاعب 4'];
  const teamMode = state?.teamMode || false;

  const { 
    gameState, 
    shoot, 
    resetGame, 
    POCKETS, 
    TABLE_WIDTH, 
    TABLE_HEIGHT,
    lastEvent 
  } = useBilliardGame(playerCount, playerNames, teamMode);

  useEffect(() => {
    if (!lastEvent || !soundEnabled) return;

    switch (lastEvent.type) {
      case 'ball_hit':
        playBallHit(lastEvent.intensity || 0.5);
        break;
      case 'wall_hit':
        playWallHit();
        break;
      case 'cue_hit':
        playCueHit(lastEvent.power || 0.5);
        break;
      case 'pocket':
        playPocket();
        break;
      case 'win':
        playWin();
        break;
      case 'foul':
        playFoul();
        break;
    }
  }, [lastEvent, soundEnabled, playBallHit, playWallHit, playCueHit, playPocket, playWin, playFoul]);

  const handleShoot = (angle: number, power: number) => {
    if (soundEnabled) {
      playCueHit(power / 100);
    }
    shoot(angle, power);
  };

  const handleToggleSound = () => {
    const newState = toggleMute();
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gold hover:text-gold/80 gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          خروج
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSound}
          className="text-gold hover:text-gold/80"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gold">بلياردو 2026</h1>
          {teamMode && (
            <p className="text-sm text-muted-foreground mt-1">
              فريق 1: {playerNames[0]} & {playerNames[1]} vs فريق 2: {playerNames[2]} & {playerNames[3]}
            </p>
          )}
        </div>

        <BilliardTable
          balls={gameState.balls}
          pockets={POCKETS}
          isAiming={gameState.isAiming}
          onShoot={handleShoot}
          tableWidth={TABLE_WIDTH}
          tableHeight={TABLE_HEIGHT}
          currentPlayer={gameState.currentPlayer}
        />

        <GameHUD gameState={gameState} onReset={resetGame} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 max-w-4xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <h3 className="text-sm text-muted-foreground mb-3 text-center">الكرات المحققة</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {gameState.balls
                .filter(b => b.isPocketed && b.id !== 0)
                .map(ball => (
                  <motion.div
                    key={ball.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                    style={{ backgroundColor: ball.color }}
                  >
                    <span className="bg-white rounded-full w-4 h-4 flex items-center justify-center text-black">
                      {ball.id}
                    </span>
                  </motion.div>
                ))}
              {gameState.balls.filter(b => b.isPocketed && b.id !== 0).length === 0 && (
                <span className="text-muted-foreground text-sm">لم يتم تحقيق أي كرات بعد</span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <footer className="relative z-10 text-center py-4 text-muted-foreground text-sm">
        <p>بلياردو 2026 🎱</p>
      </footer>
    </div>
  );
};

export default Game;
