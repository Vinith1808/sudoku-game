import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, COLOR_PRESETS } from '@/hooks/useTheme';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const { theme, colorPreset, highContrast } = useTheme();

  // Get colors based on preset
  const presetColors = useMemo(() => {
    const preset = COLOR_PRESETS.find(p => p.id === colorPreset) || COLOR_PRESETS[0];
    return {
      primaryHue: parseInt(preset.colors.primary),
      accentHue: parseInt(preset.colors.accent),
    };
  }, [colorPreset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Theme-aware colors
    const isDark = theme === 'dark';
    const fadeColor = isDark ? 'rgba(10, 15, 25, 0.08)' : 'rgba(240, 245, 250, 0.12)';
    const particleLightness = isDark ? 60 : 45;
    const connectionLightness = isDark ? 50 : 40;
    const baseOpacity = highContrast ? 0.2 : (isDark ? 0.5 : 0.35);

    // Initialize particles with preset colors
    const particleCount = highContrast ? 30 : 50;
    const { primaryHue, accentHue } = presetColors;
    
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * baseOpacity + 0.1,
      hue: Math.random() > 0.5 ? primaryHue + Math.random() * 30 - 15 : accentHue + Math.random() * 30 - 15,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += (dx / distance) * force * 0.02;
          particle.vy += (dy / distance) * force * 0.02;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 80%, ${particleLightness}%, ${particle.opacity})`;
        ctx.fill();

        // Draw connections (reduced in high contrast mode)
        if (!highContrast) {
          particlesRef.current.slice(i + 1).forEach((other) => {
            const dist = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
            );
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              const connectionOpacity = isDark ? 0.15 : 0.2;
              ctx.strokeStyle = `hsla(${(particle.hue + other.hue) / 2}, 70%, ${connectionLightness}%, ${connectionOpacity * (1 - dist / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme, presetColors, highContrast]);

  // Don't render gradient overlays in high contrast mode
  if (highContrast) {
    return (
      <motion.canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: theme === 'dark' ? 0.3 : 0.2 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    );
  }

  return (
    <>
      <motion.canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        key={`canvas-${colorPreset}-${theme}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: theme === 'dark' ? 0.6 : 0.4 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {/* Gradient overlays with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`gradient1-${colorPreset}-${theme}`}
          className="fixed inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            background: [
              `radial-gradient(circle at 20% 80%, hsl(${presetColors.primaryHue} 80% 50% / 0.15) 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 20%, hsl(${presetColors.primaryHue} 80% 50% / 0.15) 0%, transparent 50%)`,
              `radial-gradient(circle at 50% 50%, hsl(${presetColors.primaryHue} 80% 50% / 0.1) 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 80%, hsl(${presetColors.primaryHue} 80% 50% / 0.15) 0%, transparent 50%)`,
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.8, ease: "easeInOut" },
            background: {
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={`gradient2-${colorPreset}-${theme}`}
          className="fixed inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            background: [
              `radial-gradient(circle at 80% 80%, hsl(${presetColors.accentHue} 80% 50% / 0.1) 0%, transparent 40%)`,
              `radial-gradient(circle at 20% 20%, hsl(${presetColors.accentHue} 80% 50% / 0.1) 0%, transparent 40%)`,
              `radial-gradient(circle at 80% 80%, hsl(${presetColors.accentHue} 80% 50% / 0.1) 0%, transparent 40%)`,
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.8, ease: "easeInOut" },
            background: {
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        />
      </AnimatePresence>
    </>
  );
};

export default BackgroundAnimation;
