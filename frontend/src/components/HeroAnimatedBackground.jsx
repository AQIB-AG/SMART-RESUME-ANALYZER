import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SHAPES = [
    { size: 280, x: '15%', y: '20%', color: 'rgba(99, 102, 241, 0.12)', delay: 0, duration: 22 },
    { size: 200, x: '75%', y: '25%', color: 'rgba(6, 182, 212, 0.1)', delay: 2, duration: 26 },
    { size: 240, x: '50%', y: '60%', color: 'rgba(0, 119, 255, 0.08)', delay: 4, duration: 24 },
    { size: 160, x: '8%', y: '55%', color: 'rgba(79, 70, 229, 0.1)', delay: 1, duration: 28 },
    { size: 180, x: '85%', y: '65%', color: 'rgba(34, 211, 238, 0.09)', delay: 3, duration: 20 },
    { size: 120, x: '25%', y: '75%', color: 'rgba(99, 102, 241, 0.08)', delay: 5, duration: 25 },
    { size: 140, x: '70%', y: '15%', color: 'rgba(0, 119, 255, 0.07)', delay: 2.5, duration: 23 },
];

/**
 * Decorative 3D-style animated background for the hero section only.
 * Purely visual; no interaction. Uses theme colors (indigo/cyan/blue), low opacity, slow motion.
 * Simplified on mobile and when prefers-reduced-motion is set.
 */
const HeroAnimatedBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsMobile(mq.matches);
    setPrefersReducedMotion(reduced.matches);
    const onResize = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  const shapes = useMemo(() => (isMobile ? SHAPES.slice(0, 4) : SHAPES), [isMobile]);

  if (prefersReducedMotion) {
    return (
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {shapes.slice(0, 3).map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl dark:opacity-80"
            style={{
              width: s.size,
              height: s.size,
              left: s.x,
              top: s.y,
              background: s.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
              width: s.size,
              height: s.size,
              left: s.x,
              top: s.y,
              background: s.color,
            }}
          initial={{ x: '-50%', y: '-50%', rotate: 0, scale: 1 }}
          animate={{
            x: ['-50%', '-48%', '-52%', '-50%'],
            y: ['-50%', '-48%', '-52%', '-50%'],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 0.98, 1],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
      {/* Very subtle static gradient for depth */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05] pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 0%, rgba(99, 102, 241, 0.5) 40%, rgba(6, 182, 212, 0.4) 60%, transparent 100%)',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default HeroAnimatedBackground;
