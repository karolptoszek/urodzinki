import React, { useRef, useState } from 'react';
import { soundEngine } from '../../utils/soundEngine';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  silent?: boolean;
  children: React.ReactNode;
}

export function TactileButton({
  variant = 'primary',
  size = 'lg',
  silent = false,
  className = '',
  onPointerDown,
  onClick,
  disabled,
  children,
  ...props
}: TactileButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
      const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
      const id = nextId.current++;
      setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
    onPointerDown?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !silent) {
      soundEngine.playTap();
    }
    onClick?.(e);
  };

  const variantClasses = {
    primary:
      'bg-[#8E293D] text-white hover:bg-[#742031] shadow-[0_6px_20px_-6px_rgba(142,41,61,0.45)] border border-[#8E293D]',
    secondary:
      'bg-white text-[#231C19] border border-[#E6DFD6] hover:bg-[#F2EEE9] shadow-sm',
    ghost:
      'bg-transparent text-[#6E625B] hover:text-[#231C19] hover:bg-[#F2EEE9]/70 border border-transparent',
  }[variant];

  const sizeClasses = {
    md: 'min-h-[44px] px-5 py-2.5 text-sm',
    lg: 'min-h-[52px] px-7 py-3.5 text-base',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight whitespace-nowrap shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E293D] disabled:opacity-45 disabled:pointer-events-none cursor-pointer ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          style={{ left: ripple.x, top: ripple.y }}
          className="pointer-events-none absolute w-24 h-24 rounded-full bg-white/30 animate-ripple"
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
