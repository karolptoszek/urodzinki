import { BIRTHDAY_CONFIG } from '../../config/birthdayConfig';
import { TactileButton } from '../ui/TactileButton';

interface WelcomeStageProps {
  onContinue: () => void;
}

export function WelcomeStage({ onContinue }: WelcomeStageProps) {
  const { welcome } = BIRTHDAY_CONFIG;

  return (
    <section
      aria-label="Wprowadzenie do zdrapek"
      className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-28 sm:pb-16"
    >
      <div className="bg-white rounded-3xl border border-[#E6DFD6] p-7 sm:p-10 text-center flex flex-col items-center justify-center shadow-[0_10px_30px_-15px_rgba(35,28,25,0.08)]">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#231C19] leading-[1.2]">
          {welcome.headline}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-[#6E625B] leading-relaxed">
          {welcome.introText}
        </p>

        <div className="hidden sm:block mt-8">
          <TactileButton onClick={onContinue} className="min-w-[220px]">
            {welcome.ctaLabel}
          </TactileButton>
        </div>
      </div>

      {/* Mobilny przycisk w strefie kciuka */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 p-4 pb-safe bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent">
        <TactileButton onClick={onContinue} className="w-full">
          {welcome.ctaLabel}
        </TactileButton>
      </div>
    </section>
  );
}
