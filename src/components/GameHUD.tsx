import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '@/types/billiard';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Zap } from 'lucide-react';

interface GameHUDProps {
  gameState: GameState;
  onReset: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ gameState, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      {/* Score board */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Player 1 */}
        <motion.div
          className={`bg-card rounded-xl p-4 border-2 transition-all ${
            gameState.currentPlayer === 1
              ? 'border-gold shadow-lg shadow-gold/20'
              : 'border-border'
          }`}
          animate={{
            scale: gameState.currentPlayer === 1 ? 1.02 : 1,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-ball-blue" />
            <span className="text-sm text-muted-foreground">اللاعب 1</span>
          </div>
          <div className="text-3xl font-bold text-gold">
            {gameState.player1Score}
          </div>
          {gameState.currentPlayer === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2 text-xs text-neon-green"
            >
              <Zap className="w-3 h-3" />
              دورك
            </motion.div>
          )}
        </motion.div>

        {/* Message display */}
        <motion.div
          key={gameState.message}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border flex items-center justify-center"
        >
          <p className="text-center text-foreground font-medium">
            {gameState.message}
          </p>
        </motion.div>

        {/* Player 2 */}
        <motion.div
          className={`bg-card rounded-xl p-4 border-2 transition-all ${
            gameState.currentPlayer === 2
              ? 'border-gold shadow-lg shadow-gold/20'
              : 'border-border'
          }`}
          animate={{
            scale: gameState.currentPlayer === 2 ? 1.02 : 1,
          }}
        >
          <div className="flex items-center gap-2 mb-2 justify-end">
            <span className="text-sm text-muted-foreground">اللاعب 2</span>
            <div className="w-3 h-3 rounded-full bg-ball-red" />
          </div>
          <div className="text-3xl font-bold text-gold text-right">
            {gameState.player2Score}
          </div>
          {gameState.currentPlayer === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2 text-xs text-neon-green justify-end"
            >
              دورك
              <Zap className="w-3 h-3" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="gap-2 border-gold/50 text-gold hover:bg-gold/10"
        >
          <RotateCcw className="w-4 h-4" />
          لعبة جديدة
        </Button>
      </div>

      {/* Game over overlay */}
      {gameState.gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl p-8 border border-gold shadow-2xl shadow-gold/20 text-center max-w-md"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="w-20 h-20 mx-auto text-gold mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gold mb-2">
              🎉 مبروك! 🎉
            </h2>
            <p className="text-xl text-foreground mb-6">
              اللاعب {gameState.winner} فاز!
            </p>
            <Button
              onClick={onReset}
              className="gap-2 bg-gold text-primary-foreground hover:bg-gold-glow"
            >
              <RotateCcw className="w-4 h-4" />
              العب مرة أخرى
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GameHUD;
