import { useCallback, useRef, useEffect, useState } from "react";

type SoundType = "place" | "error" | "hint" | "complete" | "click" | "undo" | "achievement";

// Web Audio API based sound effects
function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.1
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playPlaceSound(ctx: AudioContext) {
  playTone(ctx, 520, 0.1, "sine", 0.08);
  setTimeout(() => playTone(ctx, 780, 0.08, "sine", 0.05), 50);
}

function playErrorSound(ctx: AudioContext) {
  playTone(ctx, 200, 0.15, "sawtooth", 0.08);
  setTimeout(() => playTone(ctx, 150, 0.2, "sawtooth", 0.06), 100);
}

function playHintSound(ctx: AudioContext) {
  playTone(ctx, 440, 0.1, "sine", 0.06);
  setTimeout(() => playTone(ctx, 554, 0.1, "sine", 0.06), 80);
  setTimeout(() => playTone(ctx, 659, 0.15, "sine", 0.06), 160);
}

function playCompleteSound(ctx: AudioContext) {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(ctx, freq, 0.3, "sine", 0.1), i * 150);
  });
}

function playClickSound(ctx: AudioContext) {
  playTone(ctx, 800, 0.03, "sine", 0.04);
}

function playUndoSound(ctx: AudioContext) {
  playTone(ctx, 400, 0.08, "sine", 0.05);
  setTimeout(() => playTone(ctx, 300, 0.1, "sine", 0.04), 50);
}

function playAchievementSound(ctx: AudioContext) {
  // Triumphant fanfare-like sound
  const notes = [523, 659, 784, 880, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(ctx, freq, 0.25, "sine", 0.12), i * 100);
  });
  // Add a subtle shimmer effect
  setTimeout(() => {
    playTone(ctx, 1318, 0.4, "sine", 0.06);
    playTone(ctx, 1568, 0.4, "sine", 0.05);
  }, 500);
}

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("sudoku_sound_enabled");
    return saved !== "false";
  });

  useEffect(() => {
    localStorage.setItem("sudoku_sound_enabled", String(soundEnabled));
  }, [soundEnabled]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    switch (type) {
      case "place":
        playPlaceSound(ctx);
        break;
      case "error":
        playErrorSound(ctx);
        break;
      case "hint":
        playHintSound(ctx);
        break;
      case "complete":
        playCompleteSound(ctx);
        break;
      case "click":
        playClickSound(ctx);
        break;
      case "undo":
        playUndoSound(ctx);
        break;
      case "achievement":
        playAchievementSound(ctx);
        break;
    }
  }, [soundEnabled, initAudio]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return { playSound, soundEnabled, toggleSound, initAudio };
}

// Ambient music using Web Audio API
export function useAmbientMusic() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem("sudoku_music_enabled");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sudoku_music_enabled", String(musicEnabled));
  }, [musicEnabled]);

  const startMusic = useCallback(() => {
    if (!musicEnabled || isPlaying) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // Create ambient drones
      const frequencies = [65.41, 98.00, 130.81]; // C2, G2, C3
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Slow LFO for volume
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + i * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        
        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        
        osc.start();
        lfo.start();
        
        oscillatorsRef.current.push(osc);
      });

      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to start ambient music:", e);
    }
  }, [musicEnabled, isPlaying]);

  const stopMusic = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch {}
    });
    oscillatorsRef.current = [];
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsPlaying(false);
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => {
      const newValue = !prev;
      if (newValue && !isPlaying) {
        setTimeout(startMusic, 0);
      } else if (!newValue && isPlaying) {
        stopMusic();
      }
      return newValue;
    });
  }, [isPlaying, startMusic, stopMusic]);

  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  return { startMusic, stopMusic, toggleMusic, musicEnabled, isPlaying };
}
