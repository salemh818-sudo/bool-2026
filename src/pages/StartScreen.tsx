import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
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
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-12"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-b from-gold via-gold/80 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
            بلياردو
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <span className="text-4xl md:text-5xl font-bold text-neon animate-pulse-neon">
              2026
            </span>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </motion.div>

        {/* 8-ball decoration */}
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-full shadow-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">8</span>
              </div>
            </div>
            <div className="absolute top-2 left-3 w-4 h-4 bg-white/30 rounded-full" />
          </div>
        </motion.div>
      </motion.div>

      {/* Mode selection buttons */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 flex flex-col md:flex-row gap-6"
      >
        {/* Online button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/auth?mode=online')}
            className="group relative w-64 h-32 text-2xl font-bold bg-gradient-to-br from-neon/20 to-neon/5 border-2 border-neon/50 hover:border-neon text-neon hover:bg-neon/20 transition-all duration-300 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center gap-3">
              <Wifi className="w-10 h-10" />
              <span>أونلاين</span>
            </div>
          </Button>
        </motion.div>

        {/* Offline button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/offline-setup')}
            className="group relative w-64 h-32 text-2xl font-bold bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/50 hover:border-gold text-gold hover:bg-gold/20 transition-all duration-300 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center gap-3">
              <WifiOff className="w-10 h-10" />
              <span>أوفلاين</span>
            </div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative balls */}
      <div className="absolute bottom-10 left-10 opacity-20">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-8 h-8 rounded-full bg-ball-1"
        />
      </div>
      <div className="absolute bottom-20 right-16 opacity-20">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          className="w-6 h-6 rounded-full bg-ball-2"
        />
      </div>
      <div className="absolute top-20 right-10 opacity-20">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
          className="w-10 h-10 rounded-full bg-ball-3"
        />
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-muted-foreground text-sm"
      >
        <p>🎱 استمتع باللعب مع أصدقائك</p>
      </motion.footer>
    </div>
  );
};

export default StartScreen;
