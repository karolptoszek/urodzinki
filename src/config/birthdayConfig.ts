import { BirthdayExperienceConfig } from '../types/birthday';

/**
 * ============================================================================
 * CENTRALNY PLIK PERSONALIZACJI URODZINOWEJ
 * ============================================================================
 * Tutaj w jednym miejscu zmienisz imię, teksty, 5 zdrapek, ukryte serduszka
 * oraz zdjęcia postaci w mini-grze.
 *
 * WSKAZÓWKA DOTYCZĄCA WŁASNYCH ZDJĘĆ:
 * 1. Utwórz w projekcie folder `public/photos`.
 * 2. Wrzuć tam zdjęcia (np. `ja.jpg`, `kot.jpg`, `natalia.jpg`).
 * 3. Podmień ścieżki w sekcji `catchGame` poniżej.
 * ============================================================================
 */
export const BIRTHDAY_CONFIG: BirthdayExperienceConfig = {
  wifeName: 'Natalio',
  senderName: 'Twój mąż',
  occasionLabel: 'Edycja Specjalna · Twoje Święto',

  // ==========================================================================
  // ETAP 1: TAJEMNICZA KOPERTA
  // ==========================================================================
  envelope: {
    quote: 'Karta urodzinowa to w końcu "Must have"',
    sealText: '♥',
    tapHint: 'zerwij naklejkę',
    cardHeading: 'Dla urodzinowej Natalii',
    cardWish: 'Życzę Ci Wszystkiego co Najlepsze bo na to zasługujesz!',
    cardSignOff: 'Twój mąż',
    cardContinueHint: 'Dotknij kartki, aby przejść dalej',
  },

  // ==========================================================================
  // ETAP 2: EKRAN PRZED ZDRAPKAMI
  // ==========================================================================
  welcome: {
    headline: 'Wiem, jak uwielbiasz zdrapki…',
    introText: '…dlatego przygotowałem kilka specjalnie dla Ciebie!',
    ctaLabel: 'ZDRAPUJEMY',
  },

  // ==========================================================================
  // ETAP 3: ZDRAPKA KUPONÓW (5 PÓL)
  // ==========================================================================
  scratchStage: {
    title: 'Twoje urodzinowe zdrapki',
    instruction: 'Przesuwaj palcem po złotych polach, aby odkryć każdy kupon.',
    completionTitle: 'Nie zapomnij zrobić screenów swoich kuponów!',
    ctaLabel: 'Dalej',
    cards: [
      {
        id: 'scratch-1',
        label: 'Kupon #1',
        category: 'privilege',
        message: 'Wygrałaś kupon na domową pizzę zrobioną przeze mnie!',
        foilTone: 'gold',
      },
      {
        id: 'scratch-2',
        label: 'Kupon #2',
        category: 'romantic',
        message: 'Masaż czego tylko zechcesz i kiedy tylko zechcesz.',
        foilTone: 'champagne',
      },
      {
        id: 'scratch-3',
        label: 'Kupon #3',
        category: 'privilege',
        message: 'Wygrałaś kupon na zrobienie przeze mnie burgerów!',
        foilTone: 'burgundy',
      },
      {
        id: 'scratch-4',
        label: 'Kupon #4',
        category: 'surprise',
        message: 'Śniadanko prosto do łóżka — z wyjątkiem herbatki!',
        foilTone: 'gold',
      },
      {
        id: 'scratch-5',
        label: 'Kupon #5',
        category: 'privilege',
        message: 'Wybór filmu należy do Ciebie — zobaczę absolutnie każdy!',
        foilTone: 'champagne',
      },
    ],
  },

  // ==========================================================================
  // ETAP 4: POSZUKIWANIE 7 UKRYTYCH SERDUSZEK
  // ==========================================================================
  heartsStage: {
    promptText:
      'Szukaj serduszka — mimo że mojego czasem nie widać na pierwszy rzut oka, to bardzo Cię Kocha!',
    sceneImageUrl: './src/assets/images/hidden_hearts_scene_1795357476176.jpg',
    completionTitle: 'Kocham Cię',
    ctaLabel: 'Kolejna gra',
    hearts: [
      {
        id: 'heart-1',
        xPercent: 18,
        yPercent: 18,
        tintColor: '#E5A952',
        rotationDeg: -14,
      },
      {
        id: 'heart-2',
        xPercent: 13.5,
        yPercent: 39,
        tintColor: '#5B744F',
        rotationDeg: 18,
      },
      {
        id: 'heart-3',
        xPercent: 28,
        yPercent: 54.5,
        tintColor: '#D68989',
        rotationDeg: -8,
      },
      {
        id: 'heart-4',
        xPercent: 49.5,
        yPercent: 54,
        tintColor: '#C9B199',
        rotationDeg: 12,
      },
      {
        id: 'heart-5',
        xPercent: 62,
        yPercent: 55.5,
        tintColor: '#9D4648',
        rotationDeg: -12,
      },
      {
        id: 'heart-6',
        xPercent: 78,
        yPercent: 62.5,
        tintColor: '#8B9A77',
        rotationDeg: 15,
      },
      {
        id: 'heart-7',
        xPercent: 70.5,
        yPercent: 21,
        tintColor: '#4A6746',
        rotationDeg: -20,
      },
    ],
  },

  // ==========================================================================
  // ETAP 5 (FINAŁ): MINI-GRA ŁAPACZ SERDUSZEK I PREZENTÓW (30 SEKUND)
  // ==========================================================================
  // WSKAZÓWKA: Podmień ścieżki *AvatarUrl na własne zdjęcia twarzy (wrzucone do
  // folderu public/photos/, np. '/photos/ja.jpg', '/photos/kot.jpg', '/photos/natalia.jpg').
  catchGame: {
    title: 'Złap ile dasz radę!',
    subtitle:
      'Ja zrzucam z góry serduszka i prezenty, a nasz kot próbuje sabotować zabawę swoimi zabawkami. Masz 30 sekund — przesuwaj Natalię palcem u dołu ekranu!',
    durationSeconds: 30,
    husbandName: 'Karol',
    husbandAvatarUrl: './assets/aistudio/1_eabbb885.png',
    catName: 'Kot',
    catAvatarUrl: './assets/aistudio/3_91f20b44.png',
    wifeLabel: 'Natalia',
    wifeAvatarUrl: './assets/aistudio/2_39ee8520.png',
    heartPoints: 10,
    giftPoints: 1,
    catToyPenalty: -5,
    startButtonLabel: 'Start gry (30s)',
    playAgainLabel: 'Zagraj jeszcze raz',
    screenshotPrompt: 'Zapisz screenem swój wynik!',
    restartLabel: 'Zacznij kartkę od nowa',
    tierComments: {
      high: 'Refleks absolutnej mistrzyni! Kot nie miał żadnych szans, a serduszka łapałaś w locie.',
      medium: 'Świetny wynik! Kilka kocich zasadzek po drodze, ale prezenty i serca bezpieczne.',
      low: 'Kot chyba tym razem wygrał bitwę o uwagę! Ale spokojnie — w urodziny i tak dostajesz wszystko.',
    },
  },
};
