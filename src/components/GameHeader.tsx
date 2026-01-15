import React from 'react';
import { motion } from 'framer-motion';

const GameHeader: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-6"
    >
      <motion.div
        className="inline-flex items-center gap-4"
        whileHover={{ scale: 1.02 }}
      >
        {/* 8 Ball Icon */}
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-lg">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm">8</span>
            </div>
            <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-white/30" />
          </div>
        </motion.div>

        {/* Title */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-gold via-gold-glow to-gold bg-clip-text text-transparent animate-glow">
              بلياردو
            </span>
            <span className="text-foreground ml-3">2026</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            لعبة البلياردو الكلاسيكية
          </p>
        </div>

        {/* Cue stick decoration */}
        <motion.div
          className="hidden md:block w-32 h-2 rounded-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-800"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span>حرّك الفأرة للتصويب</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-green" />
          <span>اضغط مع الاستمرار لتحديد القوة</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ball-red" />
          <span>أفلت للضرب</span>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default GameHeader;
