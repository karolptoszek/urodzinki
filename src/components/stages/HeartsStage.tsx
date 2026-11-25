import { Heart } from 'lucide-react';
import { useState } from 'react';
import { BIRTHDAY_CONFIG } from '../../config/birthdayConfig';
import { HiddenHeartItem } from '../../types/birthday';
import { soundEngine } from '../../utils/soundEngine';
import { ConfettiCanvas } from '../ui/ConfettiCanvas';
import { FloatingHeartsBurst } from '../ui/FloatingHeartsBurst';
import { TactileButton } from '../ui/TactileButton';

interface HeartsStageProps {
  foundIds: string[];
  onFindHeart: (heartId: string) => void;
  onContinue: () => void;
}

export function HeartsStage({
  foundIds,
  onFindHeart,
  onContinue,
}: HeartsStageProps) {
  const { heartsStage } = BIRTHDAY_CONFIG;
  const total = heartsStage.hearts.length;
  const foundCount = foundIds.length;
  const allFound = foundCount >= total;

  const [poppingId, setPoppingId] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [imgError, setImgError] = useState(false);

  const handleHeartTap = (heart: HiddenHeartItem) => {
    if (foundIds.includes(heart.id)) return;

    setPoppingId(heart.id);
    setBurstKey((k) => k + 1);

    window.setTimeout(() => {
      setPoppingId(null);
    }, 520);

    onFindHeart(heart.id);

    if (foundIds.length + 1 >= total) {
      soundEngine.playCelebration();
      setConfettiKey((k) => k + 1);
    } else {
      soundEngine.playRevealChime();
    }
  };

  return (
    <section
      aria-label="Poszukiwanie ukrytych serduszek"
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-12"
    >
      <ConfettiCanvas active={confettiKey > 0} burstKey={confettiKey} />
      <FloatingHeartsBurst triggerKey={burstKey} count={allFound ? 14 : 5} />

      {/* Jedyny tekst nad planszą + dyskretny licznik */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#231C19] leading-snug max-w-2xl">
          {heartsStage.promptText}
        </h1>

        <div className="text-sm font-semibold text-[#231C19] tabular-nums shrink-0">
          <span className="text-[#8E293D]">{foundCount}</span>/{total}
        </div>
      </div>

      {/* Ilustracja z 7 ukrytymi serduszkami */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#EAE2D7] border border-[#E6DFD6] shadow-[0_12px_36px_-15px_rgba(35,28,25,0.16)] select-none">
        {!imgError ? (
          <img
            src={heartsStage.sceneImageUrl}
            alt="Ilustracja z ukrytymi serduszkami"
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EFE8DF] via-[#E5DDD0] to-[#D9CFC0]" />
        )}

        {heartsStage.hearts.map((heart) => {
          const isFound = foundIds.includes(heart.id);
          const isPopping = poppingId === heart.id;

          if (isFound && !isPopping) {
            return null;
          }

          return (
            <button
              key={heart.id}
              type="button"
              onClick={() => handleHeartTap(heart)}
              aria-label="Odkryj ukryte serduszko"
              style={{
                left: `${heart.xPercent}%`,
                top: `${heart.yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8E293D] rounded-full"
            >
              <span
                style={{
                  transform: `rotate(${heart.rotationDeg}deg) ${
                    isPopping ? 'scale(1.9)' : 'scale(1)'
                  }`,
                  opacity: isPopping ? 0 : 0.78,
                }}
                className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_1px_1px_rgba(35,28,25,0.28)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={isPopping ? '#8E293D' : heart.tintColor}
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="1.2"
                  />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {/* Po znalezieniu wszystkich: napis "Kocham Cię" + przycisk "Kolejna gra" */}
      {allFound && (
        <div className="mt-6 rounded-3xl bg-white border border-[#8E293D]/25 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8E293D]/10 text-[#8E293D] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-[#8E293D]" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#231C19]">
              {heartsStage.completionTitle}
            </h2>
          </div>

          <div className="hidden sm:block shrink-0">
            <TactileButton onClick={onContinue}>{heartsStage.ctaLabel}</TactileButton>
          </div>
        </div>
      )}

      {/* Mobilny przycisk w strefie kciuka po znalezieniu wszystkich serduszek */}
      {allFound && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 p-4 pb-safe bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent">
          <TactileButton onClick={onContinue} className="w-full">
            {heartsStage.ctaLabel}
          </TactileButton>
        </div>
      )}
    </section>
  );
}
