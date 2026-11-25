/**
 * Silnik efektów dźwiękowych oparty o Web Audio API.
 * Bezpieczny dla iOS Safari: AudioContext jest odblokowywany wyłącznie po
 * świadomej interakcji użytkowniczki i obsługuje bezpiecznie błędy zawieszenia.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private lastScratchTime = 0;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.unlock();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public unlock(): void {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
    } catch {
      // Ignoruj brak wsparcia AudioContext
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        this.unlock();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public playTap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  public playWaxCrack(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Krótki trzask wosku + miękki akord
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // Ciepły dzwoneczek otwarcia
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const chime = ctx.createOscillator();
        const cGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(freq, now + 0.12 + i * 0.07);
        cGain.gain.setValueAtTime(0.001, now + 0.12 + i * 0.07);
        cGain.gain.linearRampToValueAtTime(0.06, now + 0.14 + i * 0.07);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65 + i * 0.07);
        chime.connect(cGain);
        cGain.connect(ctx.destination);
        chime.start(now + 0.12 + i * 0.07);
        chime.stop(now + 0.7 + i * 0.07);
      });
    } catch {
      // ignore
    }
  }

  public playScratchTick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const nowMs = performance.now();
    if (nowMs - this.lastScratchTime < 75) return;
    this.lastScratchTime = nowMs;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 500, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // ignore
    }
  }

  public playRevealChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.055;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.48);
      });
    } catch {
      // ignore
    }
  }

  public playCatchGift(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  public playCatchPenalty(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  public playCelebration(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.09, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.85);
      });
    } catch {
      // ignore
    }
  }

  public playBirthdayMelody(): void {
    // Delikatna pozytywka urodzinowa (Sto Lat / Happy Birthday motyw akustyczny)
    // Działa nawet jeśli dźwięk był wyciszony, bo użytkowniczka świadomie kliknęła odtwarzanie dedykacji
    this.unlock();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const melody: Array<[number, number, number]> = [
        [392.0, 0.0, 0.28],
        [392.0, 0.3, 0.2],
        [440.0, 0.55, 0.45],
        [392.0, 1.05, 0.45],
        [523.25, 1.55, 0.45],
        [493.88, 2.05, 0.85],
        [392.0, 3.0, 0.28],
        [392.0, 3.3, 0.2],
        [440.0, 3.55, 0.45],
        [392.0, 4.05, 0.45],
        [587.33, 4.55, 0.45],
        [523.25, 5.05, 0.95],
      ];

      melody.forEach(([freq, offset, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.09, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + dur + 0.05);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
