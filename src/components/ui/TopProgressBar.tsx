import { ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { StageId } from '../../types/birthday';
import { STAGE_ORDER } from '../../utils/storage';

interface TopProgressBarProps {
  currentStage: StageId;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onResetAll: () => void;
}

const STAGE_TITLES: Record<StageId, string> = {
  envelope: 'Koperta',
  welcome: 'Zdrapki',
  scratch: 'Twoje kupony',
  hearts: 'Ukryte serduszka',
  catch: 'Łapacz niespodzianek',
};

export function TopProgressBar({
  currentStage,
  soundEnabled,
  onToggleSound,
  onBack,
  onResetAll,
}: TopProgressBarProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const stageIndex = STAGE_ORDER.indexOf(currentStage);
  const progressPercent = Math.round((stageIndex / (STAGE_ORDER.length - 1)) * 100);
  const canGoBack = stageIndex > 0;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6DFD6]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Lewa strefa: Powrót */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Wróć do poprzedniego etapu"
            className="min-h-[44px] min-w-[44px] px-2 -ml-1 inline-flex items-center gap-1.5 rounded-xl text-sm font-medium text-[#6E625B] hover:text-[#231C19] hover:bg-[#F2EEE9] transition-colors disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Wróć</span>
          </button>
        </div>

        {/* Środkowa strefa: Pasek postępu i nazwa etapu */}
        <div className="flex-1 max-w-md flex flex-col items-center justify-center min-w-0">
          <div className="w-full flex items-center justify-between text-xs text-[#6E625B] mb-1.5 px-0.5">
            <span className="font-medium truncate">{STAGE_TITLES[currentStage]}</span>
            <span className="tabular-nums shrink-0 ml-2">
              {stageIndex + 1}/{STAGE_ORDER.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Postęp urodzinowej przygody"
            className="w-full h-1.5 bg-[#E6DFD6] rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-[#8E293D] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left"
              style={{ transform: `scaleX(${Math.max(0.08, progressPercent / 100)})` }}
            />
          </div>
        </div>

        {/* Prawa strefa: Dźwięk i Reset */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Wycisz efekty dźwiękowe' : 'Włącz efekty dźwiękowe'}
            aria-pressed={soundEnabled}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#6E625B] hover:text-[#231C19] hover:bg-[#F2EEE9] transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#8E293D]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            aria-label="Zacznij od początku"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#6E625B] hover:text-[#8E293D] hover:bg-[#F2EEE9] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bezpieczne potwierdzenie resetu bez window.confirm */}
      {confirmingReset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Potwierdź rozpoczęcie od nowa"
          className="border-t border-[#E6DFD6] bg-white px-4 py-3"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[#231C19]">
              Czy na pewno chcesz wyczyścić postępy i zacząć przygodę od początku?
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="min-h-[40px] px-4 py-1.5 rounded-xl text-sm font-medium text-[#6E625B] hover:bg-[#F2EEE9] transition-colors cursor-pointer whitespace-nowrap"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingReset(false);
                  onResetAll();
                }}
                className="min-h-[40px] px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-[#8E293D] hover:bg-[#742031] transition-colors cursor-pointer whitespace-nowrap"
              >
                Zacznij od nowa
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
