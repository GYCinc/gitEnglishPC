import React, { useCallback, useEffect, useRef, useState } from 'react';

const CONFETTI_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const ConfettiExplosion: React.FC<{ active: boolean; onComplete?: () => void }> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particles = useRef<Particle[]>([]);

  const createParticles = () => {
      if (!canvasRef.current) return;
      const { width, height } = canvasRef.current;
      const count = 100;

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
          newParticles.push({
              x: width / 2,
              y: height / 2,
              w: Math.random() * 10 + 5,
              h: Math.random() * 10 + 5,
              vx: (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20 - 10, // Initial upward burst
              color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
              rotation: Math.random() * 360,
              rotationSpeed: (Math.random() - 0.5) * 10,
              opacity: 1
          });
      }
      particles.current = newParticles;
  };

  const animate = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvasRef.current;
      ctx.clearRect(0, 0, width, height);

      let activeParticles = false;

      particles.current.forEach(p => {
          if (p.opacity <= 0) return;
          activeParticles = true;

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5; // Gravity
          p.rotation += p.rotationSpeed;
          p.opacity -= 0.01;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
      });

      if (activeParticles) {
          requestRef.current = requestAnimationFrame(animate);
      } else {
          onComplete && onComplete();
      }
  };

  useEffect(() => {
      if (active) {
          createParticles();
          animate();
      }
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [active]);

  if (!active) return null;

  return (
      <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          className="fixed inset-0 pointer-events-none z-[9999]"
      />
  );
};
