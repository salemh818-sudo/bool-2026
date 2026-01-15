import { useCallback, useRef, useEffect } from 'react';

// Generate sound effects using Web Audio API
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = createAudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playBallHit = useCallback((intensity: number = 0.5) => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300 + intensity * 200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3 * intensity, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, [getAudioContext]);

  const playWallHit = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, [getAudioContext]);

  const playCueHit = useCallback((power: number) => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150 + power * 100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.15 + power * 0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  }, [getAudioContext]);

  const playPocket = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    
    // Create a deeper, more satisfying pocket sound
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + 0.4);
    oscillator2.stop(ctx.currentTime + 0.35);
  }, [getAudioContext]);

  const playWin = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }, [getAudioContext]);

  const playFoul = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.35);
  }, [getAudioContext]);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return !isMutedRef.current;
  }, []);

  const isMuted = useCallback(() => isMutedRef.current, []);

  return {
    playBallHit,
    playWallHit,
    playCueHit,
    playPocket,
    playWin,
    playFoul,
    toggleMute,
    isMuted,
  };
};
