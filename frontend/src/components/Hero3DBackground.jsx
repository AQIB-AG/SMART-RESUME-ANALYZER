import { useRef, useEffect, useCallback, useState } from 'react';

// Theme colors: electric blue, cyan, indigo (for large glowing orbs)
const COLORS = [
  { r: 0, g: 119, b: 255 },    // electric blue
  { r: 6, g: 182, b: 212 },    // cyan
  { r: 99, g: 102, b: 241 },   // indigo-500
  { r: 79, g: 70, b: 229 },    // indigo-600
  { r: 34, g: 211, b: 238 },   // cyan-400
];

function createOrbs(count) {
  const orbs = [];
  for (let i = 0; i < count; i++) {
    const color = COLORS[i % COLORS.length];
    orbs.push({
      z: 0.3 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      orbitRadius: 0.12 + Math.random() * 0.4,
      orbitSpeed: 0.0004 + Math.random() * 0.0005,
      floatPhase: Math.random() * Math.PI * 2,
      floatAmplitude: 0.03 + Math.random() * 0.05,
      radius: 20 + Math.random() * 40,
      color,
      opacity: 0.6 + Math.random() * 0.3,
    });
  }
  return orbs;
}

function Hero3DBackground() {
  const canvasRef = useRef(null);
  const orbsRef = useRef([]);
  const frameRef = useRef(0);
  const sizeRef = useRef({ width: 800, height: 600 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const onResize = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  const draw = useCallback((ctx, width, height, orbs) => {
    const cx = width / 2;
    const cy = height / 2;
    const t = Date.now();

    ctx.clearRect(0, 0, width, height);

    const projected = orbs.map((p) => {
      const orbitX = Math.cos(p.angle + p.orbitSpeed * t) * p.orbitRadius * width;
      const orbitY = Math.sin(p.angle + p.orbitSpeed * t) * p.orbitRadius * height;
      const floatY = Math.sin(p.floatPhase + t * 0.001) * p.floatAmplitude * height;
      const x = cx + orbitX;
      const y = cy + orbitY + floatY;
      const scale = 0.5 + 0.5 * p.z;
      const radius = p.radius * scale;
      const alpha = p.opacity * (0.6 + 0.4 * p.z);
      return { x, y, radius, alpha, color: p.color, z: p.z };
    });

    projected.sort((a, b) => a.z - b.z);

    projected.forEach(({ x, y, radius, alpha, color }) => {
      const glowRadius = radius * 2.5;
      ctx.shadowBlur = 40 + radius;
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.8})`;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.7})`);
      gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const count = isMobile ? 6 : 12;
    if (!orbsRef.current.length || orbsRef.current.length !== count) {
      orbsRef.current = createOrbs(count);
    }

    const ctx = canvas.getContext('2d');
    let ticking = true;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      sizeRef.current = { width: rect.width, height: rect.height };
      return sizeRef.current;
    };

    setSize();
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    const loop = () => {
      if (!ticking) return;
      const { width, height } = sizeRef.current;
      draw(ctx, width, height, orbsRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      ticking = false;
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [draw, isMobile]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Subtle overlay for visibility (STEP 2) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(99,102,241,0.15), transparent 70%)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'block',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default Hero3DBackground;
