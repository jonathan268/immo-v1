'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs min-h-[32px]', md: 'px-5 py-3 sm:py-2.5 text-sm min-h-[44px] sm:min-h-[40px]', lg: 'px-7 py-4 sm:py-3.5 text-base min-h-[48px] sm:min-h-[44px]' };
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--body-bg)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

  const variants: Record<string, string> = {
    primary:
      'bg-primary-700/90 text-white backdrop-blur-sm border border-[var(--glass-border)] hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-700/20 active:bg-primary-800',
    secondary:
      'bg-[var(--glass-bg)] text-primary-800 backdrop-blur-md border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] hover:shadow-lg active:bg-[var(--glass-bg-hover)]',
    danger:
      'bg-red-600/85 text-white backdrop-blur-sm border border-[var(--glass-border)] hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/20 active:bg-red-700',
    ghost:
      'text-primary-700/70 hover:bg-[var(--glass-bg-hover)] hover:text-primary-800 active:bg-[var(--glass-bg-hover)] backdrop-blur-sm',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
