import { useState } from 'react';
import { BIRTHDAY_CONFIG } from '../../config/birthdayConfig';
import { soundEngine } from '../../utils/soundEngine';

interface EnvelopeStageProps {
  onComplete: () => void;
}

type OpenPhase = 'closed' | 'cracking' | 'flap-open' | 'card-out';

export function EnvelopeStage({ onComplete }: EnvelopeStageProps) {
  const [phase, setPhase] = useState<OpenPhase>('closed');
  const { envelope } = BIRTHDAY_CONFIG;

  const handleOpen = () => {
    if (phase !== 'closed') return;

    // Świadoma pierwsza interakcja: odblokowanie Web Audio i uruchomienie dźwięku
    soundEngine.setEnabled(true);
    soundEngine.playWaxCrack();

    setPhase('cracking');
    window.setTimeout(() => setPhase('flap-open'), 420);
    window.setTimeout(() => {
      soundEngine.playRevealChime();
      setPhase('card-out');
    }, 950);
  };

  const handleCardTap = () => {
    if (phase !== 'card-out') return;
    soundEngine.playTap();
    onComplete();
  };

  const isCracked = phase !== 'closed';
  const isFlapOpen = phase === 'flap-open' || phase === 'card-out';
  const isCardOut = phase === 'card-out';

  return (
    <section
      aria-label="Tajemnicza koperta"
      className="min-h-[100dvh] flex flex-col items-center justify-center px-5 py-10 paper-grain"
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
        {/* Nagłówek nad kopertą */}
        <p
          className={`font-display italic text-xl sm:text-2xl text-[#231C19] leading-relaxed mb-12 transition-opacity duration-500 ${
            isCardOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {envelope.quote}
        </p>

        {/* Kontener koperty (bez zagnieżdżonych buttonów) */}
        <div
          onClick={phase === 'closed' ? handleOpen : undefined}
          role={phase === 'closed' ? 'button' : undefined}
          tabIndex={phase === 'closed' ? 0 : undefined}
          onKeyDown={
            phase === 'closed'
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen();
                  }
                }
              : undefined
          }
          aria-label={phase === 'closed' ? 'Zerwij naklejkę i otwórz kopertę' : undefined}
          className={`relative w-full max-w-[340px] aspect-[4/3] perspective-1000 rounded-2xl transition-transform duration-200 ${
            phase === 'closed'
              ? 'cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#8E293D]'
              : ''
          }`}
        >
          {/* Cień pod kopertą */}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 -bottom-4 h-7 rounded-full bg-[#231C19]/10 blur-xl"
          />

          {/* Tył koperty (kieszeń wewnętrzna) */}
          <div className="absolute inset-0 rounded-2xl bg-[#EAE2D7] border border-[#D9CFC2] shadow-[0_20px_50px_-15px_rgba(35,28,25,0.18)] overflow-visible">
            {/* Wnętrze wyściółki */}
            <div className="absolute inset-1.5 rounded-xl bg-[#DFD5C7]" />

            {/* Wysuwająca się kartka ze środka — pozostaje wyciągnięta do dotknięcia palcem */}
            <button
              type="button"
              onClick={handleCardTap}
              disabled={!isCardOut}
              aria-label="Dotknij kartki, aby przejść dalej"
              className={`absolute inset-x-3 top-2 bottom-2 rounded-xl bg-[#FFFDF9] border border-[#E6DFD6] flex flex-col items-center justify-center px-5 py-5 text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8E293D] ${
                isCardOut
                  ? '-translate-y-24 sm:-translate-y-28 scale-[1.06] opacity-100 z-40 shadow-[0_24px_48px_-12px_rgba(35,28,25,0.25)] cursor-pointer active:scale-[1.02]'
                  : isFlapOpen
                    ? '-translate-y-6 opacity-100 z-10 shadow-md pointer-events-none'
                    : 'translate-y-2 opacity-90 z-10 shadow-md pointer-events-none'
              }`}
            >
              <span className="font-display text-lg sm:text-xl font-semibold text-[#8E293D] leading-snug">
                {envelope.cardHeading}
              </span>

              <div className="w-8 h-px bg-[#E6DFD6] my-2.5" />

              <p className="text-sm sm:text-[15px] text-[#231C19] leading-relaxed font-medium">
                {envelope.cardWish}
              </p>

              <span className="mt-3 font-display italic text-sm text-[#6E625B]">
                {envelope.cardSignOff}
              </span>
            </button>

            {/* Przednie skrzydełka koperty (maskujące kartkę zanim wyjedzie) */}
            <svg
              viewBox="0 0 320 240"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full z-20 pointer-events-none rounded-2xl"
            >
              {/* Lewe skrzydło */}
              <polygon
                points="0,0 165,128 0,240"
                fill="#F5F0E8"
                stroke="#DFD5C7"
                strokeWidth="1"
              />
              {/* Prawe skrzydło */}
              <polygon
                points="320,0 155,128 320,240"
                fill="#F2ECE3"
                stroke="#DFD5C7"
                strokeWidth="1"
              />
              {/* Dolne skrzydło */}
              <polygon
                points="0,240 160,115 320,240"
                fill="#FAF7F2"
                stroke="#DED4C6"
                strokeWidth="1.2"
              />
            </svg>

            {/* Górna klapka koperty otwierana w 3D */}
            <div
              style={{
                transformOrigin: 'top center',
                transform: isFlapOpen ? 'rotateX(175deg)' : 'rotateX(0deg)',
              }}
              className={`absolute inset-x-0 top-0 h-[56%] preserve-3d pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlapOpen ? 'z-0' : 'z-30'
              }`}
            >
              <svg
                viewBox="0 0 320 135"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="w-full h-full drop-shadow-sm"
              >
                <path
                  d="M0,2 Q0,0 2,0 L318,0 Q320,0 320,2 L166,126 Q160,131 154,126 Z"
                  fill="#FBF8F3"
                  stroke="#DED4C6"
                  strokeWidth="1.2"
                />
              </svg>
            </div>

            {/* Naklejka / pieczęć na środku */}
            <div
              className={`absolute left-1/2 top-[51%] -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-400 ${
                isFlapOpen ? 'opacity-0 scale-75' : 'opacity-100'
              }`}
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#A13248] via-[#8E293D] to-[#6A1B2B] shadow-[0_6px_14px_rgba(106,27,43,0.45)] border border-[#B34B5F]/40 flex items-center justify-center transition-all duration-300 ${
                    isCracked
                      ? '-translate-x-3 -rotate-12 scale-95 opacity-80'
                      : 'animate-seal-shine'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full border border-[#E9C4B0]/35 flex items-center justify-center">
                    <span className="font-display text-lg text-[#F9E8DF] select-none">
                      {envelope.sealText}
                    </span>
                  </div>
                </div>

                {isCracked && (
                  <svg
                    viewBox="0 0 24 56"
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 h-full"
                  >
                    <path
                      d="M12 2 L9 18 L15 30 L10 44 L13 54"
                      stroke="#FAF8F5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Podpowiedź na dole: najpierw „zerwij naklejkę”, a po wysunięciu „Dotknij kartki, aby przejść dalej” */}
        <p className="mt-10 min-h-[24px] text-sm font-medium text-[#6E625B] transition-opacity duration-300">
          {phase === 'closed'
            ? envelope.tapHint
            : isCardOut
              ? envelope.cardContinueHint
              : ''}
        </p>
      </div>
    </section>
  );
}
