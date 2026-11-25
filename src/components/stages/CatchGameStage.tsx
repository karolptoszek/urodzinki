import { Gift, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BIRTHDAY_CONFIG } from '../../config/birthdayConfig';
import { soundEngine } from '../../utils/soundEngine';
import { ConfettiCanvas } from '../ui/ConfettiCanvas';
import { TactileButton } from '../ui/TactileButton';

interface CatchGameStageProps {
  bestScore: number | null;
  onRoundComplete: (score: number) => void;
  onRestart: () => void;
}

type GamePhase = 'TITLE_MENU' | 'PLAYING' | 'ROUND_SUMMARY';
type FallingKind = 'heart' | 'gift' | 'mouse' | 'yarn';

interface FallingItem {
  id: number;
  kind: FallingKind;
  xPercent: number;
  yPercent: number;
  speedPerSec: number;
  rotation: number;
  rotSpeed: number;
}

interface FloatingFeedback {
  id: number;
  xPercent: number;
  yPercent: number;
  text: string;
  tone: 'positive' | 'heart' | 'negative';
}

interface AvatarPortraitProps {
  src: string;
  alt: string;
  fallbackInitial: string;
  borderColor: string;
  sizeClass: string;
}

function AvatarPortrait({
  src,
  alt,
  fallbackInitial,
  borderColor,
  sizeClass,
}: AvatarPortraitProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{ borderColor }}
      className={`rounded-full overflow-hidden border-2 bg-white shadow-md flex items-center justify-center shrink-0 p-0.5 ${sizeClass}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain select-none"
        />
      ) : (
        <span className="font-display font-bold text-base text-[#231C19]">
          {fallbackInitial}
        </span>
      )}
    </div>
  );
}

function FallingItemIcon({ kind }: { kind: FallingKind }) {
  if (kind === 'heart') {
    return (
      <div className="relative flex items-center justify-center">
        {/* Delikatna smuga szybkiego spadania */}
        <span
          aria-hidden="true"
          className="absolute -top-3 w-1 h-3 rounded-full bg-[#8E293D]/40"
        />
        <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#8E293D"
            stroke="#FFFDF9"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  if (kind === 'gift') {
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <rect
          x="5"
          y="12"
          width="22"
          height="16"
          rx="3"
          fill="#E8D2AA"
          stroke="#6A4E23"
          strokeWidth="1.6"
        />
        <rect
          x="4"
          y="9"
          width="24"
          height="5"
          rx="1.5"
          fill="#F4E5C8"
          stroke="#6A4E23"
          strokeWidth="1.5"
        />
        <rect x="14.5" y="9" width="3" height="19" fill="#8E293D" />
        <path
          d="M16 9c-2-4-7-4-6-1 1 2 4 1 6 1zm0 0c2-4 7-4 6-1-1 2-4 1-6 1z"
          fill="#8E293D"
        />
      </svg>
    );
  }

  if (kind === 'mouse') {
    // Kocia zabawka: szara myszka z ogonkiem
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M23 19c4 0 6 4 4 7"
          fill="none"
          stroke="#4A4440"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <ellipse
          cx="15"
          cy="18"
          rx="9"
          ry="6"
          fill="#8C8580"
          stroke="#2E2A27"
          strokeWidth="1.6"
        />
        <circle cx="9" cy="13" r="3" fill="#A69F9A" stroke="#2E2A27" strokeWidth="1.4" />
        <circle cx="13" cy="13" r="2.8" fill="#A69F9A" stroke="#2E2A27" strokeWidth="1.4" />
        <circle cx="9.5" cy="17.5" r="1.1" fill="#231C19" />
        <circle cx="6.2" cy="18.2" r="1.2" fill="#C96D7B" />
      </svg>
    );
  }

  // Kłębek wełny (druga kocia zabawka)
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="10"
        fill="#6A7280"
        stroke="#272B33"
        strokeWidth="1.6"
      />
      <path
        d="M9 12c4-2 10 2 14-1M8 17c5 2 11-2 16 1M11 22c4-1 8 1 11-2"
        fill="none"
        stroke="#D4D8DF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M23 23c2 3 5 2 6 4"
        fill="none"
        stroke="#4B525E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CatchGameStage({
  bestScore,
  onRoundComplete,
  onRestart,
}: CatchGameStageProps) {
  const { catchGame } = BIRTHDAY_CONFIG;
  const [phase, setPhase] = useState<GamePhase>('TITLE_MENU');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(catchGame.durationSeconds);
  const [playerX, setPlayerX] = useState(50);
  const [husbandX, setHusbandX] = useState(28);
  const [catX, setCatX] = useState(72);
  const [husbandThrowPulse, setHusbandThrowPulse] = useState(false);
  const [catThrowPulse, setCatThrowPulse] = useState(false);
  const [playerHitTone, setPlayerHitTone] = useState<'none' | 'good' | 'bad'>('none');
  const [items, setItems] = useState<FallingItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const playerXRef = useRef(50);
  const scoreRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const nextItemIdRef = useRef(1);
  const nextFeedbackIdRef = useRef(1);
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  const spawnFeedback = useCallback(
    (xPercent: number, yPercent: number, text: string, tone: FloatingFeedback['tone']) => {
      const id = nextFeedbackIdRef.current++;
      setFeedbacks((prev) => [...prev.slice(-6), { id, xPercent, yPercent, text, tone }]);
      window.setTimeout(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }, 720);
    },
    []
  );

  const startGame = () => {
    soundEngine.playTap();
    scoreRef.current = 0;
    itemsRef.current = [];
    playerXRef.current = 50;
    setScore(0);
    setItems([]);
    setFeedbacks([]);
    setPlayerX(50);
    setTimeLeft(catchGame.durationSeconds);
    setPlayerHitTone('none');
    setPhase('PLAYING');
  };

  // Obsługa klawiatury na desktopie
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressedRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressedRef.current.right = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressedRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressedRef.current.right = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keysPressedRef.current = { left: false, right: false };
    };
  }, [phase]);

  // Główna pętla gry (60fps requestAnimationFrame)
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    let rafId = 0;
    let lastTime = performance.now();
    const gameStartTime = lastTime;
    let lastHusbandSpawn = lastTime - 350;
    let lastCatSpawn = lastTime - 200;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const elapsedSec = (now - gameStartTime) / 1000;
      const remaining = Math.max(0, catchGame.durationSeconds - elapsedSec);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        const finalScore = scoreRef.current;
        if (finalScore > 0) {
          soundEngine.playCelebration();
          setConfettiKey((k) => k + 1);
        } else {
          soundEngine.playRevealChime();
        }
        onRoundComplete(finalScore);
        setPhase('ROUND_SUMMARY');
        return;
      }

      // Ruch Natalii z klawiatury (dotyk obsługiwany bezpośrednio w PointerEvents)
      if (keysPressedRef.current.left) {
        playerXRef.current = Math.max(8, playerXRef.current - 72 * dt);
        setPlayerX(playerXRef.current);
      }
      if (keysPressedRef.current.right) {
        playerXRef.current = Math.min(92, playerXRef.current + 72 * dt);
        setPlayerX(playerXRef.current);
      }

      // Płynny patrol rzucających na górze ekranu
      const hX = 50 + Math.sin(elapsedSec * 1.45) * 34;
      const cX = 50 - Math.cos(elapsedSec * 1.85) * 35;
      setHusbandX(hX);
      setCatX(cX);

      // Mąż rzuca serduszka (szybkie, +10 pkt) i prezenty (wolne, +1 pkt)
      const husbandInterval = 520;
      if (now - lastHusbandSpawn >= husbandInterval) {
        lastHusbandSpawn = now;
        const isHeart = Math.random() < 0.34;
        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          kind: isHeart ? 'heart' : 'gift',
          xPercent: Math.max(8, Math.min(92, hX + (Math.random() - 0.5) * 8)),
          yPercent: 14,
          // Serduszka lecą znacznie szybciej niż prezenty
          speedPerSec: isHeart
            ? 64 + Math.random() * 14
            : 23 + Math.random() * 7,
          rotation: (Math.random() - 0.5) * 18,
          rotSpeed: isHeart ? 0 : (Math.random() - 0.5) * 35,
        };
        itemsRef.current.push(newItem);
        setHusbandThrowPulse(true);
        window.setTimeout(() => setHusbandThrowPulse(false), 140);
      }

      // Kot rzuca myszki i kłębki wełny (odejmują punkty)
      const catInterval = 980;
      if (now - lastCatSpawn >= catInterval) {
        lastCatSpawn = now;
        const kind: FallingKind = Math.random() < 0.55 ? 'mouse' : 'yarn';
        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          kind,
          xPercent: Math.max(8, Math.min(92, cX + (Math.random() - 0.5) * 8)),
          yPercent: 14,
          speedPerSec: 40 + Math.random() * 12,
          rotation: (Math.random() - 0.5) * 30,
          rotSpeed: (Math.random() - 0.5) * 110,
        };
        itemsRef.current.push(newItem);
        setCatThrowPulse(true);
        window.setTimeout(() => setCatThrowPulse(false), 140);
      }

      // Aktualizacja pozycji spadających obiektów i kolizje z Natalią
      const nextItems: FallingItem[] = [];
      const catchTopY = 78;
      const catchBottomY = 93;
      const catchHalfWidth = 10.5;

      for (const item of itemsRef.current) {
        const nextY = item.yPercent + item.speedPerSec * dt;
        const nextRot = item.rotation + item.rotSpeed * dt;

        const inVerticalZone = nextY >= catchTopY && nextY <= catchBottomY;
        const inHorizontalZone = Math.abs(item.xPercent - playerXRef.current) <= catchHalfWidth;

        if (inVerticalZone && inHorizontalZone) {
          if (item.kind === 'heart') {
            scoreRef.current += catchGame.heartPoints;
            setScore(scoreRef.current);
            soundEngine.playRevealChime();
            setPlayerHitTone('good');
            window.setTimeout(() => setPlayerHitTone('none'), 180);
            spawnFeedback(
              item.xPercent,
              75,
              `+${catchGame.heartPoints} ♥`,
              'heart'
            );
          } else if (item.kind === 'gift') {
            scoreRef.current += catchGame.giftPoints;
            setScore(scoreRef.current);
            soundEngine.playCatchGift();
            setPlayerHitTone('good');
            window.setTimeout(() => setPlayerHitTone('none'), 150);
            spawnFeedback(
              item.xPercent,
              75,
              `+${catchGame.giftPoints}`,
              'positive'
            );
          } else {
            scoreRef.current = Math.max(0, scoreRef.current + catchGame.catToyPenalty);
            setScore(scoreRef.current);
            soundEngine.playCatchPenalty();
            setPlayerHitTone('bad');
            window.setTimeout(() => setPlayerHitTone('none'), 220);
            spawnFeedback(
              item.xPercent,
              75,
              `${catchGame.catToyPenalty}`,
              'negative'
            );
          }
          continue;
        }

        if (nextY < 103) {
          nextItems.push({
            ...item,
            yPercent: nextY,
            rotation: nextRot,
          });
        }
      }

      itemsRef.current = nextItems;
      setItems(nextItems);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, catchGame, onRoundComplete, spawnFeedback]);

  const updatePlayerPositionFromPointer = (clientX: number) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(8, Math.min(92, rawPercent));
    playerXRef.current = clamped;
    setPlayerX(clamped);
  };

  const handleArenaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'PLAYING') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    updatePlayerPositionFromPointer(e.clientX);
  };

  const handleArenaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'PLAYING' || !isDraggingRef.current) return;
    updatePlayerPositionFromPointer(e.clientX);
  };

  const handleArenaPointerUp = () => {
    isDraggingRef.current = false;
  };

  const timeProgress = Math.max(0, Math.min(1, timeLeft / catchGame.durationSeconds));

  const getTierComment = (finalScore: number) => {
    if (finalScore >= 45) return catchGame.tierComments.high;
    if (finalScore >= 20) return catchGame.tierComments.medium;
    return catchGame.tierComments.low;
  };

  return (
    <section
      aria-label="Mini-gra łapania prezentów i serduszek"
      className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-16"
    >
      <ConfettiCanvas active={confettiKey > 0} burstKey={confettiKey} />

      {/* Nagłówek sekcji */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E293D] mb-1">
            Wyzwanie 30 sekund
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#231C19]">
            {catchGame.title}
          </h1>
        </div>

        {bestScore !== null && (
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6E625B] tabular-nums">
            <Trophy className="w-4 h-4 text-[#B88A44]" />
            <span>Rekord: {bestScore} pkt</span>
          </div>
        )}
      </div>

      {/* Kontener gry */}
      <div className="rounded-3xl bg-white border border-[#E6DFD6] shadow-[0_14px_40px_-16px_rgba(35,28,25,0.16)] overflow-hidden">
        {/* Pasek HUD podczas gry */}
        <div className="px-4 sm:px-6 py-3 bg-[#FAF8F5] border-b border-[#E6DFD6]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#231C19] tabular-nums">
              <span className="text-[#6E625B] font-medium">Czas:</span>
              <span className={timeLeft <= 5 && phase === 'PLAYING' ? 'text-[#8E293D]' : ''}>
                {Math.ceil(timeLeft)} s
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-[#231C19] tabular-nums">
              <span className="text-[#6E625B] font-medium">Wynik:</span>
              <span className="text-[#8E293D] text-base">{score} pkt</span>
            </div>
          </div>

          {/* Pasek pozostałego czasu */}
          <div className="mt-2 w-full h-1.5 bg-[#E6DFD6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8E293D] rounded-full transition-transform duration-100 ease-linear origin-left"
              style={{ transform: `scaleX(${phase === 'PLAYING' ? timeProgress : 1})` }}
            />
          </div>
        </div>

        {/* Plansza gry (460px mobile, 500px desktop) */}
        <div
          ref={arenaRef}
          onPointerDown={handleArenaPointerDown}
          onPointerMove={handleArenaPointerMove}
          onPointerUp={handleArenaPointerUp}
          onPointerCancel={handleArenaPointerUp}
          style={{ touchAction: phase === 'PLAYING' ? 'none' : 'auto' }}
          className="relative w-full h-[450px] sm:h-[500px] bg-gradient-to-b from-[#FBF9F6] via-[#FAF6F0] to-[#F3ECE3] overflow-hidden select-none"
        >
          {/* Subtelna linia podziału nieba/podłogi */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[18%] h-px bg-[#E6DFD6]/80"
          />

          {/* EKRAN STARTOWY MINI-GRY */}
          {phase === 'TITLE_MENU' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 sm:p-8 text-center bg-[#FAF8F5]/95">
              {/* Prezentacja trójki bohaterów */}
              <div className="flex items-center justify-center gap-5 sm:gap-8 mb-5">
                <div className="flex flex-col items-center">
                  <AvatarPortrait
                    src={catchGame.husbandAvatarUrl}
                    alt={catchGame.husbandName}
                    fallbackInitial="M"
                    borderColor="#8E293D"
                    sizeClass="w-16 h-16 sm:w-20 sm:h-20"
                  />
                  <span className="mt-1.5 text-xs font-semibold text-[#231C19]">
                    {catchGame.husbandName}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <AvatarPortrait
                    src={catchGame.wifeAvatarUrl}
                    alt={catchGame.wifeLabel}
                    fallbackInitial="N"
                    borderColor="#B88A44"
                    sizeClass="w-16 h-16 sm:w-20 sm:h-20"
                  />
                  <span className="mt-1.5 text-xs font-semibold text-[#8E293D]">
                    {catchGame.wifeLabel}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <AvatarPortrait
                    src={catchGame.catAvatarUrl}
                    alt={catchGame.catName}
                    fallbackInitial="K"
                    borderColor="#6E625B"
                    sizeClass="w-16 h-16 sm:w-20 sm:h-20"
                  />
                  <span className="mt-1.5 text-xs font-semibold text-[#231C19]">
                    {catchGame.catName}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#6E625B] max-w-md leading-relaxed mb-5">
                {catchGame.subtitle}
              </p>

              {/* Czytelna legenda punktacji */}
              <div className="w-full max-w-md grid grid-cols-3 gap-2.5 mb-6 text-left">
                <div className="rounded-2xl bg-white border border-[#E6DFD6] p-3 flex flex-col items-center text-center">
                  <Heart className="w-5 h-5 text-[#8E293D] fill-[#8E293D] mb-1" />
                  <span className="text-xs font-bold text-[#8E293D] tabular-nums">
                    +{catchGame.heartPoints} pkt
                  </span>
                  <span className="text-[11px] text-[#6E625B] mt-0.5">
                    Serce (szybkie!)
                  </span>
                </div>

                <div className="rounded-2xl bg-white border border-[#E6DFD6] p-3 flex flex-col items-center text-center">
                  <Gift className="w-5 h-5 text-[#B88A44] mb-1" />
                  <span className="text-xs font-bold text-[#3D6B58] tabular-nums">
                    +{catchGame.giftPoints} pkt
                  </span>
                  <span className="text-[11px] text-[#6E625B] mt-0.5">
                    Prezent (wolny)
                  </span>
                </div>

                <div className="rounded-2xl bg-white border border-[#E6DFD6] p-3 flex flex-col items-center text-center">
                  <div className="w-6 h-6 flex items-center justify-center mb-1 scale-75">
                    <FallingItemIcon kind="mouse" />
                  </div>
                  <span className="text-xs font-bold text-[#6E625B] tabular-nums">
                    {catchGame.catToyPenalty} pkt
                  </span>
                  <span className="text-[11px] text-[#6E625B] mt-0.5">
                    Zabawka kota
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <TactileButton onClick={startGame}>
                  <Play className="w-4 h-4 fill-white" />
                  {catchGame.startButtonLabel}
                </TactileButton>
              </div>
            </div>
          )}

          {/* AKTYWNA ROZGRYWKA */}
          {phase === 'PLAYING' && (
            <>
              {/* Postać Męża na górze */}
              <div
                style={{ left: `${husbandX}%` }}
                className={`absolute top-3 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none transition-transform duration-100 ${
                  husbandThrowPulse ? 'scale-110' : 'scale-100'
                }`}
              >
                <AvatarPortrait
                  src={catchGame.husbandAvatarUrl}
                  alt={catchGame.husbandName}
                  fallbackInitial="M"
                  borderColor="#8E293D"
                  sizeClass="w-12 h-12 sm:w-14 sm:h-14"
                />
                <span className="mt-1 text-[10px] font-semibold text-[#8E293D] bg-white/85 px-1.5 rounded">
                  {catchGame.husbandName}
                </span>
              </div>

              {/* Postać Kota na górze */}
              <div
                style={{ left: `${catX}%` }}
                className={`absolute top-3 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none transition-transform duration-100 ${
                  catThrowPulse ? 'scale-110 rotate-3' : 'scale-100'
                }`}
              >
                <AvatarPortrait
                  src={catchGame.catAvatarUrl}
                  alt={catchGame.catName}
                  fallbackInitial="K"
                  borderColor="#6E625B"
                  sizeClass="w-12 h-12 sm:w-14 sm:h-14"
                />
                <span className="mt-1 text-[10px] font-semibold text-[#6E625B] bg-white/85 px-1.5 rounded">
                  {catchGame.catName}
                </span>
              </div>

              {/* Spadające obiekty */}
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    left: `${item.xPercent}%`,
                    top: `${item.yPercent}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                  }}
                  className="absolute z-10 pointer-events-none will-change-transform"
                >
                  <FallingItemIcon kind={item.kind} />
                </div>
              ))}

              {/* Unoszące się komunikaty punktów */}
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  style={{
                    left: `${fb.xPercent}%`,
                    top: `${fb.yPercent}%`,
                  }}
                  className={`absolute -translate-x-1/2 z-20 pointer-events-none font-bold text-sm sm:text-base tabular-nums animate-float-heart ${
                    fb.tone === 'heart'
                      ? 'text-[#8E293D]'
                      : fb.tone === 'positive'
                        ? 'text-[#3D6B58]'
                        : 'text-[#6E625B]'
                  }`}
                >
                  {fb.text}
                </div>
              ))}

              {/* Postać Natalii na dole (łapie prezenty i serca) */}
              <div
                style={{ left: `${playerX}%` }}
                className={`absolute bottom-3 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-transform duration-100 ${
                  playerHitTone === 'good'
                    ? 'scale-110'
                    : playerHitTone === 'bad'
                      ? 'scale-95 -rotate-6'
                      : 'scale-100'
                }`}
              >
                {/* Koszyczek łapacza przed Natalią */}
                <div
                  className={`w-16 h-4 rounded-b-xl border-2 border-t-0 mb-[-6px] z-10 transition-colors ${
                    playerHitTone === 'good'
                      ? 'bg-[#8E293D]/20 border-[#8E293D]'
                      : playerHitTone === 'bad'
                        ? 'bg-[#6E625B]/20 border-[#6E625B]'
                        : 'bg-[#F5E9D6] border-[#B88A44]'
                  }`}
                />
                <AvatarPortrait
                  src={catchGame.wifeAvatarUrl}
                  alt={catchGame.wifeLabel}
                  fallbackInitial="N"
                  borderColor={
                    playerHitTone === 'bad'
                      ? '#6E625B'
                      : playerHitTone === 'good'
                        ? '#3D6B58'
                        : '#8E293D'
                  }
                  sizeClass="w-16 h-16 sm:w-[70px] sm:h-[70px]"
                />
                <span className="mt-1 text-[11px] font-semibold text-[#231C19] bg-white/90 px-2 rounded">
                  {catchGame.wifeLabel}
                </span>
              </div>

              {/* Podpowiedź sterowania w tle */}
              <p className="absolute bottom-1 right-3 text-[10px] text-[#6E625B]/75 pointer-events-none">
                Przesuwaj palcem w lewo i w prawo
              </p>
            </>
          )}

          {/* PODSUMOWANIE RUNDY */}
          {phase === 'ROUND_SUMMARY' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]/95">
              <div className="w-12 h-12 rounded-2xl bg-[#8E293D]/10 text-[#8E293D] flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E293D]">
                Czas minął!
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#231C19] mt-1 tabular-nums">
                {score} punktów
              </h2>

              <p className="mt-3 text-sm sm:text-base text-[#6E625B] max-w-md leading-relaxed">
                {getTierComment(score)}
              </p>

              <p className="mt-3 text-base sm:text-lg font-semibold text-[#8E293D]">
                {catchGame.screenshotPrompt}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
                <TactileButton onClick={startGame} className="w-full sm:w-auto">
                  <RotateCcw className="w-4 h-4" />
                  {catchGame.playAgainLabel}
                </TactileButton>

                <TactileButton
                  variant="secondary"
                  size="md"
                  onClick={onRestart}
                  className="w-full sm:w-auto"
                >
                  {catchGame.restartLabel}
                </TactileButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
