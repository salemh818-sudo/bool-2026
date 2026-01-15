import React from 'react';
import { motion } from 'framer-motion';
import BilliardTable from '@/components/BilliardTable';
import GameHUD from '@/components/GameHUD';
import GameHeader from '@/components/GameHeader';
import { useBilliardGame } from '@/hooks/useBilliardGame';

const Index = () => {
  const { gameState, shoot, resetGame, POCKETS, TABLE_WIDTH, TABLE_HEIGHT } = useBilliardGame();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Ambient lights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--gold) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--gold) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 container mx-auto px-4 py-6"
      >
        <GameHeader />

        {/* Game table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <BilliardTable
            balls={gameState.balls}
            pockets={POCKETS}
            isAiming={gameState.isAiming}
            onShoot={shoot}
            tableWidth={TABLE_WIDTH}
            tableHeight={TABLE_HEIGHT}
          />
        </motion.div>

        {/* HUD */}
        <GameHUD gameState={gameState} onReset={resetGame} />

        {/* Pocketed balls display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <h3 className="text-sm text-muted-foreground mb-3 text-center">
              الكرات المحققة
            </h3>
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
                <span className="text-muted-foreground text-sm">
                  لم يتم تحقيق أي كرات بعد
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-muted-foreground text-sm">
        <p>بلياردو 2026 - استمتع باللعب! 🎱</p>
      </footer>
    </div>
  );
};

export default Index;
