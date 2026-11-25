import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FloatingHeartItem {
  id: number;
  leftPercent: number;
  delayMs: number;
  size: number;
  color: string;
}

interface FloatingHeartsBurstProps {
  triggerKey: number;
  count?: number;
}

const HEART_COLORS = ['#8E293D', '#C96D7B', '#B88A44', '#D88D97'];

export function FloatingHeartsBurst({
  triggerKey,
  count = 10,
}: FloatingHeartsBurstProps) {
  const [hearts, setHearts] = useState<FloatingHeartItem[]>([]);

  useEffect(() => {
    if (triggerKey <= 0) return;

    const batch: FloatingHeartItem[] = Array.from({ length: count }, (_, idx) => ({
      id: triggerKey * 100 + idx,
      leftPercent: 12 + Math.random() * 76,
      delayMs: idx * 95,
      size: 16 + Math.round(Math.random() * 14),
      color: HEART_COLORS[idx % HEART_COLORS.length],
    }));

    setHearts(batch);
    const timer = window.setTimeout(() => {
      setHearts([]);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [triggerKey, count]);

  if (hearts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-16 z-40 h-64 overflow-hidden"
    >
      {hearts.map((heart) => (
        <div
          key={heart.id}
          style={{
            left: `${heart.leftPercent}%`,
            bottom: '8px',
            animationDelay: `${heart.delayMs}ms`,
          }}
          className="absolute animate-float-heart opacity-0"
        >
          <Heart
            size={heart.size}
            fill={heart.color}
            color={heart.color}
            className="drop-shadow-sm"
          />
        </div>
      ))}
    </div>
  );
}
