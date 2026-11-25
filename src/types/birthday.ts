export type StageId =
  | 'envelope'
  | 'welcome'
  | 'scratch'
  | 'hearts'
  | 'catch';

export type ScratchCategory =
  | 'romantic'
  | 'compliment'
  | 'memory'
  | 'surprise'
  | 'privilege';

export interface ScratchCardItem {
  id: string;
  label: string;
  category: ScratchCategory;
  message: string;
  subNote?: string;
  foilTone: 'gold' | 'champagne' | 'burgundy';
}

export interface HiddenHeartItem {
  id: string;
  /** Pozycja pozioma w procentach (0-100) na ilustracji */
  xPercent: number;
  /** Pozycja pionowa w procentach (0-100) na ilustracji */
  yPercent: number;
  /** Kolor dopasowany do tła ilustracji, by serce było dyskretne */
  tintColor: string;
  /** Delikatny obrót w stopniach */
  rotationDeg: number;
}

export interface BirthdayExperienceConfig {
  /** Imię Twojej żony */
  wifeName: string;
  /** Twój podpis */
  senderName: string;
  /** Nagłówek okazji */
  occasionLabel: string;

  envelope: {
    quote: string;
    sealText: string;
    tapHint: string;
    cardHeading: string;
    cardWish: string;
    cardSignOff: string;
    cardContinueHint: string;
  };

  welcome: {
    headline: string;
    introText: string;
    ctaLabel: string;
  };

  scratchStage: {
    title: string;
    instruction: string;
    completionTitle: string;
    ctaLabel: string;
    cards: ScratchCardItem[];
  };

  heartsStage: {
    promptText: string;
    sceneImageUrl: string;
    completionTitle: string;
    ctaLabel: string;
    hearts: HiddenHeartItem[];
  };

  catchGame: {
    title: string;
    subtitle: string;
    durationSeconds: number;
    husbandName: string;
    husbandAvatarUrl: string;
    catName: string;
    catAvatarUrl: string;
    wifeLabel: string;
    wifeAvatarUrl: string;
    heartPoints: number;
    giftPoints: number;
    catToyPenalty: number;
    startButtonLabel: string;
    playAgainLabel: string;
    screenshotPrompt: string;
    restartLabel: string;
    tierComments: {
      high: string;
      medium: string;
      low: string;
    };
  };
}

export interface PersistedProgress {
  currentStage: StageId;
  maxUnlockedStageIndex: number;
  revealedScratches: string[];
  foundHearts: string[];
  catchBestScore: number | null;
  catchPlayed: boolean;
  soundEnabled: boolean;
}
