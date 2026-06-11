'use client';

import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary-800/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border px-4 py-3 sm:py-2.5 text-base sm:text-sm text-primary-900 placeholder-primary-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 ${
              icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/30'
                : 'border-[var(--glass-border)] hover:border-[var(--glass-border-hover)]'
            } min-h-[44px] ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
