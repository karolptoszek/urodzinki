import { useEffect, useState } from 'react';
import { CatchGameStage } from './components/stages/CatchGameStage';
import { EnvelopeStage } from './components/stages/EnvelopeStage';
import { HeartsStage } from './components/stages/HeartsStage';
import { ScratchStage } from './components/stages/ScratchStage';
import { WelcomeStage } from './components/stages/WelcomeStage';
import { TopProgressBar } from './components/ui/TopProgressBar';
import { PersistedProgress, StageId } from './types/birthday';
import { soundEngine } from './utils/soundEngine';
import {
  clearProgress,
  DEFAULT_PROGRESS,
  loadProgress,
  saveProgress,
  STAGE_ORDER,
} from './utils/storage';

export default function App() {
  const [progress, setProgress] = useState<PersistedProgress>(() => {
    const initial = loadProgress();
    soundEngine.setEnabled(initial.soundEnabled);
    return initial;
  });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const navigateToStage = (stage: StageId) => {
    const targetIdx = STAGE_ORDER.indexOf(stage);
    setProgress((prev) => ({
      ...prev,
      currentStage: stage,
      maxUnlockedStageIndex: Math.max(prev.maxUnlockedStageIndex, targetIdx),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    const currentIdx = STAGE_ORDER.indexOf(progress.currentStage);
    if (currentIdx <= 0) return;

    soundEngine.playTap();
    const prevStage = STAGE_ORDER[currentIdx - 1];
    setProgress((prev) => ({
      ...prev,
      currentStage: prevStage,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSound = () => {
    const next = !progress.soundEnabled;
    soundEngine.setEnabled(next);
    if (next) {
      soundEngine.playTap();
    }
    setProgress((prev) => ({
      ...prev,
      soundEnabled: next,
    }));
  };

  const handleResetAll = () => {
    clearProgress();
    soundEngine.setEnabled(false);
    setProgress(DEFAULT_PROGRESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnvelopeComplete = () => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: true,
      currentStage: 'welcome',
      maxUnlockedStageIndex: Math.max(prev.maxUnlockedStageIndex, 1),
    }));
  };

  const handleRevealScratch = (cardId: string) => {
    setProgress((prev) => {
      if (prev.revealedScratches.includes(cardId)) return prev;
      return {
        ...prev,
        revealedScratches: [...prev.revealedScratches, cardId],
      };
    });
  };

  const handleFindHeart = (heartId: string) => {
    setProgress((prev) => {
      if (prev.foundHearts.includes(heartId)) return prev;
      return {
        ...prev,
        foundHearts: [...prev.foundHearts, heartId],
      };
    });
  };

  const handleCatchRoundComplete = (finalScore: number) => {
    setProgress((prev) => ({
      ...prev,
      catchPlayed: true,
      catchBestScore:
        prev.catchBestScore === null
          ? finalScore
          : Math.max(prev.catchBestScore, finalScore),
    }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#231C19] paper-grain">
      {progress.currentStage !== 'envelope' && (
        <TopProgressBar
          currentStage={progress.currentStage}
          soundEnabled={progress.soundEnabled}
          onToggleSound={handleToggleSound}
          onBack={handleBack}
          onResetAll={handleResetAll}
        />
      )}

      <main>
        {progress.currentStage === 'envelope' && (
          <EnvelopeStage onComplete={handleEnvelopeComplete} />
        )}

        {progress.currentStage === 'welcome' && (
          <WelcomeStage onContinue={() => navigateToStage('scratch')} />
        )}

        {progress.currentStage === 'scratch' && (
          <ScratchStage
            revealedIds={progress.revealedScratches}
            onRevealCard={handleRevealScratch}
            onContinue={() => navigateToStage('hearts')}
          />
        )}

        {progress.currentStage === 'hearts' && (
          <HeartsStage
            foundIds={progress.foundHearts}
            onFindHeart={handleFindHeart}
            onContinue={() => navigateToStage('catch')}
          />
        )}

        {progress.currentStage === 'catch' && (
          <CatchGameStage
            bestScore={progress.catchBestScore}
            onRoundComplete={handleCatchRoundComplete}
            onRestart={handleResetAll}
          />
        )}
      </main>
    </div>
  );
}
