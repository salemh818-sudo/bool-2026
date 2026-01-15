import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const OfflineSetup = () => {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const names = playerNames.slice(0, playerCount).map((name, i) => 
      name.trim() || `لاعب ${i + 1}`
    );
    navigate('/game', { 
      state: { 
        mode: 'offline', 
        playerCount, 
        playerNames: names,
        teamMode: playerCount === 4
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center relative px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 z-20"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gold hover:text-gold/80 gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          رجوع
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gold mb-2">وضع الأوفلاين</h1>
        <p className="text-muted-foreground">اختر عدد اللاعبين وأدخل أسماءهم</p>
      </motion.div>

      {/* Player count selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-8"
      >
        <h2 className="text-xl text-foreground mb-4 text-center">عدد اللاعبين</h2>
        <div className="flex gap-4 justify-center">
          {[2, 3, 4].map((count) => (
            <motion.div
              key={count}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handlePlayerCountChange(count)}
                variant={playerCount === count ? "default" : "outline"}
                className={`w-20 h-20 text-2xl font-bold rounded-xl ${
                  playerCount === count 
                    ? 'bg-gold text-background border-gold' 
                    : 'border-gold/50 text-gold hover:bg-gold/10'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Users className="w-6 h-6 mb-1" />
                  {count}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
        
        {playerCount === 4 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-neon text-sm mt-4"
          >
            وضع الفريقين: لاعب 1 و 2 ضد لاعب 3 و 4
          </motion.p>
        )}
      </motion.div>

      {/* Player names */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 w-full max-w-md mb-8"
      >
        <h2 className="text-xl text-foreground mb-4 text-center">أسماء اللاعبين</h2>
        <div className="space-y-4">
          {Array.from({ length: playerCount }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-background font-bold ${
                    playerCount === 4 
                      ? index < 2 ? 'bg-neon' : 'bg-ball-5'
                      : 'bg-gold'
                  }`}
                >
                  {index + 1}
                </div>
                <Input
                  placeholder={`لاعب ${index + 1}`}
                  value={playerNames[index]}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="flex-1 bg-card/50 border-border text-foreground placeholder:text-muted-foreground text-right"
                />
              </div>
              {playerCount === 4 && index === 1 && (
                <div className="border-b border-dashed border-muted-foreground/30 my-4" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleStart}
          className="w-64 h-16 text-xl font-bold bg-gradient-to-r from-gold to-amber-500 text-background hover:from-amber-500 hover:to-gold rounded-xl gap-3"
        >
          <span>ابدأ اللعب</span>
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
};

export default OfflineSetup;
