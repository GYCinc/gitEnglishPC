import React, { useEffect, useState } from 'react';

// Simple lightweight confetti using CSS animations or minimal DOM elements
// Following "Vibe Coding" - keep it simple, no heavy canvas libraries if possible
// We will generate a few "particles" that fall down

const COLORS = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7'];

interface ConfettiParticleProps {
  left: string;
  animationDelay: string;
  backgroundColor: string;
}

const Particle: React.FC<ConfettiParticleProps> = ({ left, animationDelay, backgroundColor }) => (
  <div
    style={{
      position: 'fixed',
      top: '-10px',
      left,
      width: '10px',
      height: '10px',
      backgroundColor,
      animation: `fall 2.5s linear forwards`,
      animationDelay,
      zIndex: 9999,
      borderRadius: '2px',
    }}
  />
);

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  // Generate deterministic-ish random particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    animationDelay: `${Math.random() * 0.5}s`,
    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
        {particles.map(p => (
          <Particle key={p.id} {...p} />
        ))}
      </div>
    </>
  );
};

export default Confetti;
