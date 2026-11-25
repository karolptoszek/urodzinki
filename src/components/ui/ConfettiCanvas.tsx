import { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  active: boolean;
  burstKey?: number;
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

const COLORS = ['#8E293D', '#B88A44', '#D9A5A9', '#3D6B58', '#E9D8B8', '#FFFFFF'];

export function ConfettiCanvas({
  active,
  burstKey = 0,
  durationMs = 3600,
}: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = width < 640 ? 72 : 110;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const startX = width * (0.2 + Math.random() * 0.6);
      const startY = height * (0.25 + Math.random() * 0.2);
      const angle = fromLeft
        ? -Math.PI / 2 - (Math.random() * 0.7 - 0.35)
        : -Math.PI / 2 + (Math.random() * 0.7 - 0.35);
      const speed = 5 + Math.random() * 8.5;

      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        shape: i % 3 === 0 ? 'circle' : 'rect',
      };
    });

    const startTime = performance.now();
    let rafId = 0;

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let anyVisible = false;
      for (const p of particles) {
        p.vy += 0.24; // grawitacja
        p.vx *= 0.992; // opór powietrza
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (elapsed > durationMs * 0.6) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        if (p.opacity > 0.01 && p.y < height + 40) {
          anyVisible = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          }
          ctx.restore();
        }
      }

      if (anyVisible && elapsed < durationMs) {
        rafId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [active, burstKey, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
    />
  );
}
