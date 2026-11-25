import { CheckCircle2, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { BIRTHDAY_CONFIG } from '../../config/birthdayConfig';
import { ScratchCardItem } from '../../types/birthday';
import { soundEngine } from '../../utils/soundEngine';
import { ConfettiCanvas } from '../ui/ConfettiCanvas';
import { TactileButton } from '../ui/TactileButton';

interface ScratchStageProps {
  revealedIds: string[];
  onRevealCard: (cardId: string) => void;
  onContinue: () => void;
}

const FOIL_STYLES: Record<
  ScratchCardItem['foilTone'],
  { start: string; mid: string; end: string; text: string }
> = {
  gold: {
    start: '#D8BA7D',
    mid: '#C49F57',
    end: '#AE8640',
    text: '#543E16',
  },
  champagne: {
    start: '#E2D4BE',
    mid: '#CFC0A7',
    end: '#B8A68B',
    text: '#4D4132',
  },
  burgundy: {
    start: '#B86E7C',
    mid: '#9B4B5B',
    end: '#803444',
    text: '#FFF5F6',
  },
};

interface SingleScratchCardProps {
  card: ScratchCardItem;
  alreadyRevealed: boolean;
  onCompleteReveal: (cardId: string) => void;
}

function SingleScratchCard({
  card,
  alreadyRevealed,
  onCompleteReveal,
}: SingleScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const revealedRef = useRef(alreadyRevealed);
  const lastSampleRef = useRef(0);
  const [justRevealed, setJustRevealed] = useState(false);

  useEffect(() => {
    revealedRef.current = alreadyRevealed;
  }, [alreadyRevealed]);

  useEffect(() => {
    if (alreadyRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const tone = FOIL_STYLES[card.foilTone];

      // Metaliczna folia zdrapki
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, tone.start);
      grad.addColorStop(0.5, tone.mid);
      grad.addColorStop(1, tone.end);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Delikatne ukośne prążki zdrapki
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      for (let x = -rect.height; x < rect.width + rect.height; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + rect.height, rect.height);
        ctx.stroke();
      }

      // Etykieta na warstwie do zdrapania
      ctx.fillStyle = tone.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(card.label.toUpperCase(), rect.width / 2, rect.height / 2 - 11);
      ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Zdrap palcem', rect.width / 2, rect.height / 2 + 12);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [alreadyRevealed, card.foilTone, card.label]);

  const checkProgress = () => {
    if (revealedRef.current) return;
    const now = performance.now();
    if (now - lastSampleRef.current < 85) return;
    lastSampleRef.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { width, height } = canvas;
    if (width === 0 || height === 0) return;

    const imageData = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    let sampled = 0;
    // Próbkujemy co 16 piksel dla maksymalnej wydajności na iPhonie
    const stride = 16 * 4;
    for (let i = 3; i < imageData.length; i += stride) {
      sampled++;
      if (imageData[i] < 40) cleared++;
    }

    if (sampled > 0 && cleared / sampled >= 0.45) {
      revealedRef.current = true;
      setJustRevealed(true);
      soundEngine.playRevealChime();
      onCompleteReveal(card.id);
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 38;

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
    soundEngine.playScratchTick();
    checkProgress();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = null;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || revealedRef.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    if (!revealedRef.current) {
      lastSampleRef.current = 0;
      checkProgress();
    }
  };

  return (
    <article
      className={`relative rounded-2xl bg-white border overflow-hidden min-h-[188px] flex flex-col justify-between p-5 transition-transform duration-300 ${
        alreadyRevealed
          ? 'border-[#3D6B58]/40 shadow-sm'
          : 'border-[#E6DFD6] shadow-[0_8px_24px_-14px_rgba(35,28,25,0.12)]'
      } ${justRevealed ? 'scale-[1.02]' : 'scale-100'}`}
    >
      {/* Ukryta zawartość pod zdrapką */}
      <div className="flex items-center justify-between text-xs text-[#6E625B] mb-2">
        <span className="font-semibold text-[#8E293D]">{card.label}</span>
        {alreadyRevealed && (
          <span className="inline-flex items-center gap-1 text-[#3D6B58] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Odebrano
          </span>
        )}
      </div>

      <p className="text-base sm:text-lg font-medium text-[#231C19] leading-snug my-auto py-2">
        {card.message}
      </p>

      {/* Warstwa Canvas do zdrapywania — znika płynnie po odkryciu */}
      {!alreadyRevealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label={`Pole zdrapki: ${card.label}`}
          style={{ touchAction: 'none' }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
        />
      )}
    </article>
  );
}

export function ScratchStage({
  revealedIds,
  onRevealCard,
  onContinue,
}: ScratchStageProps) {
  const { scratchStage } = BIRTHDAY_CONFIG;
  const total = scratchStage.cards.length;
  const revealedCount = revealedIds.length;
  const allRevealed = revealedCount >= total;
  const [celebrateKey, setCelebrateKey] = useState(0);

  const handleReveal = (id: string) => {
    if (revealedIds.includes(id)) return;
    const nextCount = revealedIds.length + 1;
    onRevealCard(id);
    if (nextCount >= total) {
      setCelebrateKey((k) => k + 1);
      soundEngine.playCelebration();
    }
  };

  return (
    <section
      aria-label="Zdrapka niespodzianek"
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-12"
    >
      <ConfettiCanvas active={celebrateKey > 0} burstKey={celebrateKey} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#231C19]">
          {scratchStage.title}
        </h1>

        <div className="text-sm font-medium text-[#231C19] tabular-nums shrink-0">
          Odkryto <span className="text-[#8E293D] font-semibold">{revealedCount}</span> z {total}
        </div>
      </div>

      {!allRevealed && (
        <p className="text-xs sm:text-sm text-[#6E625B] mb-5">
          {scratchStage.instruction}
        </p>
      )}

      {/* Siatka zdrapek */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scratchStage.cards.map((card) => (
          <SingleScratchCard
            key={card.id}
            card={card}
            alreadyRevealed={revealedIds.includes(card.id)}
            onCompleteReveal={handleReveal}
          />
        ))}
      </div>

      {/* Komunikat po odkryciu wszystkich kuponów */}
      {allRevealed && (
        <div className="mt-8 rounded-3xl bg-white border border-[#3D6B58]/35 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3D6B58]/10 text-[#3D6B58] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#231C19]">
              {scratchStage.completionTitle}
            </h2>
          </div>

          <div className="hidden sm:block shrink-0">
            <TactileButton onClick={onContinue}>{scratchStage.ctaLabel}</TactileButton>
          </div>
        </div>
      )}

      {/* Mobilny przycisk dalej po odkryciu wszystkich zdrapek */}
      {allRevealed && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 p-4 pb-safe bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent">
          <TactileButton onClick={onContinue} className="w-full">
            {scratchStage.ctaLabel}
          </TactileButton>
        </div>
      )}
    </section>
  );
}
